Submission Video Link: https://drive.google.com/file/d/1rKuoQRgbW7bORsxV-ZF5R2P1hYtUNt5p/view?usp=drive_link



# Shiv Accounts Cloud - Complete Accounting System

A comprehensive cloud-based accounting system built with Next.js frontend and Node.js backend, featuring complete purchase/sales workflows, financial reporting, and role-based access control.

## 🚀 Features

### Frontend (Next.js + TypeScript + Tailwind CSS)
- Modern UI/UX with responsive design
- Authentication with JWT token management
- Role-based access control (Admin & Invoicing User)
- Dashboard with key metrics and KPIs
- Master Data Management (Contacts, Products, Chart of Accounts)
- Transaction Workflows (Purchase Orders, Sales Orders, Invoices, Payments)
- Financial Reports (P&L, Balance Sheet, Partner Ledger, Stock Statement)
- **Local Backend Integration** - No external dependencies

### Backend (Node.js + Express + PostgreSQL)
- RESTful API with comprehensive endpoints
- JWT Authentication with role-based authorization
- PostgreSQL Database with automatic business logic via triggers
- Double-entry bookkeeping with automatic ledger entries
- Real-time calculations for invoices, payments, and reports
- Security features (rate limiting, input validation, CORS)
- **Complete Supabase Replacement** - Fully self-hosted solution

## 📋 Complete Workflow

### 1. User Management
- Sign Up/Sign In with email and password
- Two User Roles:
  - **Admin**: Full access to all features
  - **Invoicing User**: Can create transactions and view reports

### 2. Master Data Creation
- **Contact Master**: Customers and Vendors
- **Product Master**: Inventory with SKU, pricing, and tax
- **Taxes Master**: Tax rates and categories
- **Chart of Accounts**: Complete accounting structure

### 3. Purchase Workflow
- Purchase Order → Vendor Bill → Bill Payment
- Create purchase orders with line items
- Convert to vendor bills with automatic calculations
- Record payments and update bill status

### 4. Sales Workflow
- Sale Order → Customer Invoice → Invoice Payment
- Create sale orders with line items
- Convert to customer invoices with automatic calculations
- Record payments and update invoice status

### 5. Financial Reports
- **Partner Ledger**: Customer/Vendor transaction history
- **Profit & Loss**: Revenue and expense analysis

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Security**: Helmet, express-rate-limit
- **Validation**: express-validator

### Database
- **PostgreSQL** with advanced features:
  - UUID primary keys
  - Automatic calculations via triggers
  - Double-entry bookkeeping
  - Complex reporting queries

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Clone Repository
```bash
git clone https://github.com/Rey-J-Sh/Odoo_NMIT-HackOps.git
cd Odoo_NMIT-HackOps
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd shiv-accounts
npm install
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

**Default Users**:
- **Admin**: demo@demo.com / password: demo1234
- **Accountant**: test@test.com / password: test1234

## 📁 Project Structure

```
Odoo_NMIT-HackOps/
├── backend/                 # Node.js Backend
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── middleware/     # Authentication middleware
│   │   ├── routes/         # API routes
│   │   └── server.js       # Main server file
│   ├── package.json
│   └── README.md
├── shiv-accounts/          # Next.js Frontend
│   ├── src/
│   │   ├── app/           # Next.js app directory
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── lib/           # Utility functions
│   │   └── styles/        # CSS styles
│   ├── package.json
│   └── README.md
├── database/               # Database files
│   ├── schema_final.sql   # Complete database schema
│   └── seed_complete.sql  # Sample data
└── README.md
```

## 🔧 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Master Data
- `GET/POST /api/contacts` - Customer/Vendor management
- `GET/POST /api/products` - Product management
- `GET/POST /api/accounts` - Chart of accounts

### Transactions
- `GET/POST /api/purchase-orders` - Purchase orders
- `GET/POST /api/vendor-bills` - Vendor bills
- `GET/POST /api/bill-payments` - Bill payments
- `GET/POST /api/sale-orders` - Sale orders
- `GET/POST /api/invoices` - Customer invoices
- `GET/POST /api/payments` - Invoice payments

## 🗄 Database Schema

### Core Tables
- `users` - System users and authentication
- `contacts` - Customers and vendors
- `products` - Product catalog
- `accounts` - Chart of accounts

### Transaction Tables
- `purchase_orders` & `purchase_order_lines`
- `vendor_bills` & `vendor_bill_lines`
- `bill_payments`
- `sale_orders` & `sale_order_lines`
- `invoices` & `invoice_lines`
- `payments`

### Accounting
- `ledger_entries` - Double-entry bookkeeping

## 🔒 Security Features

- JWT Authentication with secure token management
- Role-based access control with granular permissions
- Password hashing with bcrypt
- Rate limiting (100 requests per 15 minutes)
- Input validation with express-validator
- SQL injection protection with parameterized queries
- CORS configuration for cross-origin requests

## 📊 Business Logic

### Automatic Calculations
The database handles complex business logic through PostgreSQL functions and triggers:

- Invoice totals calculated automatically when line items change
- Ledger entries created automatically for all transactions
- Payment status updated automatically based on payment amounts
- Running balances maintained for all accounts

### Role Permissions
- **Admin**: Full access to all features, can delete master data
- **Invoicing User**: Can create/modify data, view reports, cannot delete

### Additional Features
- Added **Razor Pay** for UPI payments
- **Role-based access control** with admin and invoice user permissions

## 🧪 Testing

### Backend Testing
```bash
cd backend
node test-api.js
```

### Manual Testing
1. Start both frontend and backend
2. Register/login with test credentials
3. Create sample data (contacts, products)
4. Test transaction workflows
5. Generate reports

## 📝 License

MIT License - see LICENSE file for details

---

**Built with ❤️ for comprehensive business accounting needs**
