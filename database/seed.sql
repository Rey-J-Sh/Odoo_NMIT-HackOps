-- Shiv Accounts Cloud Seed Data
-- Demo data for hackathon presentation

-- Insert Chart of Accounts
INSERT INTO accounts (code, name, type) VALUES
('CASH', 'Cash', 'asset'),
('BANK', 'Bank Account', 'asset'),
('ACCOUNTS_RECEIVABLE', 'Accounts Receivable', 'asset'),
('INVENTORY', 'Inventory', 'asset'),
('ACCOUNTS_PAYABLE', 'Accounts Payable', 'liability'),
('TAX_PAYABLE', 'Tax Payable', 'liability'),
('SALES', 'Sales Revenue', 'revenue'),
('COST_OF_GOODS_SOLD', 'Cost of Goods Sold', 'expense'),
('OFFICE_EXPENSES', 'Office Expenses', 'expense'),
('RENT', 'Rent Expense', 'expense');

-- Insert Demo Contacts
INSERT INTO contacts (name, email, phone, address, contact_type) VALUES
('Modern Furniture Store', 'orders@modernfurniture.com', '+91-9876543210', '123 MG Road, Bangalore, Karnataka 560001', 'customer'),
('Office Solutions Pvt Ltd', 'procurement@officesolutions.in', '+91-9876543211', '456 Brigade Road, Bangalore, Karnataka 560025', 'customer'),
('Home Decor Hub', 'info@homedecorhub.com', '+91-9876543212', '789 Commercial Street, Bangalore, Karnataka 560008', 'customer'),
('Corporate Interiors', 'sales@corporateinteriors.in', '+91-9876543213', '321 Residency Road, Bangalore, Karnataka 560025', 'customer'),
('Furniture World', 'contact@furnitureworld.com', '+91-9876543214', '654 Infantry Road, Bangalore, Karnataka 560001', 'customer'),
('Wood Craft Suppliers', 'supply@woodcraft.com', '+91-9876543215', '987 Industrial Area, Bangalore, Karnataka 560022', 'vendor'),
('Metal Works Ltd', 'orders@metalworks.in', '+91-9876543216', '147 Manufacturing Zone, Bangalore, Karnataka 560058', 'vendor'),
('Fabric & Upholstery Co', 'sales@fabricco.com', '+91-9876543217', '258 Textile Park, Bangalore, Karnataka 560016', 'vendor');

-- Insert Demo Products
INSERT INTO products (sku, name, description, price, tax_percentage, hsn_code) VALUES
('CHAIR-001', 'Executive Office Chair', 'Ergonomic office chair with lumbar support', 8500.00, 18.00, '9401'),
('DESK-001', 'L-Shaped Office Desk', 'Modern L-shaped desk with drawers', 15000.00, 18.00, '9403'),
('SOFA-001', '3-Seater Leather Sofa', 'Premium leather sofa for office reception', 45000.00, 18.00, '9401'),
('TABLE-001', 'Conference Table', 'Large conference table for 8 people', 25000.00, 18.00, '9403'),
('CABINET-001', 'Filing Cabinet', '4-drawer metal filing cabinet', 12000.00, 18.00, '9403'),
('BOOKSHELF-001', 'Office Bookshelf', '5-tier wooden bookshelf', 8000.00, 18.00, '9403'),
('LAMP-001', 'Desk Lamp', 'LED desk lamp with adjustable arm', 2500.00, 18.00, '9405'),
('PLANT-001', 'Office Plant Pot', 'Decorative plant pot for office', 1200.00, 18.00, '6802');

-- Insert Demo Invoices
INSERT INTO invoices (invoice_number, contact_id, invoice_date, due_date, status, notes) VALUES
('INV-2024-001', (SELECT id FROM contacts WHERE name = 'Modern Furniture Store'), '2024-01-15', '2024-02-14', 'paid', 'Office furniture order'),
('INV-2024-002', (SELECT id FROM contacts WHERE name = 'Office Solutions Pvt Ltd'), '2024-01-20', '2024-02-19', 'partially_paid', 'Conference room setup'),
('INV-2024-003', (SELECT id FROM contacts WHERE name = 'Home Decor Hub'), '2024-01-25', '2024-02-24', 'open', 'Reception area furniture'),
('INV-2024-004', (SELECT id FROM contacts WHERE name = 'Corporate Interiors'), '2024-02-01', '2024-03-02', 'paid', 'Complete office renovation'),
('INV-2024-005', (SELECT id FROM contacts WHERE name = 'Furniture World'), '2024-02-05', '2024-03-06', 'open', 'Showroom display items'),
('INV-2024-006', (SELECT id FROM contacts WHERE name = 'Modern Furniture Store'), '2024-02-10', '2024-03-11', 'partially_paid', 'Additional chairs order'),
('INV-2024-007', (SELECT id FROM contacts WHERE name = 'Office Solutions Pvt Ltd'), '2024-02-15', '2024-03-16', 'paid', 'Executive office setup'),
('INV-2024-008', (SELECT id FROM contacts WHERE name = 'Home Decor Hub'), '2024-02-20', '2024-03-21', 'open', 'Waiting area furniture'),
('INV-2024-009', (SELECT id FROM contacts WHERE name = 'Corporate Interiors'), '2024-02-25', '2024-03-26', 'paid', 'Meeting room furniture'),
('INV-2024-010', (SELECT id FROM contacts WHERE name = 'Furniture World'), '2024-03-01', '2024-03-31', 'open', 'Storage solutions');

-- Insert Invoice Line Items
-- Invoice 1: Modern Furniture Store - Paid
INSERT INTO invoice_lines (invoice_id, product_id, description, quantity, unit_price, tax_percentage, line_total) VALUES
((SELECT id FROM invoices WHERE invoice_number = 'INV-2024-001'), (SELECT id FROM products WHERE sku = 'CHAIR-001'), 'Executive Office Chair', 4, 8500.00, 18.00, 34000.00),
((SELECT id FROM invoices WHERE invoice_number = 'INV-2024-001'), (SELECT id FROM products WHERE sku = 'DESK-001'), 'L-Shaped Office Desk', 2, 15000.00, 18.00, 30000.00);

-- Invoice 2: Office Solutions - Partially Paid
INSERT INTO invoice_lines (invoice_id, product_id, description, quantity, unit_price, tax_percentage, line_total) VALUES
((SELECT id FROM invoices WHERE invoice_number = 'INV-2024-002'), (SELECT id FROM products WHERE sku = 'TABLE-001'), 'Conference Table', 1, 25000.00, 18.00, 25000.00),
((SELECT id FROM invoices WHERE invoice_number = 'INV-2024-002'), (SELECT id FROM products WHERE sku = 'CHAIR-001'), 'Executive Office Chair', 8, 8500.00, 18.00, 68000.00);

-- Invoice 3: Home Decor Hub - Open
INSERT INTO invoice_lines (invoice_id, product_id, description, quantity, unit_price, tax_percentage, line_total) VALUES
((SELECT id FROM invoices WHERE invoice_number = 'INV-2024-003'), (SELECT id FROM products WHERE sku = 'SOFA-001'), '3-Seater Leather Sofa', 2, 45000.00, 18.00, 90000.00),
((SELECT id FROM invoices WHERE invoice_number = 'INV-2024-003'), (SELECT id FROM products WHERE sku = 'LAMP-001'), 'Desk Lamp', 4, 2500.00, 18.00, 10000.00);

-- Invoice 4: Corporate Interiors - Paid
INSERT INTO invoice_lines (invoice_id, product_id, description, quantity, unit_price, tax_percentage, line_total) VALUES
((SELECT id FROM invoices WHERE invoice_number = 'INV-2024-004'), (SELECT id FROM products WHERE sku = 'DESK-001'), 'L-Shaped Office Desk', 5, 15000.00, 18.00, 75000.00),
((SELECT id FROM invoices WHERE invoice_number = 'INV-2024-004'), (SELECT id FROM products WHERE sku = 'CHAIR-001'), 'Executive Office Chair', 10, 8500.00, 18.00, 85000.00),
((SELECT id FROM invoices WHERE invoice_number = 'INV-2024-004'), (SELECT id FROM products WHERE sku = 'CABINET-001'), 'Filing Cabinet', 3, 12000.00, 18.00, 36000.00);

-- Invoice 5: Furniture World - Open
INSERT INTO invoice_lines (invoice_id, product_id, description, quantity, unit_price, tax_percentage, line_total) VALUES
((SELECT id FROM invoices WHERE invoice_number = 'INV-2024-005'), (SELECT id FROM products WHERE sku = 'BOOKSHELF-001'), 'Office Bookshelf', 6, 8000.00, 18.00, 48000.00),
((SELECT id FROM invoices WHERE invoice_number = 'INV-2024-005'), (SELECT id FROM products WHERE sku = 'PLANT-001'), 'Office Plant Pot', 10, 1200.00, 18.00, 12000.00);

-- Invoice 6: Modern Furniture Store - Partially Paid
INSERT INTO invoice_lines (invoice_id, product_id, description, quantity, unit_price, tax_percentage, line_total) VALUES
((SELECT id FROM invoices WHERE invoice_number = 'INV-2024-006'), (SELECT id FROM products WHERE sku = 'CHAIR-001'), 'Executive Office Chair', 6, 8500.00, 18.00, 51000.00);

-- Invoice 7: Office Solutions - Paid
INSERT INTO invoice_lines (invoice_id, product_id, description, quantity, unit_price, tax_percentage, line_total) VALUES
((SELECT id FROM invoices WHERE invoice_number = 'INV-2024-007'), (SELECT id FROM products WHERE sku = 'DESK-001'), 'L-Shaped Office Desk', 3, 15000.00, 18.00, 45000.00),
((SELECT id FROM invoices WHERE invoice_number = 'INV-2024-007'), (SELECT id FROM products WHERE sku = 'CHAIR-001'), 'Executive Office Chair', 6, 8500.00, 18.00, 51000.00);

-- Invoice 8: Home Decor Hub - Open
INSERT INTO invoice_lines (invoice_id, product_id, description, quantity, unit_price, tax_percentage, line_total) VALUES
((SELECT id FROM invoices WHERE invoice_number = 'INV-2024-008'), (SELECT id FROM products WHERE sku = 'SOFA-001'), '3-Seater Leather Sofa', 3, 45000.00, 18.00, 135000.00);

-- Invoice 9: Corporate Interiors - Paid
INSERT INTO invoice_lines (invoice_id, product_id, description, quantity, unit_price, tax_percentage, line_total) VALUES
((SELECT id FROM invoices WHERE invoice_number = 'INV-2024-009'), (SELECT id FROM products WHERE sku = 'TABLE-001'), 'Conference Table', 2, 25000.00, 18.00, 50000.00),
((SELECT id FROM invoices WHERE invoice_number = 'INV-2024-009'), (SELECT id FROM products WHERE sku = 'CHAIR-001'), 'Executive Office Chair', 16, 8500.00, 18.00, 136000.00);

-- Invoice 10: Furniture World - Open
INSERT INTO invoice_lines (invoice_id, product_id, description, quantity, unit_price, tax_percentage, line_total) VALUES
((SELECT id FROM invoices WHERE invoice_number = 'INV-2024-010'), (SELECT id FROM products WHERE sku = 'CABINET-001'), 'Filing Cabinet', 4, 12000.00, 18.00, 48000.00),
((SELECT id FROM invoices WHERE invoice_number = 'INV-2024-010'), (SELECT id FROM products WHERE sku = 'BOOKSHELF-001'), 'Office Bookshelf', 3, 8000.00, 18.00, 24000.00);

-- Insert Demo Payments
INSERT INTO payments (payment_number, invoice_id, contact_id, payment_date, amount, payment_method, reference, notes) VALUES
('PAY-2024-001', (SELECT id FROM invoices WHERE invoice_number = 'INV-2024-001'), (SELECT id FROM contacts WHERE name = 'Modern Furniture Store'), '2024-01-20', 75480.00, 'bank_transfer', 'TXN001', 'Full payment received'),
('PAY-2024-002', (SELECT id FROM invoices WHERE invoice_number = 'INV-2024-002'), (SELECT id FROM contacts WHERE name = 'Office Solutions Pvt Ltd'), '2024-02-01', 50000.00, 'cheque', 'CHQ001', 'Partial payment'),
('PAY-2024-003', (SELECT id FROM invoices WHERE invoice_number = 'INV-2024-004'), (SELECT id FROM contacts WHERE name = 'Corporate Interiors'), '2024-02-15', 231480.00, 'bank_transfer', 'TXN002', 'Full payment received'),
('PAY-2024-004', (SELECT id FROM invoices WHERE invoice_number = 'INV-2024-006'), (SELECT id FROM contacts WHERE name = 'Modern Furniture Store'), '2024-02-20', 30000.00, 'cash', 'CASH001', 'Partial payment'),
('PAY-2024-005', (SELECT id FROM invoices WHERE invoice_number = 'INV-2024-007'), (SELECT id FROM contacts WHERE name = 'Office Solutions Pvt Ltd'), '2024-02-25', 113160.00, 'bank_transfer', 'TXN003', 'Full payment received'),
('PAY-2024-006', (SELECT id FROM invoices WHERE invoice_number = 'INV-2024-009'), (SELECT id FROM contacts WHERE name = 'Corporate Interiors'), '2024-03-05', 219480.00, 'bank_transfer', 'TXN004', 'Full payment received');

-- Insert Demo User
INSERT INTO users (email, name, role) VALUES
('admin@shivaccounts.com', 'Admin User', 'admin'),
('invoice@shivaccounts.com', 'Invoice User', 'invoicing_user');
