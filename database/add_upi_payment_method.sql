-- Add UPI payment method to existing tables
-- This script updates the payment_method constraint to include 'upi'

-- Update payments table
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_payment_method_check;
ALTER TABLE payments ADD CONSTRAINT payments_payment_method_check 
    CHECK (payment_method IN ('cash', 'bank_transfer', 'cheque', 'card', 'upi'));

-- Update bill_payments table  
ALTER TABLE bill_payments DROP CONSTRAINT IF EXISTS bill_payments_payment_method_check;
ALTER TABLE bill_payments ADD CONSTRAINT bill_payments_payment_method_check 
    CHECK (payment_method IN ('cash', 'bank_transfer', 'cheque', 'card', 'upi'));

-- Update the default value if needed
ALTER TABLE payments ALTER COLUMN payment_method SET DEFAULT 'cash';
ALTER TABLE bill_payments ALTER COLUMN payment_method SET DEFAULT 'cash';
