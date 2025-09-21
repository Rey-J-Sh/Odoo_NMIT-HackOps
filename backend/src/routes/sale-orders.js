const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all sale orders
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT so.*, c.name as customer_name, c.email as customer_email 
      FROM sale_orders so 
      LEFT JOIN contacts c ON so.customer_id = c.id 
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (so.so_number ILIKE $${paramCount} OR c.name ILIKE $${paramCount})`;
      values.push(`%${search}%`);
    }

    if (status) {
      paramCount++;
      query += ` AND so.status = $${paramCount}`;
      values.push(status);
    }

    query += ` ORDER BY so.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) 
      FROM sale_orders so 
      LEFT JOIN contacts c ON so.customer_id = c.id 
      WHERE 1=1
    `;
    const countValues = [];
    let countParamCount = 0;

    if (search) {
      countParamCount++;
      countQuery += ` AND (so.so_number ILIKE $${countParamCount} OR c.name ILIKE $${countParamCount})`;
      countValues.push(`%${search}%`);
    }

    if (status) {
      countParamCount++;
      countQuery += ` AND so.status = $${countParamCount}`;
      countValues.push(status);
    }

    const countResult = await pool.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      sale_orders: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get sale orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get sale order by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get sale order with customer details
    const soResult = await pool.query(
      `SELECT so.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone, c.address as customer_address
       FROM sale_orders so 
       LEFT JOIN contacts c ON so.customer_id = c.id 
       WHERE so.id = $1`,
      [id]
    );

    if (soResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sale order not found' });
    }

    // Get line items
    const lineItemsResult = await pool.query(
      `SELECT sol.*, p.name as product_name, p.sku as product_sku
       FROM sale_order_lines sol 
       LEFT JOIN products p ON sol.product_id = p.id 
       WHERE sol.sale_order_id = $1
       ORDER BY sol.created_at`,
      [id]
    );

    const saleOrder = soResult.rows[0];
    saleOrder.line_items = lineItemsResult.rows;

    res.json(saleOrder);
  } catch (error) {
    console.error('Get sale order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new sale order
router.post('/', authenticateToken, [
  body('customer_id').isUUID(),
  body('so_date').isISO8601(),
  body('due_date').optional().isISO8601(),
  body('status').optional().isIn(['draft', 'sent', 'confirmed', 'cancelled']),
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

    const { customer_id, so_date, due_date, status = 'draft', notes, line_items } = req.body;

    // Verify customer exists
    const customerResult = await pool.query(
      'SELECT id FROM contacts WHERE id = $1 AND contact_type = $2 AND is_active = true',
      [customer_id, 'customer']
    );

    if (customerResult.rows.length === 0) {
      return res.status(400).json({ error: 'Customer not found' });
    }

    // Generate SO number
    const soNumberResult = await pool.query(
      'SELECT COALESCE(MAX(CAST(SUBSTRING(so_number FROM \'[0-9]+\') AS INTEGER)), 0) + 1 as next_number FROM sale_orders WHERE so_number ~ \'^SO-[0-9]+$\''
    );
    const soNumber = `SO-${String(soNumberResult.rows[0].next_number).padStart(6, '0')}`;

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create sale order
      const soResult = await client.query(
        'INSERT INTO sale_orders (so_number, customer_id, so_date, due_date, status, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [soNumber, customer_id, so_date, due_date, status, notes]
      );

      const saleOrder = soResult.rows[0];

      // Create line items
      for (const lineItem of line_items) {
        const { product_id, quantity, unit_price } = lineItem;
        const line_total = quantity * unit_price;

        await client.query(
          'INSERT INTO sale_order_lines (sale_order_id, product_id, quantity, unit_price, line_total) VALUES ($1, $2, $3, $4, $5)',
          [saleOrder.id, product_id, quantity, unit_price, line_total]
        );
      }

      await client.query('COMMIT');

      // Get the complete sale order with line items
      const completeSOResult = await pool.query(
        `SELECT so.*, c.name as customer_name, c.email as customer_email
         FROM sale_orders so 
         LEFT JOIN contacts c ON so.customer_id = c.id 
         WHERE so.id = $1`,
        [saleOrder.id]
      );

      const lineItemsResult = await pool.query(
        'SELECT * FROM sale_order_lines WHERE sale_order_id = $1 ORDER BY created_at',
        [saleOrder.id]
      );

      const completeSO = completeSOResult.rows[0];
      completeSO.line_items = lineItemsResult.rows;

      res.status(201).json(completeSO);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create sale order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update sale order
router.put('/:id', authenticateToken, [
  body('customer_id').optional().isUUID(),
  body('so_date').optional().isISO8601(),
  body('due_date').optional().isISO8601(),
  body('status').optional().isIn(['draft', 'sent', 'confirmed', 'cancelled']),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { id } = req.params;
    const { customer_id, so_date, due_date, status, notes } = req.body;

    // Check if sale order exists
    const existingSO = await pool.query(
      'SELECT id FROM sale_orders WHERE id = $1',
      [id]
    );

    if (existingSO.rows.length === 0) {
      return res.status(404).json({ error: 'Sale order not found' });
    }

    // Verify customer exists if provided
    if (customer_id) {
      const customerResult = await pool.query(
        'SELECT id FROM contacts WHERE id = $1 AND contact_type = $2 AND is_active = true',
        [customer_id, 'customer']
      );

      if (customerResult.rows.length === 0) {
        return res.status(400).json({ error: 'Customer not found' });
      }
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (customer_id) {
      updates.push(`customer_id = $${paramCount}`);
      values.push(customer_id);
      paramCount++;
    }

    if (so_date) {
      updates.push(`so_date = $${paramCount}`);
      values.push(so_date);
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
      UPDATE sale_orders 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update sale order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete sale order
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM sale_orders WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sale order not found' });
    }

    res.json({ message: 'Sale order deleted successfully' });
  } catch (error) {
    console.error('Delete sale order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
