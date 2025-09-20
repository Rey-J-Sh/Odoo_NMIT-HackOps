# Shiv Accounts Cloud

A modern cloud-based accounting system built for furniture businesses, replacing spreadsheets with a comprehensive web application.

## 🚀 Features

### ✅ Implemented
- **Dashboard**: Real-time KPIs showing total contacts, products, invoices, receivables, revenue, and unpaid invoices
- **Contacts Management**: Full CRUD operations for customers and vendors
- **Products Management**: Complete product catalog with SKU, pricing, tax rates, and HSN codes
- **Invoice Management**: Create, view, and manage sales invoices with line items
- **Payment Recording**: Record payments against invoices with automatic status updates
- **General Ledger**: Double-entry bookkeeping with automatic ledger entries
- **Reports**: Basic financial reports with export functionality
- **Data Export**: CSV export for ledger entries and financial reports

### 🔄 Core Business Logic
- **Automatic Calculations**: Invoice totals update when line items change
- **Double-Entry Bookkeeping**: Every transaction creates proper ledger entries
- **Status Management**: Invoice status updates automatically based on payments
- **Audit Trail**: All ledger entries are append-only and timestamped

## 🛠 Tech Stack

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Database**: PostgreSQL with stored functions for business logic
- **UI Components**: Lucide React icons, custom components
- **Export**: CSV generation for data export

## 📊 Database Schema

### Core Tables
- `accounts`: Chart of accounts (Assets, Liabilities, Revenue, Expenses)
- `contacts`: Customers and vendors
- `products`: Product catalog with pricing and tax info
- `invoices`: Sales invoices with status tracking
- `invoice_lines`: Line items for each invoice
- `payments`: Payment records against invoices
- `ledger_entries`: Double-entry bookkeeping records
- `users`: User management for authentication

## 🚀 Quick Start

### 1. Setup Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL scripts in the `database/` folder:
   - `schema.sql` - Creates all tables and functions
   - `seed.sql` - Inserts demo data

### 2. Configure Environment
Create `.env.local` in the project root:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Install and Run
```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
shiv-accounts/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Dashboard
│   │   ├── contacts/page.tsx     # Contacts management
│   │   ├── products/page.tsx     # Products management
│   │   ├── invoices/
│   │   │   ├── page.tsx          # Invoices list
│   │   │   └── create/page.tsx   # Invoice creation
│   │   ├── ledger/page.tsx       # General ledger
│   │   └── reports/page.tsx      # Financial reports
│   ├── components/
│   │   └── PaymentModal.tsx      # Payment recording modal
│   └── lib/
│       └── supabase.ts           # Database client and types
├── database/
│   ├── schema.sql                # Database schema
│   └── seed.sql                  # Demo data
└── README.md                     # This file
```

## 💼 Business Logic

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

## 📈 Demo Data

The system comes with realistic demo data:
- **8 Contacts**: Mix of customers and vendors
- **8 Products**: Furniture items with proper pricing
- **10 Invoices**: Various statuses with realistic amounts
- **6 Payments**: Sample payment records

## 🔮 Future Enhancements

- User authentication and role-based access
- Advanced reporting (P&L, Balance Sheet)
- Inventory management
- GST compliance features
- PDF invoice generation
- Customer portal
- Mobile app

## 🏆 Hackathon Ready

This application is designed for hackathon presentation with:
- Complete working demo in under 24 hours
- Realistic business data
- Professional UI/UX
- Proper accounting principles
- Export functionality
- Scalable architecture

## 📝 License

This project is created for educational and hackathon purposes.

---

**Ready to demo!** 🚀

The system provides a solid foundation for cloud accounting with proper double-entry bookkeeping, making it suitable for real business use with additional features.