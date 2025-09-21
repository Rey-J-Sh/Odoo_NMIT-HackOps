const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all vendor bills
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT vb.*, c.name as vendor_name, c.email as vendor_email, po.po_number
      FROM vendor_bills vb 
      LEFT JOIN contacts c ON vb.vendor_id = c.id 
      LEFT JOIN purchase_orders po ON vb.purchase_order_id = po.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (vb.bill_number ILIKE $${paramCount} OR c.name ILIKE $${paramCount})`;
      values.push(`%${search}%`);
    }

    if (status) {
      paramCount++;
      query += ` AND vb.status = $${paramCount}`;
      values.push(status);
    }

    query += ` ORDER BY vb.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) 
      FROM vendor_bills vb 
      LEFT JOIN contacts c ON vb.vendor_id = c.id 
      WHERE 1=1
    `;
    const countValues = [];
    let countParamCount = 0;

    if (search) {
      countParamCount++;
      countQuery += ` AND (vb.bill_number ILIKE $${countParamCount} OR c.name ILIKE $${countParamCount})`;
      countValues.push(`%${search}%`);
    }

    if (status) {
      countParamCount++;
      countQuery += ` AND vb.status = $${countParamCount}`;
      countValues.push(status);
    }

    const countResult = await pool.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      vendor_bills: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get vendor bills error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get vendor bill by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get vendor bill with vendor details
    const billResult = await pool.query(
      `SELECT vb.*, c.name as vendor_name, c.email as vendor_email, c.phone as vendor_phone, c.address as vendor_address,
              po.po_number, po.po_date
       FROM vendor_bills vb 
       LEFT JOIN contacts c ON vb.vendor_id = c.id 
       LEFT JOIN purchase_orders po ON vb.purchase_order_id = po.id
       WHERE vb.id = $1`,
      [id]
    );

    if (billResult.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor bill not found' });
    }

    // Get line items
    const lineItemsResult = await pool.query(
      `SELECT vbl.*, p.name as product_name, p.sku as product_sku
       FROM vendor_bill_lines vbl 
       LEFT JOIN products p ON vbl.product_id = p.id 
       WHERE vbl.vendor_bill_id = $1
       ORDER BY vbl.created_at`,
      [id]
    );

    // Get payments
    const paymentsResult = await pool.query(
      'SELECT * FROM bill_payments WHERE vendor_bill_id = $1 ORDER BY payment_date',
      [id]
    );

    const vendorBill = billResult.rows[0];
    vendorBill.line_items = lineItemsResult.rows;
    vendorBill.payments = paymentsResult.rows;

    res.json(vendorBill);
  } catch (error) {
    console.error('Get vendor bill error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new vendor bill
router.post('/', authenticateToken, [
  body('vendor_id').isUUID(),
  body('bill_date').isISO8601(),
  body('due_date').optional().isISO8601(),
  body('status').optional().isIn(['draft', 'open', 'partially_paid', 'paid', 'cancelled']),
  body('notes').optional().trim(),
  body('line_items').isArray({ min: 1 }),
  body('line_items.*.description').trim().isLength({ min: 1 }),
  body('line_items.*.quantity').isFloat({ min: 0.01 }),
  body('line_items.*.unit_price').isFloat({ min: 0 }),
  body('line_items.*.tax_percentage').optional().isFloat({ min: 0, max: 100 }),
  body('purchase_order_id').optional().isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { vendor_id, bill_date, due_date, status = 'draft', notes, line_items, purchase_order_id } = req.body;

    // Verify vendor exists
    const vendorResult = await pool.query(
      'SELECT id FROM contacts WHERE id = $1 AND contact_type = $2 AND is_active = true',
      [vendor_id, 'vendor']
    );

    if (vendorResult.rows.length === 0) {
      return res.status(400).json({ error: 'Vendor not found' });
    }

    // Verify purchase order exists if provided
    if (purchase_order_id) {
      const poResult = await pool.query(
        'SELECT id FROM purchase_orders WHERE id = $1',
        [purchase_order_id]
      );

      if (poResult.rows.length === 0) {
        return res.status(400).json({ error: 'Purchase order not found' });
      }
    }

    // Generate bill number
    const billNumberResult = await pool.query(
      'SELECT COALESCE(MAX(CAST(SUBSTRING(bill_number FROM \'[0-9]+\') AS INTEGER)), 0) + 1 as next_number FROM vendor_bills WHERE bill_number ~ \'^BILL-[0-9]+$\''
    );
    const billNumber = `BILL-${String(billNumberResult.rows[0].next_number).padStart(6, '0')}`;

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create vendor bill
      const billResult = await client.query(
        'INSERT INTO vendor_bills (bill_number, vendor_id, purchase_order_id, bill_date, due_date, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [billNumber, vendor_id, purchase_order_id, bill_date, due_date, status, notes]
      );

      const vendorBill = billResult.rows[0];

      // Create line items
      for (const lineItem of line_items) {
        const { product_id, description, quantity, unit_price, tax_percentage = 0 } = lineItem;
        const line_total = quantity * unit_price;

        await client.query(
          'INSERT INTO vendor_bill_lines (vendor_bill_id, product_id, description, quantity, unit_price, tax_percentage, line_total) VALUES ($1, $2, $3, $4, $5, $6, $7)',
          [vendorBill.id, product_id, description, quantity, unit_price, tax_percentage, line_total]
        );
      }

      await client.query('COMMIT');

      // Get the complete vendor bill with line items
      const completeBillResult = await pool.query(
        `SELECT vb.*, c.name as vendor_name, c.email as vendor_email, po.po_number
         FROM vendor_bills vb 
         LEFT JOIN contacts c ON vb.vendor_id = c.id 
         LEFT JOIN purchase_orders po ON vb.purchase_order_id = po.id
         WHERE vb.id = $1`,
        [vendorBill.id]
      );

      const lineItemsResult = await pool.query(
        'SELECT * FROM vendor_bill_lines WHERE vendor_bill_id = $1 ORDER BY created_at',
        [vendorBill.id]
      );

      const completeBill = completeBillResult.rows[0];
      completeBill.line_items = lineItemsResult.rows;

      res.status(201).json(completeBill);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create vendor bill error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update vendor bill
router.put('/:id', authenticateToken, [
  body('vendor_id').optional().isUUID(),
  body('bill_date').optional().isISO8601(),
  body('due_date').optional().isISO8601(),
  body('status').optional().isIn(['draft', 'open', 'partially_paid', 'paid', 'cancelled']),
  body('notes').optional().trim(),
  body('purchase_order_id').optional().isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { id } = req.params;
    const { vendor_id, bill_date, due_date, status, notes, purchase_order_id } = req.body;

    // Check if vendor bill exists
    const existingBill = await pool.query(
      'SELECT id FROM vendor_bills WHERE id = $1',
      [id]
    );

    if (existingBill.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor bill not found' });
    }

    // Verify vendor exists if provided
    if (vendor_id) {
      const vendorResult = await pool.query(
        'SELECT id FROM contacts WHERE id = $1 AND contact_type = $2 AND is_active = true',
        [vendor_id, 'vendor']
      );

      if (vendorResult.rows.length === 0) {
        return res.status(400).json({ error: 'Vendor not found' });
      }
    }

    // Verify purchase order exists if provided
    if (purchase_order_id) {
      const poResult = await pool.query(
        'SELECT id FROM purchase_orders WHERE id = $1',
        [purchase_order_id]
      );

      if (poResult.rows.length === 0) {
        return res.status(400).json({ error: 'Purchase order not found' });
      }
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (vendor_id) {
      updates.push(`vendor_id = $${paramCount}`);
      values.push(vendor_id);
      paramCount++;
    }

    if (bill_date) {
      updates.push(`bill_date = $${paramCount}`);
      values.push(bill_date);
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

    if (purchase_order_id !== undefined) {
      updates.push(`purchase_order_id = $${paramCount}`);
      values.push(purchase_order_id);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE vendor_bills 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update vendor bill error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete vendor bill
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM vendor_bills WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor bill not found' });
    }

    res.json({ message: 'Vendor bill deleted successfully' });
  } catch (error) {
    console.error('Delete vendor bill error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
