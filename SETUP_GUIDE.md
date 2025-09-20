# Shiv Accounts Cloud - Setup Guide

## Overview
Shiv Accounts Cloud is a cloud-based accounting system built for furniture businesses. It replaces spreadsheets with a modern web application that handles contacts, products, invoices, payments, and double-entry bookkeeping.

## Tech Stack
- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Database**: PostgreSQL with stored functions for business logic
- **UI Components**: Lucide React icons, custom components

## Quick Setup (5 minutes)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `shiv-accounts-cloud`
   - Database Password: Generate a strong password
   - Region: Choose closest to your location
5. Click "Create new project"
6. Wait for project to be ready (2-3 minutes)

### 2. Get Supabase Credentials
1. In your Supabase dashboard, go to Settings → API
2. Copy the following values:
   - Project URL
   - Anon public key
   - Service role key (keep this secret!)

### 3. Setup Database Schema
1. In Supabase dashboard, go to SQL Editor
2. Copy the contents of `database/schema.sql` and run it
3. Copy the contents of `database/seed.sql` and run it
4. Verify tables are created in the Table Editor

### 4. Configure Environment Variables
1. In the `shiv-accounts` folder, create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 5. Install Dependencies and Run
```bash
cd shiv-accounts
npm install
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features Implemented

### ✅ Core Features
- **Dashboard**: KPIs showing total contacts, products, invoices, receivables, revenue, and unpaid invoices
- **Contacts Management**: CRUD operations for customers and vendors
- **Products Management**: CRUD operations with SKU, price, tax, and HSN codes
- **Invoices List**: View all invoices with status, amounts, and customer info
- **Database Schema**: Complete double-entry bookkeeping with automatic ledger entries
- **Demo Data**: 8 contacts, 8 products, 10 invoices with various statuses

### 🔄 In Progress
- Invoice creation form
- Payment recording
- Ledger view with filtering
- CSV/PDF exports

### 📋 Pending
- User authentication
- Role-based access control
- Advanced reporting
- Inventory management

## Database Schema

### Core Tables
- `accounts`: Chart of accounts (Assets, Liabilities, Revenue, Expenses)
- `contacts`: Customers and vendors
- `products`: Product catalog with pricing and tax info
- `invoices`: Sales invoices with status tracking
- `invoice_lines`: Line items for each invoice
- `payments`: Payment records against invoices
- `ledger_entries`: Double-entry bookkeeping records
- `users`: User management for authentication

### Key Features
- **Automatic Calculations**: Invoice totals update when line items change
- **Double-Entry Bookkeeping**: Every transaction creates proper ledger entries
- **Status Management**: Invoice status updates automatically based on payments
- **Audit Trail**: All ledger entries are append-only and timestamped

## Business Logic

### Invoice Flow
1. Create invoice with customer and line items
2. System calculates subtotal, tax, and total
3. When invoice status changes from 'draft' to 'open':
   - Debit: Accounts Receivable
   - Credit: Sales Revenue
   - Credit: Tax Payable (if applicable)

### Payment Flow
1. Record payment against invoice
2. System creates ledger entries:
   - Debit: Cash/Bank
   - Credit: Accounts Receivable
3. Invoice status updates automatically:
   - No payments: 'open'
   - Partial payment: 'partially_paid'
   - Full payment: 'paid'

## Demo Data
The system comes with realistic demo data:
- **8 Contacts**: Mix of customers and vendors with complete information
- **8 Products**: Furniture items with proper pricing and tax rates
- **10 Invoices**: Various statuses (paid, partially paid, open) with realistic amounts
- **6 Payments**: Sample payment records showing the payment flow

## Development Notes

### File Structure
```
shiv-accounts/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Dashboard
│   │   ├── contacts/page.tsx # Contacts management
│   │   ├── products/page.tsx # Products management
│   │   └── invoices/page.tsx # Invoices list
│   └── lib/
│       └── supabase.ts       # Database client and types
├── database/
│   ├── schema.sql            # Database schema
│   └── seed.sql              # Demo data
└── SETUP_GUIDE.md           # This file
```

### Key Components
- **Dashboard**: Real-time KPIs with Supabase queries
- **CRUD Pages**: Full create, read, update, delete operations
- **Type Safety**: Complete TypeScript types for all database tables
- **Responsive Design**: Mobile-friendly with Tailwind CSS

## Next Steps for Hackathon

### Immediate (Next 2 hours)
1. Complete invoice creation form
2. Add payment recording functionality
3. Implement ledger view with filtering
4. Add basic CSV export

### Stretch Goals
1. PDF invoice generation
2. User authentication
3. Advanced reporting
4. Inventory tracking

## Troubleshooting

### Common Issues
1. **Environment variables not loading**: Restart the dev server after adding `.env.local`
2. **Database connection errors**: Verify Supabase URL and keys are correct
3. **Schema errors**: Make sure all SQL scripts ran successfully in Supabase
4. **Build errors**: Run `npm install` to ensure all dependencies are installed

### Support
- Check Supabase dashboard for database errors
- Use browser dev tools for frontend debugging
- Verify all environment variables are set correctly

## Production Deployment

### Supabase
- Upgrade to paid plan for production use
- Configure proper security policies
- Set up database backups

### Frontend
- Deploy to Vercel, Netlify, or similar
- Configure environment variables in deployment platform
- Set up custom domain

---

**Ready to demo in under 24 hours!** 🚀

The system provides a solid foundation for cloud accounting with proper double-entry bookkeeping, making it suitable for real business use with additional features.
