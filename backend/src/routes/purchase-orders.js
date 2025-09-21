const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all purchase orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT po.*, c.name as vendor_name, c.email as vendor_email 
      FROM purchase_orders po 
      LEFT JOIN contacts c ON po.vendor_id = c.id 
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (po.po_number ILIKE $${paramCount} OR c.name ILIKE $${paramCount})`;
      values.push(`%${search}%`);
    }

    if (status) {
      paramCount++;
      query += ` AND po.status = $${paramCount}`;
      values.push(status);
    }

    query += ` ORDER BY po.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) 
      FROM purchase_orders po 
      LEFT JOIN contacts c ON po.vendor_id = c.id 
      WHERE 1=1
    `;
    const countValues = [];
    let countParamCount = 0;

    if (search) {
      countParamCount++;
      countQuery += ` AND (po.po_number ILIKE $${countParamCount} OR c.name ILIKE $${countParamCount})`;
      countValues.push(`%${search}%`);
    }

    if (status) {
      countParamCount++;
      countQuery += ` AND po.status = $${countParamCount}`;
      countValues.push(status);
    }

    const countResult = await pool.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      purchase_orders: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get purchase orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get purchase order by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get purchase order with vendor details
    const poResult = await pool.query(
      `SELECT po.*, c.name as vendor_name, c.email as vendor_email, c.phone as vendor_phone, c.address as vendor_address
       FROM purchase_orders po 
       LEFT JOIN contacts c ON po.vendor_id = c.id 
       WHERE po.id = $1`,
      [id]
    );

    if (poResult.rows.length === 0) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    // Get line items
    const lineItemsResult = await pool.query(
      `SELECT pol.*, p.name as product_name, p.sku as product_sku
       FROM purchase_order_lines pol 
       LEFT JOIN products p ON pol.product_id = p.id 
       WHERE pol.purchase_order_id = $1
       ORDER BY pol.created_at`,
      [id]
    );

    const purchaseOrder = poResult.rows[0];
    purchaseOrder.line_items = lineItemsResult.rows;

    res.json(purchaseOrder);
  } catch (error) {
    console.error('Get purchase order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new purchase order
router.post('/', authenticateToken, [
  body('vendor_id').isUUID(),
  body('po_date').isISO8601(),
  body('due_date').optional().isISO8601(),
  body('status').optional().isIn(['draft', 'sent', 'received', 'cancelled']),
  body('notes').optional().trim(),
  body('line_items').isArray({ min: 1 }),
  body('line_items.*.product_id').isUUID(),
  body('line_items.*.quantity').isFloat({ min: 0.01 }),
  body('line_items.*.unit_price').isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { vendor_id, po_date, due_date, status = 'draft', notes, line_items } = req.body;

    // Verify vendor exists
    const vendorResult = await pool.query(
      'SELECT id FROM contacts WHERE id = $1 AND contact_type = $2 AND is_active = true',
      [vendor_id, 'vendor']
    );

    if (vendorResult.rows.length === 0) {
      return res.status(400).json({ error: 'Vendor not found' });
    }

    // Generate PO number
    const poNumberResult = await pool.query(
      'SELECT COALESCE(MAX(CAST(SUBSTRING(po_number FROM \'[0-9]+\') AS INTEGER)), 0) + 1 as next_number FROM purchase_orders WHERE po_number ~ \'^PO-[0-9]+$\''
    );
    const poNumber = `PO-${String(poNumberResult.rows[0].next_number).padStart(6, '0')}`;

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create purchase order
      const poResult = await client.query(
        'INSERT INTO purchase_orders (po_number, vendor_id, po_date, due_date, status, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [poNumber, vendor_id, po_date, due_date, status, notes]
      );

      const purchaseOrder = poResult.rows[0];

      // Create line items
      for (const lineItem of line_items) {
        const { product_id, quantity, unit_price } = lineItem;
        const line_total = quantity * unit_price;

        await client.query(
          'INSERT INTO purchase_order_lines (purchase_order_id, product_id, quantity, unit_price, line_total) VALUES ($1, $2, $3, $4, $5)',
          [purchaseOrder.id, product_id, quantity, unit_price, line_total]
        );
      }

      await client.query('COMMIT');

      // Get the complete purchase order with line items
      const completePOResult = await pool.query(
        `SELECT po.*, c.name as vendor_name, c.email as vendor_email
         FROM purchase_orders po 
         LEFT JOIN contacts c ON po.vendor_id = c.id 
         WHERE po.id = $1`,
        [purchaseOrder.id]
      );

      const lineItemsResult = await pool.query(
        'SELECT * FROM purchase_order_lines WHERE purchase_order_id = $1 ORDER BY created_at',
        [purchaseOrder.id]
      );

      const completePO = completePOResult.rows[0];
      completePO.line_items = lineItemsResult.rows;

      res.status(201).json(completePO);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create purchase order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update purchase order
router.put('/:id', authenticateToken, [
  body('vendor_id').optional().isUUID(),
  body('po_date').optional().isISO8601(),
  body('due_date').optional().isISO8601(),
  body('status').optional().isIn(['draft', 'sent', 'received', 'cancelled']),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { id } = req.params;
    const { vendor_id, po_date, due_date, status, notes } = req.body;

    // Check if purchase order exists
    const existingPO = await pool.query(
      'SELECT id FROM purchase_orders WHERE id = $1',
      [id]
    );

    if (existingPO.rows.length === 0) {
      return res.status(404).json({ error: 'Purchase order not found' });
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

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (vendor_id) {
      updates.push(`vendor_id = $${paramCount}`);
      values.push(vendor_id);
      paramCount++;
    }

    if (po_date) {
      updates.push(`po_date = $${paramCount}`);
      values.push(po_date);
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

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE purchase_orders 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update purchase order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete purchase order
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM purchase_orders WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Purchase order not found' });
    }

    res.json({ message: 'Purchase order deleted successfully' });
  } catch (error) {
    console.error('Delete purchase order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
