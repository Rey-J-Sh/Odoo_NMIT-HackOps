const express = require('express');
const { query, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all ledger entries
router.get('/', authenticateToken, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('start_date').optional().isISO8601(),
  query('end_date').optional().isISO8601(),
  query('account_id').optional().isUUID(),
  query('reference_type').optional().isIn(['invoice', 'payment', 'adjustment'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { 
      page = 1, 
      limit = 10, 
      start_date, 
      end_date, 
      account_id, 
      reference_type 
    } = req.query;
    
    const offset = (page - 1) * limit;

    let query = `
      SELECT le.*, 
             json_build_object(
               'code', a.code,
               'name', a.name,
               'type', a.type
             ) as accounts
      FROM ledger_entries le 
      LEFT JOIN accounts a ON le.account_id = a.id 
      WHERE 1=1
    `;
    
    const values = [];
    let paramCount = 0;

    if (start_date) {
      paramCount++;
      query += ` AND le.entry_date >= $${paramCount}`;
      values.push(start_date);
    }

    if (end_date) {
      paramCount++;
      query += ` AND le.entry_date <= $${paramCount}`;
      values.push(end_date);
    }

    if (account_id) {
      paramCount++;
      query += ` AND le.account_id = $${paramCount}`;
      values.push(account_id);
    }

    if (reference_type) {
      paramCount++;
      query += ` AND le.reference_type = $${paramCount}`;
      values.push(reference_type);
    }

    query += ` ORDER BY le.entry_date DESC, le.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) 
      FROM ledger_entries le 
      LEFT JOIN accounts a ON le.account_id = a.id 
      WHERE 1=1
    `;
    
    const countValues = [];
    let countParamCount = 0;

    if (start_date) {
      countParamCount++;
      countQuery += ` AND le.entry_date >= $${countParamCount}`;
      countValues.push(start_date);
    }

    if (end_date) {
      countParamCount++;
      countQuery += ` AND le.entry_date <= $${countParamCount}`;
      countValues.push(end_date);
    }

    if (account_id) {
      countParamCount++;
      countQuery += ` AND le.account_id = $${countParamCount}`;
      countValues.push(account_id);
    }

    if (reference_type) {
      countParamCount++;
      countQuery += ` AND le.reference_type = $${countParamCount}`;
      countValues.push(reference_type);
    }

    const countResult = await pool.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      ledger_entries: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get ledger entries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get ledger entry by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT le.*, 
              json_build_object(
                'code', a.code,
                'name', a.name,
                'type', a.type
              ) as accounts
       FROM ledger_entries le 
       LEFT JOIN accounts a ON le.account_id = a.id 
       WHERE le.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ledger entry not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get ledger entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new ledger entry
router.post('/', authenticateToken, [
  query('entry_date').isISO8601(),
  query('reference_type').isIn(['invoice', 'payment', 'adjustment']),
  query('reference_id').isUUID(),
  query('account_id').isUUID(),
  query('debit_amount').optional().isFloat({ min: 0 }),
  query('credit_amount').optional().isFloat({ min: 0 }),
  query('description').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { 
      entry_date, 
      reference_type, 
      reference_id, 
      account_id, 
      debit_amount = 0, 
      credit_amount = 0, 
      description 
    } = req.body;

    // Verify account exists
    const accountResult = await pool.query(
      'SELECT id FROM accounts WHERE id = $1 AND is_active = true',
      [account_id]
    );

    if (accountResult.rows.length === 0) {
      return res.status(400).json({ error: 'Account not found' });
    }

    // Validate that either debit or credit amount is provided, but not both
    if (debit_amount > 0 && credit_amount > 0) {
      return res.status(400).json({ error: 'Cannot have both debit and credit amounts' });
    }

    if (debit_amount <= 0 && credit_amount <= 0) {
      return res.status(400).json({ error: 'Must have either debit or credit amount' });
    }

    const result = await pool.query(
      'INSERT INTO ledger_entries (entry_date, reference_type, reference_id, account_id, debit_amount, credit_amount, description) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [entry_date, reference_type, reference_id, account_id, debit_amount, credit_amount, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create ledger entry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
