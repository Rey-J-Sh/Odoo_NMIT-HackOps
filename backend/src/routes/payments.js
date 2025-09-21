const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all payments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', customer_id = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, c.name as contact_name, c.email as contact_email, i.invoice_number
      FROM payments p 
      LEFT JOIN contacts c ON p.contact_id = c.id 
      LEFT JOIN invoices i ON p.invoice_id = i.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (p.payment_number ILIKE $${paramCount} OR c.name ILIKE $${paramCount} OR i.invoice_number ILIKE $${paramCount})`;
      values.push(`%${search}%`);
    }

    if (customer_id) {
      paramCount++;
      query += ` AND p.contact_id = $${paramCount}`;
      values.push(customer_id);
    }

    query += ` ORDER BY p.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    values.push(limit, offset);

    const result = await pool.query(query, values);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) 
      FROM payments p 
      LEFT JOIN contacts c ON p.contact_id = c.id 
      LEFT JOIN invoices i ON p.invoice_id = i.id
      WHERE 1=1
    `;
    const countValues = [];
    let countParamCount = 0;

    if (search) {
      countParamCount++;
      countQuery += ` AND (p.payment_number ILIKE $${countParamCount} OR c.name ILIKE $${countParamCount} OR i.invoice_number ILIKE $${countParamCount})`;
      countValues.push(`%${search}%`);
    }

    if (customer_id) {
      countParamCount++;
      countQuery += ` AND p.contact_id = $${countParamCount}`;
      countValues.push(customer_id);
    }

    const countResult = await pool.query(countQuery, countValues);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      payments: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get payment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT p.*, c.name as contact_name, c.email as contact_email, c.phone as contact_phone,
              i.invoice_number, i.invoice_date, i.total_amount as invoice_total
       FROM payments p 
       LEFT JOIN contacts c ON p.contact_id = c.id 
       LEFT JOIN invoices i ON p.invoice_id = i.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new payment
router.post('/', authenticateToken, requireRole(['admin']), [
  body('invoice_id').isUUID(),
  body('contact_id').isUUID(),
  body('payment_date').isISO8601(),
  body('amount').isFloat({ min: 0.01 }),
  body('payment_method').optional().isIn(['cash', 'bank_transfer', 'cheque', 'card', 'upi']),
  body('reference').optional().trim(),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { invoice_id, contact_id, payment_date, amount, payment_method = 'cash', reference, notes } = req.body;

    // Verify invoice exists
    const invoiceResult = await pool.query(
      'SELECT id, total_amount, paid_amount FROM invoices WHERE id = $1',
      [invoice_id]
    );

    if (invoiceResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invoice not found' });
    }

    const invoice = invoiceResult.rows[0];

    // Verify contact exists
    const contactResult = await pool.query(
      'SELECT id FROM contacts WHERE id = $1 AND contact_type = $2 AND is_active = true',
      [contact_id, 'customer']
    );

    if (contactResult.rows.length === 0) {
      return res.status(400).json({ error: 'Contact not found' });
    }

    // Check if payment amount exceeds remaining balance
    const remainingBalance = invoice.total_amount - invoice.paid_amount;
    if (amount > remainingBalance) {
      return res.status(400).json({ 
        error: 'Payment amount exceeds remaining balance',
        remaining_balance: remainingBalance
      });
    }

    // Generate payment number
    const paymentNumberResult = await pool.query(
      'SELECT COALESCE(MAX(CAST(SUBSTRING(payment_number FROM \'[0-9]+\') AS INTEGER)), 0) + 1 as next_number FROM payments WHERE payment_number ~ \'^PAY-[0-9]+$\''
    );
    const paymentNumber = `PAY-${String(paymentNumberResult.rows[0].next_number).padStart(6, '0')}`;

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create payment
      const paymentResult = await client.query(
        'INSERT INTO payments (payment_number, invoice_id, contact_id, payment_date, amount, payment_method, reference, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
        [paymentNumber, invoice_id, contact_id, payment_date, amount, payment_method, reference, notes]
      );

      // Update invoice paid amount and status
      const newPaidAmount = invoice.paid_amount + amount;
      const newStatus = newPaidAmount >= invoice.total_amount ? 'paid' : 
                       newPaidAmount > 0 ? 'partially_paid' : 'open';

      await client.query(
        'UPDATE invoices SET paid_amount = $1, status = $2, updated_at = NOW() WHERE id = $3',
        [newPaidAmount, newStatus, invoice_id]
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
    console.error('Create payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update payment
router.put('/:id', authenticateToken, requireRole(['admin']), [
  body('payment_date').optional().isISO8601(),
  body('amount').optional().isFloat({ min: 0.01 }),
  body('payment_method').optional().isIn(['cash', 'bank_transfer', 'cheque', 'card', 'upi']),
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
      'SELECT id FROM payments WHERE id = $1',
      [id]
    );

    if (existingPayment.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
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
      UPDATE payments 
      SET ${updates.join(', ')} 
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete payment
router.delete('/:id', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;

    // Get payment details to update invoice status
    const paymentResult = await pool.query(
      'SELECT invoice_id, amount FROM payments WHERE id = $1',
      [id]
    );

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = paymentResult.rows[0];

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Delete payment
      await client.query('DELETE FROM payments WHERE id = $1', [id]);

      // Update invoice paid amount and status
      const invoiceResult = await client.query(
        'SELECT total_amount, paid_amount FROM invoices WHERE id = $1',
        [payment.invoice_id]
      );

      if (invoiceResult.rows.length > 0) {
        const invoice = invoiceResult.rows[0];
        const newPaidAmount = invoice.paid_amount - payment.amount;
        const newStatus = newPaidAmount >= invoice.total_amount ? 'paid' : 
                         newPaidAmount > 0 ? 'partially_paid' : 'open';

        await client.query(
          'UPDATE invoices SET paid_amount = $1, status = $2, updated_at = NOW() WHERE id = $3',
          [newPaidAmount, newStatus, payment.invoice_id]
        );
      }

      await client.query('COMMIT');

      res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
