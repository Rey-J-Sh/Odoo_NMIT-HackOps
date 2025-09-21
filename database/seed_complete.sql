-- Complete Seed Data for Shiv Accounts Cloud
-- This file contains all the necessary seed data for the application

-- Insert Chart of Accounts
INSERT INTO accounts (code, name, type, parent_id) VALUES
-- Assets
('CASH', 'Cash', 'asset', NULL),
('BANK', 'Bank Account', 'asset', NULL),
('ACCOUNTS_RECEIVABLE', 'Accounts Receivable', 'asset', NULL),
('INVENTORY', 'Inventory', 'asset', NULL),
('FIXED_ASSETS', 'Fixed Assets', 'asset', NULL),

-- Liabilities
('ACCOUNTS_PAYABLE', 'Accounts Payable', 'liability', NULL),
('TAX_PAYABLE', 'Tax Payable', 'liability', NULL),
('LOANS_PAYABLE', 'Loans Payable', 'liability', NULL),

-- Equity
('OWNER_EQUITY', 'Owner Equity', 'equity', NULL),
('RETAINED_EARNINGS', 'Retained Earnings', 'equity', NULL),

-- Revenue
('SALES', 'Sales Revenue', 'revenue', NULL),
('SERVICE_REVENUE', 'Service Revenue', 'revenue', NULL),
('OTHER_INCOME', 'Other Income', 'revenue', NULL),

-- Expenses
('COST_OF_GOODS_SOLD', 'Cost of Goods Sold', 'expense', NULL),
('OFFICE_EXPENSES', 'Office Expenses', 'expense', NULL),
('RENT', 'Rent Expense', 'expense', NULL),
('UTILITIES', 'Utilities', 'expense', NULL),
('SALARIES', 'Salaries', 'expense', NULL),
('MARKETING', 'Marketing Expenses', 'expense', NULL),
('TRAVEL', 'Travel Expenses', 'expense', NULL),
('OTHER_EXPENSES', 'Other Expenses', 'expense', NULL);

-- Insert sample contacts
INSERT INTO contacts (name, email, phone, address, contact_type) VALUES
-- Customers
('ABC Corporation', 'contact@abccorp.com', '+1-555-0101', '123 Business St, City, State 12345', 'customer'),
('XYZ Ltd', 'info@xyzltd.com', '+1-555-0102', '456 Commerce Ave, City, State 12345', 'customer'),
('Tech Solutions Inc', 'sales@techsolutions.com', '+1-555-0103', '789 Innovation Blvd, City, State 12345', 'customer'),
('Global Enterprises', 'orders@globalent.com', '+1-555-0104', '321 Corporate Dr, City, State 12345', 'customer'),
('Startup Co', 'hello@startupco.com', '+1-555-0105', '654 Startup St, City, State 12345', 'customer'),

-- Vendors
('Supply Chain Co', 'orders@supplychain.com', '+1-555-0201', '100 Supply St, City, State 12345', 'vendor'),
('Manufacturing Ltd', 'sales@manufacturing.com', '+1-555-0202', '200 Factory Ave, City, State 12345', 'vendor'),
('Office Supplies Inc', 'orders@officesupplies.com', '+1-555-0203', '300 Office Blvd, City, State 12345', 'vendor'),
('Tech Hardware Co', 'sales@techhardware.com', '+1-555-0204', '400 Hardware Dr, City, State 12345', 'vendor'),
('Service Provider LLC', 'billing@serviceprovider.com', '+1-555-0205', '500 Service St, City, State 12345', 'vendor');

-- Insert sample products
INSERT INTO products (sku, name, description, price, tax_percentage, hsn_code) VALUES
('PROD-001', 'Laptop Computer', 'High-performance business laptop', 1200.00, 18.00, '8471.30.00'),
('PROD-002', 'Office Chair', 'Ergonomic office chair with lumbar support', 250.00, 18.00, '9401.30.00'),
('PROD-003', 'Desk Lamp', 'LED desk lamp with adjustable brightness', 45.00, 18.00, '9405.20.00'),
('PROD-004', 'Notebook Set', 'Set of 5 professional notebooks', 25.00, 18.00, '4820.10.00'),
('PROD-005', 'Pen Set', 'Premium ballpoint pen set', 15.00, 18.00, '9608.10.00'),
('PROD-006', 'Monitor Stand', 'Adjustable monitor stand', 80.00, 18.00, '9403.20.00'),
('PROD-007', 'Wireless Mouse', 'Ergonomic wireless mouse', 35.00, 18.00, '8471.60.00'),
('PROD-008', 'Keyboard', 'Mechanical keyboard', 120.00, 18.00, '8471.60.00'),
('PROD-009', 'Webcam', 'HD webcam for video conferencing', 90.00, 18.00, '8525.80.00'),
('PROD-010', 'Headphones', 'Noise-cancelling headphones', 150.00, 18.00, '8518.30.00');

-- Insert sample users
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@shivaccounts.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/9Kz8K2a', 'Admin User', 'admin'),
('accountant@shivaccounts.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/9Kz8K2a', 'Accountant User', 'invoicing_user');

-- Note: The password hash above is for 'password123' - change this in production!

-- Insert sample purchase orders
INSERT INTO purchase_orders (po_number, vendor_id, po_date, due_date, status, notes) VALUES
('PO-000001', (SELECT id FROM contacts WHERE name = 'Supply Chain Co'), '2024-01-15', '2024-01-30', 'received', 'Office supplies order'),
('PO-000002', (SELECT id FROM contacts WHERE name = 'Manufacturing Ltd'), '2024-01-20', '2024-02-05', 'sent', 'Equipment purchase'),
('PO-000003', (SELECT id FROM contacts WHERE name = 'Tech Hardware Co'), '2024-01-25', '2024-02-10', 'draft', 'IT equipment order');

-- Insert purchase order line items
INSERT INTO purchase_order_lines (purchase_order_id, product_id, quantity, unit_price, line_total) VALUES
-- PO-000001 line items
((SELECT id FROM purchase_orders WHERE po_number = 'PO-000001'), (SELECT id FROM products WHERE sku = 'PROD-002'), 10, 250.00, 2500.00),
((SELECT id FROM purchase_orders WHERE po_number = 'PO-000001'), (SELECT id FROM products WHERE sku = 'PROD-003'), 20, 45.00, 900.00),
((SELECT id FROM purchase_orders WHERE po_number = 'PO-000001'), (SELECT id FROM products WHERE sku = 'PROD-004'), 50, 25.00, 1250.00),

-- PO-000002 line items
((SELECT id FROM purchase_orders WHERE po_number = 'PO-000002'), (SELECT id FROM products WHERE sku = 'PROD-001'), 5, 1200.00, 6000.00),
((SELECT id FROM purchase_orders WHERE po_number = 'PO-000002'), (SELECT id FROM products WHERE sku = 'PROD-006'), 5, 80.00, 400.00),

-- PO-000003 line items
((SELECT id FROM purchase_orders WHERE po_number = 'PO-000003'), (SELECT id FROM products WHERE sku = 'PROD-007'), 15, 35.00, 525.00),
((SELECT id FROM purchase_orders WHERE po_number = 'PO-000003'), (SELECT id FROM products WHERE sku = 'PROD-008'), 10, 120.00, 1200.00);

-- Insert sample sale orders
INSERT INTO sale_orders (so_number, customer_id, so_date, due_date, status, notes) VALUES
('SO-000001', (SELECT id FROM contacts WHERE name = 'ABC Corporation'), '2024-01-10', '2024-01-25', 'confirmed', 'Bulk order for office setup'),
('SO-000002', (SELECT id FROM contacts WHERE name = 'XYZ Ltd'), '2024-01-12', '2024-01-27', 'sent', 'IT equipment order'),
('SO-000003', (SELECT id FROM contacts WHERE name = 'Tech Solutions Inc'), '2024-01-18', '2024-02-02', 'draft', 'Consulting equipment');

-- Insert sale order line items
INSERT INTO sale_order_lines (sale_order_id, product_id, quantity, unit_price, line_total) VALUES
-- SO-000001 line items
((SELECT id FROM sale_orders WHERE so_number = 'SO-000001'), (SELECT id FROM products WHERE sku = 'PROD-001'), 3, 1200.00, 3600.00),
((SELECT id FROM sale_orders WHERE so_number = 'SO-000001'), (SELECT id FROM products WHERE sku = 'PROD-002'), 5, 250.00, 1250.00),
((SELECT id FROM sale_orders WHERE so_number = 'SO-000001'), (SELECT id FROM products WHERE sku = 'PROD-003'), 10, 45.00, 450.00),

-- SO-000002 line items
((SELECT id FROM sale_orders WHERE so_number = 'SO-000002'), (SELECT id FROM products WHERE sku = 'PROD-007'), 8, 35.00, 280.00),
((SELECT id FROM sale_orders WHERE so_number = 'SO-000002'), (SELECT id FROM products WHERE sku = 'PROD-008'), 5, 120.00, 600.00),
((SELECT id FROM sale_orders WHERE so_number = 'SO-000002'), (SELECT id FROM products WHERE sku = 'PROD-009'), 3, 90.00, 270.00),

-- SO-000003 line items
((SELECT id FROM sale_orders WHERE so_number = 'SO-000003'), (SELECT id FROM products WHERE sku = 'PROD-010'), 4, 150.00, 600.00);

-- Insert sample customer invoices
INSERT INTO invoices (invoice_number, contact_id, sale_order_id, invoice_date, due_date, status, notes) VALUES
('INV-000001', (SELECT id FROM contacts WHERE name = 'ABC Corporation'), (SELECT id FROM sale_orders WHERE so_number = 'SO-000001'), '2024-01-10', '2024-01-25', 'paid', 'Office setup invoice'),
('INV-000002', (SELECT id FROM contacts WHERE name = 'XYZ Ltd'), (SELECT id FROM sale_orders WHERE so_number = 'SO-000002'), '2024-01-12', '2024-01-27', 'open', 'IT equipment invoice'),
('INV-000003', (SELECT id FROM contacts WHERE name = 'Tech Solutions Inc'), (SELECT id FROM sale_orders WHERE so_number = 'SO-000003'), '2024-01-18', '2024-02-02', 'draft', 'Consulting equipment invoice');

-- Insert invoice line items
INSERT INTO invoice_lines (invoice_id, product_id, description, quantity, unit_price, tax_percentage, line_total) VALUES
-- INV-000001 line items
((SELECT id FROM invoices WHERE invoice_number = 'INV-000001'), (SELECT id FROM products WHERE sku = 'PROD-001'), 'Laptop Computer', 3, 1200.00, 18.00, 3600.00),
((SELECT id FROM invoices WHERE invoice_number = 'INV-000001'), (SELECT id FROM products WHERE sku = 'PROD-002'), 'Office Chair', 5, 250.00, 18.00, 1250.00),
((SELECT id FROM invoices WHERE invoice_number = 'INV-000001'), (SELECT id FROM products WHERE sku = 'PROD-003'), 'Desk Lamp', 10, 45.00, 18.00, 450.00),

-- INV-000002 line items
((SELECT id FROM invoices WHERE invoice_number = 'INV-000002'), (SELECT id FROM products WHERE sku = 'PROD-007'), 'Wireless Mouse', 8, 35.00, 18.00, 280.00),
((SELECT id FROM invoices WHERE invoice_number = 'INV-000002'), (SELECT id FROM products WHERE sku = 'PROD-008'), 'Keyboard', 5, 120.00, 18.00, 600.00),
((SELECT id FROM invoices WHERE invoice_number = 'INV-000002'), (SELECT id FROM products WHERE sku = 'PROD-009'), 'Webcam', 3, 90.00, 18.00, 270.00),

-- INV-000003 line items
((SELECT id FROM invoices WHERE invoice_number = 'INV-000003'), (SELECT id FROM products WHERE sku = 'PROD-010'), 'Headphones', 4, 150.00, 18.00, 600.00);

-- Insert sample payments
INSERT INTO payments (payment_number, invoice_id, contact_id, payment_date, amount, payment_method, reference, notes) VALUES
('PAY-000001', (SELECT id FROM invoices WHERE invoice_number = 'INV-000001'), (SELECT id FROM contacts WHERE name = 'ABC Corporation'), '2024-01-20', 6258.00, 'bank_transfer', 'TXN-001', 'Full payment received'),
('PAY-000002', (SELECT id FROM invoices WHERE invoice_number = 'INV-000002'), (SELECT id FROM contacts WHERE name = 'XYZ Ltd'), '2024-01-15', 500.00, 'cheque', 'CHQ-001', 'Partial payment');

-- Insert sample vendor bills
INSERT INTO vendor_bills (bill_number, vendor_id, purchase_order_id, bill_date, due_date, status, notes) VALUES
('BILL-000001', (SELECT id FROM contacts WHERE name = 'Supply Chain Co'), (SELECT id FROM purchase_orders WHERE po_number = 'PO-000001'), '2024-01-16', '2024-01-31', 'paid', 'Office supplies bill'),
('BILL-000002', (SELECT id FROM contacts WHERE name = 'Manufacturing Ltd'), (SELECT id FROM purchase_orders WHERE po_number = 'PO-000002'), '2024-01-21', '2024-02-06', 'open', 'Equipment bill'),
('BILL-000003', (SELECT id FROM contacts WHERE name = 'Tech Hardware Co'), (SELECT id FROM purchase_orders WHERE po_number = 'PO-000003'), '2024-01-26', '2024-02-11', 'draft', 'IT equipment bill');

-- Insert vendor bill line items
INSERT INTO vendor_bill_lines (vendor_bill_id, product_id, description, quantity, unit_price, tax_percentage, line_total) VALUES
-- BILL-000001 line items
((SELECT id FROM vendor_bills WHERE bill_number = 'BILL-000001'), (SELECT id FROM products WHERE sku = 'PROD-002'), 'Office Chair', 10, 250.00, 18.00, 2500.00),
((SELECT id FROM vendor_bills WHERE bill_number = 'BILL-000001'), (SELECT id FROM products WHERE sku = 'PROD-003'), 'Desk Lamp', 20, 45.00, 18.00, 900.00),
((SELECT id FROM vendor_bills WHERE bill_number = 'BILL-000001'), (SELECT id FROM products WHERE sku = 'PROD-004'), 'Notebook Set', 50, 25.00, 18.00, 1250.00),

-- BILL-000002 line items
((SELECT id FROM vendor_bills WHERE bill_number = 'BILL-000002'), (SELECT id FROM products WHERE sku = 'PROD-001'), 'Laptop Computer', 5, 1200.00, 18.00, 6000.00),
((SELECT id FROM vendor_bills WHERE bill_number = 'BILL-000002'), (SELECT id FROM products WHERE sku = 'PROD-006'), 'Monitor Stand', 5, 80.00, 18.00, 400.00),

-- BILL-000003 line items
((SELECT id FROM vendor_bills WHERE bill_number = 'BILL-000003'), (SELECT id FROM products WHERE sku = 'PROD-007'), 'Wireless Mouse', 15, 35.00, 18.00, 525.00),
((SELECT id FROM vendor_bills WHERE bill_number = 'BILL-000003'), (SELECT id FROM products WHERE sku = 'PROD-008'), 'Keyboard', 10, 120.00, 18.00, 1200.00);

-- Insert sample bill payments
INSERT INTO bill_payments (payment_number, vendor_bill_id, vendor_id, payment_date, amount, payment_method, reference, notes) VALUES
('PAY-000001', (SELECT id FROM vendor_bills WHERE bill_number = 'BILL-000001'), (SELECT id FROM contacts WHERE name = 'Supply Chain Co'), '2024-01-25', 5364.00, 'bank_transfer', 'TXN-V001', 'Full payment made'),
('PAY-000002', (SELECT id FROM vendor_bills WHERE bill_number = 'BILL-000002'), (SELECT id FROM contacts WHERE name = 'Manufacturing Ltd'), '2024-01-30', 2000.00, 'cheque', 'CHQ-V001', 'Partial payment');

-- Update purchase order totals (this will be handled by triggers, but we can manually update for seed data)
UPDATE purchase_orders SET 
  subtotal = (SELECT COALESCE(SUM(line_total), 0) FROM purchase_order_lines WHERE purchase_order_id = purchase_orders.id),
  tax_amount = (SELECT COALESCE(SUM(line_total * 0.18), 0) FROM purchase_order_lines WHERE purchase_order_id = purchase_orders.id),
  total_amount = (SELECT COALESCE(SUM(line_total * 1.18), 0) FROM purchase_order_lines WHERE purchase_order_id = purchase_orders.id);

-- Update sale order totals
UPDATE sale_orders SET 
  subtotal = (SELECT COALESCE(SUM(line_total), 0) FROM sale_order_lines WHERE sale_order_id = sale_orders.id),
  tax_amount = (SELECT COALESCE(SUM(line_total * 0.18), 0) FROM sale_order_lines WHERE sale_order_id = sale_orders.id),
  total_amount = (SELECT COALESCE(SUM(line_total * 1.18), 0) FROM sale_order_lines WHERE sale_order_id = sale_orders.id);

-- Update vendor bill totals
UPDATE vendor_bills SET 
  subtotal = (SELECT COALESCE(SUM(line_total), 0) FROM vendor_bill_lines WHERE vendor_bill_id = vendor_bills.id),
  tax_amount = (SELECT COALESCE(SUM(line_total * 0.18), 0) FROM vendor_bill_lines WHERE vendor_bill_id = vendor_bills.id),
  total_amount = (SELECT COALESCE(SUM(line_total * 1.18), 0) FROM vendor_bill_lines WHERE vendor_bill_id = vendor_bills.id);

-- Update vendor bill paid amounts
UPDATE vendor_bills SET 
  paid_amount = (SELECT COALESCE(SUM(amount), 0) FROM bill_payments WHERE vendor_bill_id = vendor_bills.id);

-- Update vendor bill status based on payments
UPDATE vendor_bills SET 
  status = CASE 
    WHEN paid_amount = 0 THEN 'open'
    WHEN paid_amount >= total_amount THEN 'paid'
    ELSE 'partially_paid'
  END;

-- Update invoice paid amounts
UPDATE invoices SET 
  paid_amount = (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE invoice_id = invoices.id);

-- Update invoice status based on payments
UPDATE invoices SET 
  status = CASE 
    WHEN paid_amount = 0 THEN 'open'
    WHEN paid_amount >= total_amount THEN 'paid'
    ELSE 'partially_paid'
  END;
