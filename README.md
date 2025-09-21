Submission Video Link: https://drive.google.com/file/d/1rKuoQRgbW7bORsxV-ZF5R2P1hYtUNt5p/view?usp=drive_link





Shiv Accounts Cloud - Complete Accounting System

A comprehensive cloud-based accounting system built with Next.js frontend and Node.js backend, featuring complete purchase/sales workflows, financial reporting, role-based access control, and Razorpay payment integration.

🚀 Features
Frontend (Next.js + TypeScript + Tailwind CSS)

Modern UI/UX with responsive and improved dashboard design

Authentication with JWT token management

Role-based access control (Admin & Invoicing User)

Dashboard with updated UI, key metrics, and KPIs

Master Data Management (Contacts, Products, Chart of Accounts)

Transaction Workflows (Purchase Orders, Sales Orders, Invoices, Payments)

Razorpay integration for payment processing

Financial Reports (P&L, Balance Sheet, Partner Ledger, Stock Statement)

Local Backend Integration - No external dependencies

Backend (Node.js + Express + PostgreSQL)

RESTful API with comprehensive endpoints

JWT Authentication with role-based authorization

PostgreSQL Database with automatic business logic via triggers

Double-entry bookkeeping with automatic ledger entries

Real-time calculations for invoices, payments, and reports

Security features (rate limiting, input validation, CORS)

Complete Supabase Replacement - Fully self-hosted solution

📋 Complete Workflow
1. User Management

Sign Up/Sign In with email and password

Two User Roles:

Admin: Full access to all features

Invoicing User: Can create transactions, view reports, cannot delete master data

2. Master Data Creation

Contact Master: Customers and Vendors

Product Master: Inventory with SKU, pricing, and tax

Taxes Master: Tax rates and categories

Chart of Accounts: Complete accounting structure

3. Purchase Workflow

Purchase Order → Vendor Bill → Bill Payment

Create purchase orders with line items

Convert to vendor bills with automatic calculations

Record payments and update bill status

4. Sales Workflow

Sale Order → Customer Invoice → Invoice Payment

Create sale orders with line items

Convert to customer invoices with automatic calculations

Record payments and update invoice status

Razorpay integration for payment processing

5. Financial Reports

Partner Ledger: Customer/Vendor transaction history

Profit & Loss: Revenue and expense analysis

Balance Sheet: Assets, liabilities, and equity

Stock Statement: Inventory movement tracking

🛠️ Tech Stack
Frontend

Framework: Next.js 14

Language: TypeScript

Styling: Tailwind CSS

State Management: React Context

HTTP Client: Axios

Backend

Runtime: Node.js

Framework: Express.js

Database: PostgreSQL

Authentication: JWT (jsonwebtoken)

Security: Helmet, express-rate-limit

Validation: express-validator

Database

PostgreSQL with advanced features:

UUID primary keys

Automatic calculations via triggers

Double-entry bookkeeping

Complex reporting queries

🚀 Quick Start
Prerequisites

Node.js (v14 or higher)

PostgreSQL (v12 or higher)

npm or yarn

1. Clone Repository
git clone https://github.com/Rey-J-Sh/Odoo_NMIT-HackOps.git
cd Odoo_NMIT-HackOps

2. Backend Setup
# Windows
setup-backend.bat

# Linux/Mac
chmod +x setup-backend.sh
./setup-backend.sh

3. Frontend Setup
cd shiv-accounts
npm install
npm run dev

4. Access Application

Frontend: http://localhost:3000

Backend API: http://localhost:3001

Default Users:

Admin: admin@shivaccounts.com
 / password123

Accountant: accountant@shivaccounts.com
 / password123

📁 Project Structure
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
├── setup-backend.bat      # Windows setup script
├── setup-backend.sh       # Linux/Mac setup script
└── README.md

🔧 API Documentation
Authentication

POST /api/auth/register - Register new user

POST /api/auth/login - User login

GET /api/auth/profile - Get user profile

Master Data

GET/POST /api/contacts - Customer/Vendor management

GET/POST /api/products - Product management

GET/POST /api/accounts - Chart of accounts

Transactions

GET/POST /api/purchase-orders - Purchase orders

GET/POST /api/vendor-bills - Vendor bills

GET/POST /api/bill-payments - Bill payments

GET/POST /api/sale-orders - Sale orders

GET/POST /api/invoices - Customer invoices

GET/POST /api/payments - Invoice payments (Razorpay integration)

Reports

GET /api/reports/dashboard - Dashboard summary

GET /api/reports/partner-ledger - Partner ledger

GET /api/reports/profit-loss - P&L report

GET /api/reports/balance-sheet - Balance sheet

GET /api/reports/stock-statement - Stock statement

🔒 Security Features

JWT Authentication with secure token management

Role-based access control with granular permissions

Password hashing with bcrypt

Rate limiting (100 requests per 15 minutes)

Input validation with express-validator

SQL injection protection with parameterized queries

CORS configuration for cross-origin requests

🧪 Testing

Backend Testing

cd backend
node test-api.js


Manual Testing

Start both frontend and backend

Register/login with test credentials

Create sample data (contacts, products)

Test transaction workflows

Generate reports and verify dashboard UI updates

🚀 Deployment

Backend: Use PM2, configure reverse proxy (Nginx), SSL, and production environment variables

Database: Use managed PostgreSQL service (AWS RDS), connection pooling, automated backups

Frontend: Build (npm run build) and deploy to Vercel/Netlify with environment variables

🤝 Contributing

Fork the repository

Create a feature branch

Make your changes

Add tests if applicable

Submit a pull request

📝 License

MIT License - see LICENSE file for details

🔄 Supabase Removal

✅ Completed: All Supabase dependencies removed; replaced with local PostgreSQL backend API.
Benefits:

Complete control, better performance, enhanced security, cost-effective, full customization

🎯 Roadmap

Mobile app (React Native)

Advanced reporting features

Multi-currency support

Inventory management

Tax compliance features

API rate limiting improvements

Real-time notifications

Data export/import

Shiv Accounts Cloud - Modern accounting solution for SMEs with Razorpay payments, enhanced dashboard, and full role-based access control 🚀
