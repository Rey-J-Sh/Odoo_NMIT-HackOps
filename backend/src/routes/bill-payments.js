const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all bill payments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', vendor_id = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT bp.*, c.name as vendor_name, c.email as vendor_email, vb.bill_number
      FROM bill_payments bp 
      LEFT JOIN contacts c ON bp.vendor_id = c.id 
      LEFT JOIN vendor_bills vb ON bp.vendor_bill_id = vb.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (bp.payment_number ILIKE $${paramCount} OR c.name ILIKE $${paramCount} OR vb.bill_number ILIKE $${paramCount})`;
      values.push(`%${search}%`);
    }

    if (vendor_id) {
      paramCount++;
      query += ` AND bp.vendor_id = $${paramCount}`;
      values.push(vendor_id);
    }

    query += ` ORDER BY bp.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) 
      FROM bill_payments bp 
      LEFT JOIN contacts c ON bp.vendor_id = c.id 
      LEFT JOIN vendor_bills vb ON bp.vendor_bill_id = vb.id
      WHERE 1=1
    `;
    const countValues = [];
    let countParamCount = 0;

    if (search) {
      countParamCount++;
      countQuery += ` AND (bp.payment_number ILIKE $${countParamCount} OR c.name ILIKE $${countParamCount} OR vb.bill_number ILIKE $${countParamCount})`;
      countValues.push(`%${search}%`);
    }

    if (vendor_id) {
      countParamCount++;
      countQuery += ` AND bp.vendor_id = $${countParamCount}`;
      countValues.push(vendor_id);
    }

    const countResult = await pool.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      bill_payments: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get bill payments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get bill payment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT bp.*, c.name as vendor_name, c.email as vendor_email, c.phone as vendor_phone,
              vb.bill_number, vb.bill_date, vb.total_amount as bill_total
       FROM bill_payments bp 
       LEFT JOIN contacts c ON bp.vendor_id = c.id 
       LEFT JOIN vendor_bills vb ON bp.vendor_bill_id = vb.id
       WHERE bp.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bill payment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get bill payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new bill payment
router.post('/', authenticateToken, [
  body('vendor_bill_id').isUUID(),
  body('vendor_id').isUUID(),
  body('payment_date').isISO8601(),
  body('amount').isFloat({ min: 0.01 }),
  body('payment_method').optional().isIn(['cash', 'bank_transfer', 'cheque', 'card']),
  body('reference').optional().trim(),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { vendor_bill_id, vendor_id, payment_date, amount, payment_method = 'cash', reference, notes } = req.body;

    // Verify vendor bill exists
    const billResult = await pool.query(
      'SELECT id, total_amount, paid_amount FROM vendor_bills WHERE id = $1',
      [vendor_bill_id]
    );

    if (billResult.rows.length === 0) {
      return res.status(400).json({ error: 'Vendor bill not found' });
    }

    const bill = billResult.rows[0];

    // Verify vendor exists
    const vendorResult = await pool.query(
      'SELECT id FROM contacts WHERE id = $1 AND contact_type = $2 AND is_active = true',
      [vendor_id, 'vendor']
    );

    if (vendorResult.rows.length === 0) {
      return res.status(400).json({ error: 'Vendor not found' });
    }

    // Check if payment amount exceeds remaining balance
    const remainingBalance = bill.total_amount - bill.paid_amount;
    if (amount > remainingBalance) {
      return res.status(400).json({ 
        error: 'Payment amount exceeds remaining balance',
        remaining_balance: remainingBalance
      });
    }

    // Generate payment number
    const paymentNumberResult = await pool.query(
      'SELECT COALESCE(MAX(CAST(SUBSTRING(payment_number FROM \'[0-9]+\') AS INTEGER)), 0) + 1 as next_number FROM bill_payments WHERE payment_number ~ \'^PAY-[0-9]+$\''
    );
    const paymentNumber = `PAY-${String(paymentNumberResult.rows[0].next_number).padStart(6, '0')}`;

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create bill payment
      const paymentResult = await client.query(
        'INSERT INTO bill_payments (payment_number, vendor_bill_id, vendor_id, payment_date, amount, payment_method, reference, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [paymentNumber, vendor_bill_id, vendor_id, payment_date, amount, payment_method, reference, notes]
      );

      // Update vendor bill paid amount and status
      const newPaidAmount = bill.paid_amount + amount;
      const newStatus = newPaidAmount >= bill.total_amount ? 'paid' : 
                       newPaidAmount > 0 ? 'partially_paid' : 'open';

      await client.query(
        'UPDATE vendor_bills SET paid_amount = $1, status = $2, updated_at = NOW() WHERE id = $3',
        [newPaidAmount, newStatus, vendor_bill_id]
      );

      await client.query('COMMIT');

      res.status(201).json(paymentResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create bill payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update bill payment
router.put('/:id', authenticateToken, [
  body('payment_date').optional().isISO8601(),
  body('amount').optional().isFloat({ min: 0.01 }),
  body('payment_method').optional().isIn(['cash', 'bank_transfer', 'cheque', 'card']),
  body('reference').optional().trim(),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { id } = req.params;
    const { payment_date, amount, payment_method, reference, notes } = req.body;

    // Check if payment exists
    const existingPayment = await pool.query(
      'SELECT id FROM bill_payments WHERE id = $1',
      [id]
    );

    if (existingPayment.rows.length === 0) {
      return res.status(404).json({ error: 'Bill payment not found' });
    }

    const updates = [];
    const values = [];
    let paramCount = 1;

    if (payment_date) {
      updates.push(`payment_date = $${paramCount}`);
      values.push(payment_date);
      paramCount++;
    }

    if (amount !== undefined) {
      updates.push(`amount = $${paramCount}`);
      values.push(amount);
      paramCount++;
    }

    if (payment_method) {
      updates.push(`payment_method = $${paramCount}`);
      values.push(payment_method);
      paramCount++;
    }

    if (reference !== undefined) {
      updates.push(`reference = $${paramCount}`);
      values.push(reference);
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

    values.push(id);

    const query = `
      UPDATE bill_payments 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update bill payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete bill payment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get payment details to update bill status
    const paymentResult = await pool.query(
      'SELECT vendor_bill_id, amount FROM bill_payments WHERE id = $1',
      [id]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Bill payment not found' });
    }

    const payment = paymentResult.rows[0];

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Delete payment
      await client.query('DELETE FROM bill_payments WHERE id = $1', [id]);

      // Update vendor bill paid amount and status
      const billResult = await client.query(
        'SELECT total_amount, paid_amount FROM vendor_bills WHERE id = $1',
        [payment.vendor_bill_id]
      );

      if (billResult.rows.length > 0) {
        const bill = billResult.rows[0];
        const newPaidAmount = bill.paid_amount - payment.amount;
        const newStatus = newPaidAmount >= bill.total_amount ? 'paid' : 
                         newPaidAmount > 0 ? 'partially_paid' : 'open';

        await client.query(
          'UPDATE vendor_bills SET paid_amount = $1, status = $2, updated_at = NOW() WHERE id = $3',
          [newPaidAmount, newStatus, payment.vendor_bill_id]
        );
      }

      await client.query('COMMIT');

      res.json({ message: 'Bill payment deleted successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete bill payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
