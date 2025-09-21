const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all invoices
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT i.*, 
             json_build_object(
               'name', c.name,
               'email', c.email,
               'phone', c.phone,
               'address', c.address
             ) as contacts
      FROM invoices i 
      LEFT JOIN contacts c ON i.contact_id = c.id 
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (i.invoice_number ILIKE $${paramCount} OR c.name ILIKE $${paramCount})`;
      values.push(`%${search}%`);
    }

    if (status) {
      paramCount++;
      query += ` AND i.status = $${paramCount}`;
      values.push(status);
    }

    query += ` ORDER BY i.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) 
      FROM invoices i 
      LEFT JOIN contacts c ON i.contact_id = c.id 
      WHERE 1=1
    `;
    const countValues = [];
    let countParamCount = 0;

    if (search) {
      countParamCount++;
      countQuery += ` AND (i.invoice_number ILIKE $${countParamCount} OR c.name ILIKE $${countParamCount})`;
      countValues.push(`%${search}%`);
    }

    if (status) {
      countParamCount++;
      countQuery += ` AND i.status = $${countParamCount}`;
      countValues.push(status);
    }

    const countResult = await pool.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      invoices: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get invoice by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get invoice with contact details
    const invoiceResult = await pool.query(
      `SELECT i.*, c.name as contact_name, c.email as contact_email, c.phone as contact_phone, c.address as contact_address
       FROM invoices i 
       LEFT JOIN contacts c ON i.contact_id = c.id 
       WHERE i.id = $1`,
      [id]
    );

    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Get invoice line items
    const lineItemsResult = await pool.query(
      `SELECT il.*, p.name as product_name, p.sku as product_sku
       FROM invoice_lines il 
       LEFT JOIN products p ON il.product_id = p.id 
       WHERE il.invoice_id = $1
       ORDER BY il.created_at`,
      [id]
    );

    // Get payments
    const paymentsResult = await pool.query(
      'SELECT * FROM payments WHERE invoice_id = $1 ORDER BY payment_date',
      [id]
    );

    const invoice = invoiceResult.rows[0];
    invoice.line_items = lineItemsResult.rows;
    invoice.payments = paymentsResult.rows;

    res.json(invoice);
  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new invoice
router.post('/', authenticateToken, requireRole(['admin', 'invoicing_user']), [
  body('contact_id').isUUID(),
  body('invoice_date').isISO8601(),
  body('due_date').optional().isISO8601(),
  body('status').optional().isIn(['draft', 'open', 'partially_paid', 'paid', 'cancelled']),
  body('notes').optional().trim(),
  body('line_items').isArray({ min: 1 }),
  body('line_items.*.description').trim().isLength({ min: 1 }),
  body('line_items.*.quantity').isFloat({ min: 0.01 }),
  body('line_items.*.unit_price').isFloat({ min: 0 }),
  body('line_items.*.tax_percentage').optional().isFloat({ min: 0, max: 100 }),
  body('sale_order_id').optional().isUUID()
], async (req, res) => {
  try {
    console.log('Invoice creation request received:', req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { contact_id, invoice_date, due_date, status = 'draft', notes, line_items, sale_order_id } = req.body;

    // Verify contact exists
    const contactResult = await pool.query(
      'SELECT id FROM contacts WHERE id = $1 AND is_active = true',
      [contact_id]
    );

    if (contactResult.rows.length === 0) {
      return res.status(400).json({ error: 'Contact not found' });
    }

    // Verify sale order exists if provided
    if (sale_order_id) {
      const saleOrderResult = await pool.query(
        'SELECT id FROM sale_orders WHERE id = $1',
        [sale_order_id]
      );

      if (saleOrderResult.rows.length === 0) {
        return res.status(400).json({ error: 'Sale order not found' });
      }
    }

    // Generate invoice number
    const invoiceNumberResult = await pool.query(
      'SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM \'[0-9]+\') AS INTEGER)), 0) + 1 as next_number FROM invoices WHERE invoice_number ~ \'^INV-[0-9]+$\''
    );
    const invoiceNumber = `INV-${String(invoiceNumberResult.rows[0].next_number).padStart(6, '0')}`;

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create invoice
      const invoiceResult = await client.query(
        'INSERT INTO invoices (invoice_number, contact_id, sale_order_id, invoice_date, due_date, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [invoiceNumber, contact_id, sale_order_id, invoice_date, due_date, status, notes]
      );

      const invoice = invoiceResult.rows[0];

      // Create line items
      for (const lineItem of line_items) {
        const { product_id, description, quantity, unit_price, tax_percentage = 0 } = lineItem;
        const line_total = quantity * unit_price;

        await client.query(
          'INSERT INTO invoice_lines (invoice_id, product_id, description, quantity, unit_price, tax_percentage, line_total) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [invoice.id, product_id, description, quantity, unit_price, tax_percentage, line_total]
        );
      }

      await client.query('COMMIT');

      // Get the complete invoice with line items
      const completeInvoiceResult = await pool.query(
        `SELECT i.*, c.name as contact_name, c.email as contact_email
         FROM invoices i 
         LEFT JOIN contacts c ON i.contact_id = c.id 
         WHERE i.id = $1`,
        [invoice.id]
      );

      const lineItemsResult = await pool.query(
        'SELECT * FROM invoice_lines WHERE invoice_id = $1 ORDER BY created_at',
        [invoice.id]
      );

      const completeInvoice = completeInvoiceResult.rows[0];
      completeInvoice.line_items = lineItemsResult.rows;

      res.status(201).json(completeInvoice);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create invoice error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Update invoice
router.put('/:id', authenticateToken, requireRole(['admin']), [
  body('contact_id').optional().isUUID(),
  body('invoice_date').optional().isISO8601(),
  body('due_date').optional().isISO8601(),
  body('status').optional().isIn(['draft', 'open', 'partially_paid', 'paid', 'cancelled']),
  body('notes').optional().trim(),
  body('sale_order_id').optional().isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { id } = req.params;
    const { contact_id, invoice_date, due_date, status, notes, sale_order_id } = req.body;

    // Check if invoice exists
    const existingInvoice = await pool.query(
      'SELECT id FROM invoices WHERE id = $1',
      [id]
    );

    if (existingInvoice.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Verify contact exists if provided
    if (contact_id) {
      const contactResult = await pool.query(
        'SELECT id FROM contacts WHERE id = $1 AND is_active = true',
        [contact_id]
      );

      if (contactResult.rows.length === 0) {
        return res.status(400).json({ error: 'Contact not found' });
      }
    }

    // Verify sale order exists if provided
    if (sale_order_id) {
      const saleOrderResult = await pool.query(
        'SELECT id FROM sale_orders WHERE id = $1',
        [sale_order_id]
      );

      if (saleOrderResult.rows.length === 0) {
        return res.status(400).json({ error: 'Sale order not found' });
      }
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (contact_id) {
      updates.push(`contact_id = $${paramCount}`);
      values.push(contact_id);
      paramCount++;
    }

    if (invoice_date) {
      updates.push(`invoice_date = $${paramCount}`);
      values.push(invoice_date);
      paramCount++;
    }

    if (due_date !== undefined) {
      updates.push(`due_date = $${paramCount}`);
      values.push(due_date);
      paramCount++;
    }

    if (status) {
      updates.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    if (notes !== undefined) {
      updates.push(`notes = $${paramCount}`);
      values.push(notes);
      paramCount++;
    }

    if (sale_order_id !== undefined) {
      updates.push(`sale_order_id = $${paramCount}`);
      values.push(sale_order_id);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE invoices 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete invoice
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM invoices WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

