const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all products
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM products WHERE is_active = true';
    const values = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR sku ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      values.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM products WHERE is_active = true';
    const countValues = [];
    let countParamCount = 0;

    if (search) {
      countParamCount++;
      countQuery += ` AND (name ILIKE $${countParamCount} OR sku ILIKE $${countParamCount} OR description ILIKE $${countParamCount})`;
      countValues.push(`%${search}%`);
    }

    const countResult = await pool.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      products: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1 AND is_active = true',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new product
router.post('/', authenticateToken, requireRole(['admin']), [
  body('sku').trim().isLength({ min: 1 }),
  body('name').trim().isLength({ min: 2 }),
  body('price').isFloat({ min: 0 }),
  body('tax_percentage').optional().isFloat({ min: 0, max: 100 }),
  body('hsn_code').optional().trim(),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { sku, name, description, price, tax_percentage = 0, hsn_code } = req.body;

    // Check if SKU already exists
    const existingProduct = await pool.query(
      'SELECT id FROM products WHERE sku = $1 AND is_active = true',
      [sku]
    );

    if (existingProduct.rows.length > 0) {
      return res.status(400).json({ error: 'SKU already exists' });
    }

    const result = await pool.query(
      'INSERT INTO products (sku, name, description, price, tax_percentage, hsn_code) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [sku, name, description, price, tax_percentage, hsn_code]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update product
router.put('/:id', authenticateToken, requireRole(['admin']), [
  body('sku').optional().trim().isLength({ min: 1 }),
  body('name').optional().trim().isLength({ min: 2 }),
  body('price').optional().isFloat({ min: 0 }),
  body('tax_percentage').optional().isFloat({ min: 0, max: 100 }),
  body('hsn_code').optional().trim(),
  body('description').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { id } = req.params;
    const { sku, name, description, price, tax_percentage, hsn_code } = req.body;

    // Check if product exists
    const existingProduct = await pool.query(
      'SELECT id FROM products WHERE id = $1 AND is_active = true',
      [id]
    );

    if (existingProduct.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if SKU is already taken by another product
    if (sku) {
      const skuCheck = await pool.query(
        'SELECT id FROM products WHERE sku = $1 AND id != $2 AND is_active = true',
        [sku, id]
      );

      if (skuCheck.rows.length > 0) {
        return res.status(400).json({ error: 'SKU already exists' });
      }
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (sku) {
      updates.push(`sku = $${paramCount}`);
      values.push(sku);
      paramCount++;
    }

    if (name) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }

    if (price !== undefined) {
      updates.push(`price = $${paramCount}`);
      values.push(price);
      paramCount++;
    }

    if (tax_percentage !== undefined) {
      updates.push(`tax_percentage = $${paramCount}`);
      values.push(tax_percentage);
      paramCount++;
    }

    if (hsn_code !== undefined) {
      updates.push(`hsn_code = $${paramCount}`);
      values.push(hsn_code);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE products 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete product (soft delete)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'UPDATE products SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;

