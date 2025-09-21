-- Shiv Accounts Cloud Database Schema
-- PostgreSQL Schema for Cloud Accounting System (Custom Backend)

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Chart of Accounts
CREATE TABLE accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
    parent_id UUID REFERENCES accounts(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contacts (Customers and Vendors)
CREATE TABLE contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    contact_type VARCHAR(20) NOT NULL CHECK (contact_type IN ('customer', 'vendor')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sku VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    tax_percentage DECIMAL(5,2) DEFAULT 0.00,
    hsn_code VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices (Customer Invoices)
CREATE TABLE invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    contact_id UUID NOT NULL REFERENCES contacts(id),
    sale_order_id UUID REFERENCES sale_orders(id),
    invoice_date DATE NOT NULL,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'partially_paid', 'paid', 'cancelled')),
    subtotal DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoice Line Items
CREATE TABLE invoice_lines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    description VARCHAR(200) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    tax_percentage DECIMAL(5,2) DEFAULT 0.00,
    line_total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_id UUID NOT NULL REFERENCES invoices(id),
    contact_id UUID NOT NULL REFERENCES contacts(id),
    payment_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'bank_transfer', 'cheque', 'card')),
    reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ledger Entries (Double-entry bookkeeping)
CREATE TABLE ledger_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    entry_date DATE NOT NULL,
    reference_type VARCHAR(20) NOT NULL CHECK (reference_type IN ('invoice', 'payment', 'adjustment')),
    reference_id UUID NOT NULL,
    account_id UUID NOT NULL REFERENCES accounts(id),
    debit_amount DECIMAL(10,2) DEFAULT 0.00,
    credit_amount DECIMAL(10,2) DEFAULT 0.00,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users (for authentication) - UPDATED FOR CUSTOM BACKEND
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,  -- ADDED: Required for custom authentication
    name VARCHAR(200),
    role VARCHAR(20) DEFAULT 'invoicing_user' CHECK (role IN ('admin', 'invoicing_user')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Orders
CREATE TABLE purchase_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    vendor_id UUID NOT NULL REFERENCES contacts(id),
    po_date DATE NOT NULL,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'received', 'cancelled')),
    subtotal DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase Order Line Items
CREATE TABLE purchase_order_lines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendor Bills
CREATE TABLE vendor_bills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    vendor_id UUID NOT NULL REFERENCES contacts(id),
    purchase_order_id UUID REFERENCES purchase_orders(id),
    bill_date DATE NOT NULL,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'partially_paid', 'paid', 'cancelled')),
    subtotal DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vendor Bill Line Items
CREATE TABLE vendor_bill_lines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vendor_bill_id UUID NOT NULL REFERENCES vendor_bills(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    description VARCHAR(200) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    tax_percentage DECIMAL(5,2) DEFAULT 0.00,
    line_total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bill Payments
CREATE TABLE bill_payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    vendor_bill_id UUID NOT NULL REFERENCES vendor_bills(id),
    vendor_id UUID NOT NULL REFERENCES contacts(id),
    payment_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'bank_transfer', 'cheque', 'card')),
    reference VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sale Orders
CREATE TABLE sale_orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    so_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES contacts(id),
    so_date DATE NOT NULL,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'confirmed', 'cancelled')),
    subtotal DECIMAL(10,2) DEFAULT 0.00,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sale Order Line Items
CREATE TABLE sale_order_lines (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sale_order_id UUID NOT NULL REFERENCES sale_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    line_total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customer Invoices (reusing existing invoices table)
-- The existing invoices table will be used for customer invoices
-- We'll add a field to distinguish between customer and vendor invoices

-- Invoice Payments (reusing existing payments table)
-- The existing payments table will be used for customer invoice payments

-- Indexes for performance
CREATE INDEX idx_invoices_contact_id ON invoices(contact_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoice_lines_invoice_id ON invoice_lines(invoice_id);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_ledger_entries_account_id ON ledger_entries(account_id);
CREATE INDEX idx_ledger_entries_reference ON ledger_entries(reference_type, reference_id);
CREATE INDEX idx_ledger_entries_date ON ledger_entries(entry_date);
CREATE INDEX idx_users_email ON users(email);  -- ADDED: For authentication lookups

-- Purchase Order indexes
CREATE INDEX idx_purchase_orders_vendor_id ON purchase_orders(vendor_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_order_lines_po_id ON purchase_order_lines(purchase_order_id);

-- Vendor Bill indexes
CREATE INDEX idx_vendor_bills_vendor_id ON vendor_bills(vendor_id);
CREATE INDEX idx_vendor_bills_status ON vendor_bills(status);
CREATE INDEX idx_vendor_bill_lines_bill_id ON vendor_bill_lines(vendor_bill_id);
CREATE INDEX idx_bill_payments_bill_id ON bill_payments(vendor_bill_id);

-- Sale Order indexes
CREATE INDEX idx_sale_orders_customer_id ON sale_orders(customer_id);
CREATE INDEX idx_sale_orders_status ON sale_orders(status);
CREATE INDEX idx_sale_order_lines_so_id ON sale_order_lines(sale_order_id);

-- Functions for automatic calculations
CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE invoices 
    SET 
        subtotal = (
            SELECT COALESCE(SUM(line_total), 0) 
            FROM invoice_lines 
            WHERE invoice_id = NEW.invoice_id
        ),
        tax_amount = (
            SELECT COALESCE(SUM(line_total * tax_percentage / 100), 0) 
            FROM invoice_lines 
            WHERE invoice_id = NEW.invoice_id
        ),
        total_amount = (
            SELECT COALESCE(SUM(line_total * (1 + tax_percentage / 100)), 0) 
            FROM invoice_lines 
            WHERE invoice_id = NEW.invoice_id
        ),
        updated_at = NOW()
    WHERE id = NEW.invoice_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update invoice totals when line items change
CREATE TRIGGER trigger_update_invoice_totals
    AFTER INSERT OR UPDATE OR DELETE ON invoice_lines
    FOR EACH ROW EXECUTE FUNCTION update_invoice_totals();

-- Function to create ledger entries for invoices
CREATE OR REPLACE FUNCTION create_invoice_ledger_entries()
RETURNS TRIGGER AS $$
DECLARE
    contact_record contacts%ROWTYPE;
    sales_account_id UUID;
    tax_account_id UUID;
    ar_account_id UUID;
BEGIN
    -- Get contact details
    SELECT * INTO contact_record FROM contacts WHERE id = NEW.contact_id;
    
    -- Get account IDs (assuming these exist in seed data)
    SELECT id INTO sales_account_id FROM accounts WHERE code = 'SALES' LIMIT 1;
    SELECT id INTO tax_account_id FROM accounts WHERE code = 'TAX_PAYABLE' LIMIT 1;
    SELECT id INTO ar_account_id FROM accounts WHERE code = 'ACCOUNTS_RECEIVABLE' LIMIT 1;
    
    -- Only create ledger entries for non-draft invoices
    IF NEW.status != 'draft' THEN
        -- Debit: Accounts Receivable
        INSERT INTO ledger_entries (entry_date, reference_type, reference_id, account_id, debit_amount, credit_amount, description)
        VALUES (NEW.invoice_date, 'invoice', NEW.id, ar_account_id, NEW.total_amount, 0, 'Invoice ' || NEW.invoice_number || ' - ' || contact_record.name);
        
        -- Credit: Sales
        INSERT INTO ledger_entries (entry_date, reference_type, reference_id, account_id, debit_amount, credit_amount, description)
        VALUES (NEW.invoice_date, 'invoice', NEW.id, sales_account_id, 0, NEW.subtotal, 'Sales - Invoice ' || NEW.invoice_number);
        
        -- Credit: Tax Payable (if tax amount > 0)
        IF NEW.tax_amount > 0 THEN
            INSERT INTO ledger_entries (entry_date, reference_type, reference_id, account_id, debit_amount, credit_amount, description)
            VALUES (NEW.invoice_date, 'invoice', NEW.id, tax_account_id, 0, NEW.tax_amount, 'Tax - Invoice ' || NEW.invoice_number);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create ledger entries when invoice status changes
CREATE TRIGGER trigger_create_invoice_ledger_entries
    AFTER INSERT OR UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION create_invoice_ledger_entries();

-- Function to create ledger entries for payments
CREATE OR REPLACE FUNCTION create_payment_ledger_entries()
RETURNS TRIGGER AS $$
DECLARE
    contact_record contacts%ROWTYPE;
    cash_account_id UUID;
    ar_account_id UUID;
BEGIN
    -- Get contact details
    SELECT * INTO contact_record FROM contacts WHERE id = NEW.contact_id;
    
    -- Get account IDs
    SELECT id INTO cash_account_id FROM accounts WHERE code = 'CASH' LIMIT 1;
    SELECT id INTO ar_account_id FROM accounts WHERE code = 'ACCOUNTS_RECEIVABLE' LIMIT 1;
    
    -- Debit: Cash
    INSERT INTO ledger_entries (entry_date, reference_type, reference_id, account_id, debit_amount, credit_amount, description)
    VALUES (NEW.payment_date, 'payment', NEW.id, cash_account_id, NEW.amount, 0, 'Payment ' || NEW.payment_number || ' - ' || contact_record.name);
    
    -- Credit: Accounts Receivable
    INSERT INTO ledger_entries (entry_date, reference_type, reference_id, account_id, debit_amount, credit_amount, description)
    VALUES (NEW.payment_date, 'payment', NEW.id, ar_account_id, 0, NEW.amount, 'Payment ' || NEW.payment_number || ' - ' || contact_record.name);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create ledger entries for payments
CREATE TRIGGER trigger_create_payment_ledger_entries
    AFTER INSERT ON payments
    FOR EACH ROW EXECUTE FUNCTION create_payment_ledger_entries();

-- Function to update invoice status based on payments
CREATE OR REPLACE FUNCTION update_invoice_payment_status()
RETURNS TRIGGER AS $$
DECLARE
    invoice_record invoices%ROWTYPE;
    total_paid DECIMAL(10,2);
BEGIN
    -- Get invoice details
    SELECT * INTO invoice_record FROM invoices WHERE id = NEW.invoice_id;
    
    -- Calculate total payments for this invoice
    SELECT COALESCE(SUM(amount), 0) INTO total_paid 
    FROM payments 
    WHERE invoice_id = NEW.invoice_id;
    
    -- Update invoice status and paid amount
    UPDATE invoices 
    SET 
        paid_amount = total_paid,
        status = CASE 
            WHEN total_paid = 0 THEN 'open'
            WHEN total_paid >= invoice_record.total_amount THEN 'paid'
            ELSE 'partially_paid'
        END,
        updated_at = NOW()
    WHERE id = NEW.invoice_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update invoice status when payments are added
CREATE TRIGGER trigger_update_invoice_payment_status
    AFTER INSERT OR UPDATE OR DELETE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_invoice_payment_status();

