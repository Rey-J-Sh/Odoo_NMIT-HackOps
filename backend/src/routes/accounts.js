const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all accounts (Chart of Accounts)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', type = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM accounts WHERE is_active = true';
    const values = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (name ILIKE $${paramCount} OR code ILIKE $${paramCount})`;
      values.push(`%${search}%`);
    }

    if (type) {
      paramCount++;
      query += ` AND type = $${paramCount}`;
      values.push(type);
    }

    query += ` ORDER BY code, name LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM accounts WHERE is_active = true';
    const countValues = [];
    let countParamCount = 0;

    if (search) {
      countParamCount++;
      countQuery += ` AND (name ILIKE $${countParamCount} OR code ILIKE $${countParamCount})`;
      countValues.push(`%${search}%`);
    }

    if (type) {
      countParamCount++;
      countQuery += ` AND type = $${countParamCount}`;
      countValues.push(type);
    }

    const countResult = await pool.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      accounts: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get account by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM accounts WHERE id = $1 AND is_active = true',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new account
router.post('/', authenticateToken, requireRole(['admin']), [
  body('code').trim().isLength({ min: 1 }),
  body('name').trim().isLength({ min: 2 }),
  body('type').isIn(['asset', 'liability', 'equity', 'revenue', 'expense']),
  body('parent_id').optional().isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { code, name, type, parent_id } = req.body;

    // Check if code already exists
    const existingAccount = await pool.query(
      'SELECT id FROM accounts WHERE code = $1 AND is_active = true',
      [code]
    );

    if (existingAccount.rows.length > 0) {
      return res.status(400).json({ error: 'Account code already exists' });
    }

    // Verify parent account exists if provided
    if (parent_id) {
      const parentResult = await pool.query(
        'SELECT id FROM accounts WHERE id = $1 AND is_active = true',
        [parent_id]
      );

      if (parentResult.rows.length === 0) {
        return res.status(400).json({ error: 'Parent account not found' });
      }
    }

    const result = await pool.query(
      'INSERT INTO accounts (code, name, type, parent_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [code, name, type, parent_id]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update account
router.put('/:id', authenticateToken, requireRole(['admin']), [
  body('code').optional().trim().isLength({ min: 1 }),
  body('name').optional().trim().isLength({ min: 2 }),
  body('type').optional().isIn(['asset', 'liability', 'equity', 'revenue', 'expense']),
  body('parent_id').optional().isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { id } = req.params;
    const { code, name, type, parent_id } = req.body;

    // Check if account exists
    const existingAccount = await pool.query(
      'SELECT id FROM accounts WHERE id = $1 AND is_active = true',
      [id]
    );

    if (existingAccount.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Check if code is already taken by another account
    if (code) {
      const codeCheck = await pool.query(
        'SELECT id FROM accounts WHERE code = $1 AND id != $2 AND is_active = true',
        [code, id]
      );

      if (codeCheck.rows.length > 0) {
        return res.status(400).json({ error: 'Account code already exists' });
      }
    }

    // Verify parent account exists if provided
    if (parent_id) {
      const parentResult = await pool.query(
        'SELECT id FROM accounts WHERE id = $1 AND is_active = true',
        [parent_id]
      );

      if (parentResult.rows.length === 0) {
        return res.status(400).json({ error: 'Parent account not found' });
      }
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (code) {
      updates.push(`code = $${paramCount}`);
      values.push(code);
      paramCount++;
    }

    if (name) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (type) {
      updates.push(`type = $${paramCount}`);
      values.push(type);
      paramCount++;
    }

    if (parent_id !== undefined) {
      updates.push(`parent_id = $${paramCount}`);
      values.push(parent_id);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE accounts 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete account (soft delete)
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if account has child accounts
    const childAccounts = await pool.query(
      'SELECT id FROM accounts WHERE parent_id = $1 AND is_active = true',
      [id]
    );

    if (childAccounts.rows.length > 0) {
      return res.status(400).json({ error: 'Cannot delete account with child accounts' });
    }

    // Check if account has ledger entries
    const ledgerEntries = await pool.query(
      'SELECT id FROM ledger_entries WHERE account_id = $1',
      [id]
    );

    if (ledgerEntries.rows.length > 0) {
      return res.status(400).json({ error: 'Cannot delete account with existing transactions' });
    }

    const result = await pool.query(
      'UPDATE accounts SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
