const express = require('express');
const { query, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Partner Ledger Report
router.get('/partner-ledger', authenticateToken, [
  query('partner_type').optional().isIn(['customer', 'vendor']),
  query('partner_id').optional().isUUID(),
  query('start_date').optional().isISO8601(),
  query('end_date').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { partner_type, partner_id, start_date, end_date } = req.query;

    let query = `
      SELECT 
        le.entry_date,
        le.reference_type,
        le.reference_id,
        le.description,
        le.debit_amount,
        le.credit_amount,
        c.name as partner_name,
        c.contact_type,
        CASE 
          WHEN le.reference_type = 'invoice' THEN i.invoice_number
          WHEN le.reference_type = 'payment' THEN p.payment_number
          ELSE le.reference_id::text
        END as reference_number
      FROM ledger_entries le
      LEFT JOIN contacts c ON (
        CASE 
          WHEN le.reference_type = 'invoice' THEN i.contact_id
          WHEN le.reference_type = 'payment' THEN p.contact_id
          ELSE NULL
        END
      ) = c.id
      LEFT JOIN invoices i ON le.reference_type = 'invoice' AND le.reference_id = i.id
      LEFT JOIN payments p ON le.reference_type = 'payment' AND le.reference_id = p.id
      WHERE 1=1
    `;

    const values = [];
    let paramCount = 0;

    if (partner_type) {
      paramCount++;
      query += ` AND c.contact_type = $${paramCount}`;
      values.push(partner_type);
    }

    if (partner_id) {
      paramCount++;
      query += ` AND c.id = $${paramCount}`;
      values.push(partner_id);
    }

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

    query += ` ORDER BY c.name, le.entry_date, le.created_at`;

    const result = await pool.query(query, values);

    // Calculate running balance for each partner
    const partnerBalances = {};
    const processedEntries = result.rows.map(entry => {
      const partnerKey = entry.partner_name || 'Unknown';
      if (!partnerBalances[partnerKey]) {
        partnerBalances[partnerKey] = 0;
      }
      
      const balance = partnerBalances[partnerKey] + entry.debit_amount - entry.credit_amount;
      partnerBalances[partnerKey] = balance;
      
      return {
        ...entry,
        balance: balance
      };
    });

    res.json({
      entries: processedEntries,
      partner_balances: partnerBalances
    });
  } catch (error) {
    console.error('Partner ledger report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Profit & Loss Report
router.get('/profit-loss', authenticateToken, [
  query('start_date').optional().isISO8601(),
  query('end_date').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { start_date, end_date } = req.query;

    let dateFilter = '';
    const values = [];
    let paramCount = 0;

    if (start_date) {
      paramCount++;
      dateFilter += ` AND le.entry_date >= $${paramCount}`;
      values.push(start_date);
    }

    if (end_date) {
      paramCount++;
      dateFilter += ` AND le.entry_date <= $${paramCount}`;
      values.push(end_date);
    }

    // Get revenue accounts
    const revenueQuery = `
      SELECT 
        a.name as account_name,
        a.code as account_code,
        COALESCE(SUM(le.credit_amount - le.debit_amount), 0) as amount
      FROM accounts a
      LEFT JOIN ledger_entries le ON a.id = le.account_id ${dateFilter}
      WHERE a.type = 'revenue' AND a.is_active = true
      GROUP BY a.id, a.name, a.code
      HAVING COALESCE(SUM(le.credit_amount - le.debit_amount), 0) != 0
      ORDER BY a.code
    `;

    // Get expense accounts
    const expenseQuery = `
      SELECT 
        a.name as account_name,
        a.code as account_code,
        COALESCE(SUM(le.debit_amount - le.credit_amount), 0) as amount
      FROM accounts a
      LEFT JOIN ledger_entries le ON a.id = le.account_id ${dateFilter}
      WHERE a.type = 'expense' AND a.is_active = true
      GROUP BY a.id, a.name, a.code
      HAVING COALESCE(SUM(le.debit_amount - le.credit_amount), 0) != 0
      ORDER BY a.code
    `;

    const [revenueResult, expenseResult] = await Promise.all([
      pool.query(revenueQuery, values),
      pool.query(expenseQuery, values)
    ]);

    const totalRevenue = revenueResult.rows.reduce((sum, row) => sum + parseFloat(row.amount), 0);
    const totalExpenses = expenseResult.rows.reduce((sum, row) => sum + parseFloat(row.amount), 0);
    const netProfit = totalRevenue - totalExpenses;

    res.json({
      period: {
        start_date: start_date || 'Beginning',
        end_date: end_date || 'Current'
      },
      revenue: {
        accounts: revenueResult.rows,
        total: totalRevenue
      },
      expenses: {
        accounts: expenseResult.rows,
        total: totalExpenses
      },
      net_profit: netProfit
    });
  } catch (error) {
    console.error('Profit & Loss report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Balance Sheet Report
router.get('/balance-sheet', authenticateToken, [
  query('as_of_date').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { as_of_date } = req.query;

    let dateFilter = '';
    const values = [];
    let paramCount = 0;

    if (as_of_date) {
      paramCount++;
      dateFilter = ` AND le.entry_date <= $${paramCount}`;
      values.push(as_of_date);
    }

    // Get assets
    const assetsQuery = `
      SELECT 
        a.name as account_name,
        a.code as account_code,
        COALESCE(SUM(le.debit_amount - le.credit_amount), 0) as amount
      FROM accounts a
      LEFT JOIN ledger_entries le ON a.id = le.account_id ${dateFilter}
      WHERE a.type = 'asset' AND a.is_active = true
      GROUP BY a.id, a.name, a.code
      HAVING COALESCE(SUM(le.debit_amount - le.credit_amount), 0) != 0
      ORDER BY a.code
    `;

    // Get liabilities
    const liabilitiesQuery = `
      SELECT 
        a.name as account_name,
        a.code as account_code,
        COALESCE(SUM(le.credit_amount - le.debit_amount), 0) as amount
      FROM accounts a
      LEFT JOIN ledger_entries le ON a.id = le.account_id ${dateFilter}
      WHERE a.type = 'liability' AND a.is_active = true
      GROUP BY a.id, a.name, a.code
      HAVING COALESCE(SUM(le.credit_amount - le.debit_amount), 0) != 0
      ORDER BY a.code
    `;

    // Get equity
    const equityQuery = `
      SELECT 
        a.name as account_name,
        a.code as account_code,
        COALESCE(SUM(le.credit_amount - le.debit_amount), 0) as amount
      FROM accounts a
      LEFT JOIN ledger_entries le ON a.id = le.account_id ${dateFilter}
      WHERE a.type = 'equity' AND a.is_active = true
      GROUP BY a.id, a.name, a.code
      HAVING COALESCE(SUM(le.credit_amount - le.debit_amount), 0) != 0
      ORDER BY a.code
    `;

    const [assetsResult, liabilitiesResult, equityResult] = await Promise.all([
      pool.query(assetsQuery, values),
      pool.query(liabilitiesQuery, values),
      pool.query(equityQuery, values)
    ]);

    const totalAssets = assetsResult.rows.reduce((sum, row) => sum + parseFloat(row.amount), 0);
    const totalLiabilities = liabilitiesResult.rows.reduce((sum, row) => sum + parseFloat(row.amount), 0);
    const totalEquity = equityResult.rows.reduce((sum, row) => sum + parseFloat(row.amount), 0);
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

    res.json({
      as_of_date: as_of_date || new Date().toISOString().split('T')[0],
      assets: {
        accounts: assetsResult.rows,
        total: totalAssets
      },
      liabilities: {
        accounts: liabilitiesResult.rows,
        total: totalLiabilities
      },
      equity: {
        accounts: equityResult.rows,
        total: totalEquity
      },
      total_assets: totalAssets,
      total_liabilities_and_equity: totalLiabilitiesAndEquity,
      is_balanced: Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01
    });
  } catch (error) {
    console.error('Balance Sheet report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Stock Statement Report
router.get('/stock-statement', authenticateToken, [
  query('product_id').optional().isUUID(),
  query('start_date').optional().isISO8601(),
  query('end_date').optional().isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }

    const { product_id, start_date, end_date } = req.query;

    let query = `
      SELECT 
        p.name as product_name,
        p.sku,
        p.price as current_price,
        COALESCE(SUM(
          CASE 
            WHEN il.invoice_id IS NOT NULL THEN il.quantity
            WHEN vbl.vendor_bill_id IS NOT NULL THEN vbl.quantity
            ELSE 0
          END
        ), 0) as total_in,
        COALESCE(SUM(
          CASE 
            WHEN il.invoice_id IS NOT NULL THEN 0
            WHEN vbl.vendor_bill_id IS NOT NULL THEN 0
            ELSE 0
          END
        ), 0) as total_out,
        COALESCE(SUM(
          CASE 
            WHEN il.invoice_id IS NOT NULL THEN il.quantity
            WHEN vbl.vendor_bill_id IS NOT NULL THEN -vbl.quantity
            ELSE 0
          END
        ), 0) as current_stock
      FROM products p
      LEFT JOIN invoice_lines il ON p.id = il.product_id
      LEFT JOIN invoices i ON il.invoice_id = i.id
      LEFT JOIN vendor_bill_lines vbl ON p.id = vbl.product_id
      LEFT JOIN vendor_bills vb ON vbl.vendor_bill_id = vb.id
      WHERE p.is_active = true
    `;

    const values = [];
    let paramCount = 0;

    if (product_id) {
      paramCount++;
      query += ` AND p.id = $${paramCount}`;
      values.push(product_id);
    }

    if (start_date) {
      paramCount++;
      query += ` AND (i.invoice_date >= $${paramCount} OR vb.bill_date >= $${paramCount})`;
      values.push(start_date);
    }

    if (end_date) {
      paramCount++;
      query += ` AND (i.invoice_date <= $${paramCount} OR vb.bill_date <= $${paramCount})`;
      values.push(end_date);
    }

    query += `
      GROUP BY p.id, p.name, p.sku, p.price
      ORDER BY p.name
    `;

    const result = await pool.query(query, values);

    res.json({
      period: {
        start_date: start_date || 'Beginning',
        end_date: end_date || 'Current'
      },
      products: result.rows
    });
  } catch (error) {
    console.error('Stock statement report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dashboard Summary
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const currentDate = new Date().toISOString().split('T')[0];
    const currentMonth = currentDate.substring(0, 7);

    // Get total customers and vendors
    const contactsResult = await pool.query(`
      SELECT 
        contact_type,
        COUNT(*) as count
      FROM contacts 
      WHERE is_active = true 
      GROUP BY contact_type
    `);

    const contactCounts = {
      customers: 0,
      vendors: 0
    };

    contactsResult.rows.forEach(row => {
      if (row.contact_type === 'customer') {
        contactCounts.customers = parseInt(row.count);
      } else if (row.contact_type === 'vendor') {
        contactCounts.vendors = parseInt(row.count);
      }
    });

    // Get total products
    const productsResult = await pool.query(`
      SELECT COUNT(*) as count 
      FROM products 
      WHERE is_active = true
    `);
    const totalProducts = parseInt(productsResult.rows[0].count);

    // Get current month revenue
    const revenueResult = await pool.query(`
      SELECT COALESCE(SUM(total_amount), 0) as revenue
      FROM invoices 
      WHERE status != 'cancelled' 
      AND DATE_TRUNC('month', invoice_date) = DATE_TRUNC('month', CURRENT_DATE)
    `);
    const monthlyRevenue = parseFloat(revenueResult.rows[0].revenue);

    // Get current month expenses
    const expensesResult = await pool.query(`
      SELECT COALESCE(SUM(total_amount), 0) as expenses
      FROM vendor_bills 
      WHERE status != 'cancelled' 
      AND DATE_TRUNC('month', bill_date) = DATE_TRUNC('month', CURRENT_DATE)
    `);
    const monthlyExpenses = parseFloat(expensesResult.rows[0].expenses);

    // Get pending invoices
    const pendingInvoicesResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM invoices 
      WHERE status IN ('open', 'partially_paid')
    `);
    const pendingInvoices = parseInt(pendingInvoicesResult.rows[0].count);

    // Get pending bills
    const pendingBillsResult = await pool.query(`
      SELECT COUNT(*) as count
      FROM vendor_bills 
      WHERE status IN ('open', 'partially_paid')
    `);
    const pendingBills = parseInt(pendingBillsResult.rows[0].count);

    res.json({
      contacts: contactCounts,
      total_products,
      monthly_revenue: monthlyRevenue,
      monthly_expenses: monthlyExpenses,
      monthly_profit: monthlyRevenue - monthlyExpenses,
      pending_invoices: pendingInvoices,
      pending_bills: pendingBills
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
