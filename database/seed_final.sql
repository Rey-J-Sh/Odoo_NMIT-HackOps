-- Shiv Accounts Cloud Seed Data
-- Sample data for testing and demonstration

-- Insert Chart of Accounts
INSERT INTO accounts (code, name, type) VALUES
('CASH', 'Cash', 'asset'),
('ACCOUNTS_RECEIVABLE', 'Accounts Receivable', 'asset'),
('INVENTORY', 'Inventory', 'asset'),
('EQUIPMENT', 'Equipment', 'asset'),
('ACCOUNTS_PAYABLE', 'Accounts Payable', 'liability'),
('TAX_PAYABLE', 'Tax Payable', 'liability'),
('LOANS_PAYABLE', 'Loans Payable', 'liability'),
('OWNERS_EQUITY', 'Owner''s Equity', 'equity'),
('SALES', 'Sales Revenue', 'revenue'),
('COST_OF_GOODS_SOLD', 'Cost of Goods Sold', 'expense'),
('RENT', 'Rent Expense', 'expense'),
('UTILITIES', 'Utilities Expense', 'expense'),
('SALARIES', 'Salaries Expense', 'expense');

-- Insert Demo Users (with hashed passwords)
-- Note: These passwords are hashed using bcryptjs with 12 salt rounds
-- Plain text passwords: admin123, invoice123, user123
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@shivaccounts.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.8.8.8', 'Admin User', 'admin'),
('invoice@shivaccounts.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.8.8.8', 'Invoice User', 'invoicing_user'),
('user@gmail.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/4.8.8.8', 'Regular User', 'invoicing_user');

-- Insert Demo Contacts
INSERT INTO contacts (name, email, phone, address, contact_type) VALUES
('John Smith', 'john.smith@email.com', '+1-555-0101', '123 Main St, Anytown, USA', 'customer'),
('Sarah Johnson', 'sarah.johnson@email.com', '+1-555-0102', '456 Oak Ave, Anytown, USA', 'customer'),
('Mike Wilson', 'mike.wilson@email.com', '+1-555-0103', '789 Pine Rd, Anytown, USA', 'customer'),
('Furniture Supply Co.', 'orders@furnituresupply.com', '+1-555-0201', '100 Industrial Blvd, Anytown, USA', 'vendor'),
('Wood Materials Inc.', 'sales@woodmaterials.com', '+1-555-0202', '200 Lumber St, Anytown, USA', 'vendor'),
('Hardware Solutions', 'info@hardwaresolutions.com', '+1-555-0203', '300 Tool Ave, Anytown, USA', 'vendor');

-- Insert Demo Products
INSERT INTO products (sku, name, description, price, tax_percentage, hsn_code) VALUES
('CHAIR-001', 'Office Chair', 'Ergonomic office chair with lumbar support', 299.99, 18.00, '9401'),
('DESK-001', 'Office Desk', 'Solid wood office desk 48x24 inches', 599.99, 18.00, '9403'),
('TABLE-001', 'Dining Table', 'Oak dining table seats 6 people', 899.99, 18.00, '9403'),
('SOFA-001', '3-Seater Sofa', 'Comfortable 3-seater sofa in beige', 1299.99, 18.00, '9401'),
('BED-001', 'Queen Size Bed', 'Queen size bed with headboard', 799.99, 18.00, '9403'),
('CABINET-001', 'Storage Cabinet', '4-drawer storage cabinet', 399.99, 18.00, '9403'),
('LAMP-001', 'Table Lamp', 'Modern LED table lamp', 89.99, 18.00, '9405'),
('RUG-001', 'Area Rug', '5x7 feet area rug in blue', 199.99, 18.00, '5703');

-- Insert Demo Invoices
INSERT INTO invoices (invoice_number, contact_id, invoice_date, due_date, status, subtotal, tax_amount, total_amount, paid_amount, notes) VALUES
('INV-000001', (SELECT id FROM contacts WHERE name = 'John Smith'), '2024-01-15', '2024-02-15', 'paid', 899.99, 161.99, 1061.98, 1061.98, 'Office furniture order'),
('INV-000002', (SELECT id FROM contacts WHERE name = 'Sarah Johnson'), '2024-01-20', '2024-02-20', 'partially_paid', 1299.99, 233.99, 1533.98, 500.00, 'Living room furniture'),
('INV-000003', (SELECT id FROM contacts WHERE name = 'Mike Wilson'), '2024-01-25', '2024-02-25', 'open', 599.99, 107.99, 707.98, 0.00, 'Office desk order'),
('INV-000004', (SELECT id FROM contacts WHERE name = 'John Smith'), '2024-02-01', '2024-03-01', 'draft', 399.99, 71.99, 471.98, 0.00, 'Storage cabinet'),
('INV-000005', (SELECT id FROM contacts WHERE name = 'Sarah Johnson'), '2024-02-05', '2024-03-05', 'cancelled', 199.99, 35.99, 235.98, 0.00, 'Cancelled order');

-- Insert Demo Invoice Lines
INSERT INTO invoice_lines (invoice_id, product_id, description, quantity, unit_price, tax_percentage, line_total) VALUES
-- Invoice 1 (John Smith - Paid)
((SELECT id FROM invoices WHERE invoice_number = 'INV-000001'), (SELECT id FROM products WHERE sku = 'DESK-001'), 'Office Desk', 1, 599.99, 18.00, 599.99),
((SELECT id FROM invoices WHERE invoice_number = 'INV-000001'), (SELECT id FROM products WHERE sku = 'CHAIR-001'), 'Office Chair', 1, 299.99, 18.00, 299.99),

-- Invoice 2 (Sarah Johnson - Partially Paid)
((SELECT id FROM invoices WHERE invoice_number = 'INV-000002'), (SELECT id FROM products WHERE sku = 'SOFA-001'), '3-Seater Sofa', 1, 1299.99, 18.00, 1299.99),

-- Invoice 3 (Mike Wilson - Open)
((SELECT id FROM invoices WHERE invoice_number = 'INV-000003'), (SELECT id FROM products WHERE sku = 'DESK-001'), 'Office Desk', 1, 599.99, 18.00, 599.99),

-- Invoice 4 (John Smith - Draft)
((SELECT id FROM invoices WHERE invoice_number = 'INV-000004'), (SELECT id FROM products WHERE sku = 'CABINET-001'), 'Storage Cabinet', 1, 399.99, 18.00, 399.99),

-- Invoice 5 (Sarah Johnson - Cancelled)
((SELECT id FROM invoices WHERE invoice_number = 'INV-000005'), (SELECT id FROM products WHERE sku = 'RUG-001'), 'Area Rug', 1, 199.99, 18.00, 199.99);

-- Insert Demo Payments
INSERT INTO payments (payment_number, invoice_id, contact_id, payment_date, amount, payment_method, reference, notes) VALUES
('PAY-000001', (SELECT id FROM invoices WHERE invoice_number = 'INV-000001'), (SELECT id FROM contacts WHERE name = 'John Smith'), '2024-01-16', 1061.98, 'bank_transfer', 'TXN-001', 'Full payment received'),
('PAY-000002', (SELECT id FROM invoices WHERE invoice_number = 'INV-000002'), (SELECT id FROM contacts WHERE name = 'Sarah Johnson'), '2024-01-25', 500.00, 'cash', 'CASH-001', 'Partial payment received');

-- Insert Demo Ledger Entries (these would be created automatically by triggers, but adding some for demonstration)
INSERT INTO ledger_entries (entry_date, reference_type, reference_id, account_id, debit_amount, credit_amount, description) VALUES
-- Sales entries
('2024-01-15', 'invoice', (SELECT id FROM invoices WHERE invoice_number = 'INV-000001'), (SELECT id FROM accounts WHERE code = 'ACCOUNTS_RECEIVABLE'), 1061.98, 0, 'Invoice INV-000001 - John Smith'),
('2024-01-15', 'invoice', (SELECT id FROM invoices WHERE invoice_number = 'INV-000001'), (SELECT id FROM accounts WHERE code = 'SALES'), 0, 899.99, 'Sales - Invoice INV-000001'),
('2024-01-15', 'invoice', (SELECT id FROM invoices WHERE invoice_number = 'INV-000001'), (SELECT id FROM accounts WHERE code = 'TAX_PAYABLE'), 0, 161.99, 'Tax - Invoice INV-000001'),

-- Payment entries
('2024-01-16', 'payment', (SELECT id FROM payments WHERE payment_number = 'PAY-000001'), (SELECT id FROM accounts WHERE code = 'CASH'), 1061.98, 0, 'Payment PAY-000001 - John Smith'),
('2024-01-16', 'payment', (SELECT id FROM payments WHERE payment_number = 'PAY-000001'), (SELECT id FROM accounts WHERE code = 'ACCOUNTS_RECEIVABLE'), 0, 1061.98, 'Payment PAY-000001 - John Smith');

