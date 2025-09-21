# Shiv Accounts Cloud - Complete Accounting System

A comprehensive cloud-based accounting system built with Next.js frontend and Node.js backend, featuring complete purchase/sales workflows, financial reporting, and role-based access control.

## 🚀 Features

### Frontend (Next.js + TypeScript + Tailwind CSS)
- **Modern UI/UX** with responsive design
- **Authentication** with JWT token management
- **Role-based access control** (Admin & Invoicing User)
- **Dashboard** with key metrics and KPIs
- **Master Data Management** (Contacts, Products, Chart of Accounts)
- **Transaction Workflows** (Purchase Orders, Sales Orders, Invoices, Payments)
- **Financial Reports** (P&L, Balance Sheet, Partner Ledger, Stock Statement)
- **Local Backend Integration** - No external dependencies

### Backend (Node.js + Express + PostgreSQL)
- **RESTful API** with comprehensive endpoints
- **JWT Authentication** with role-based authorization
- **PostgreSQL Database** with automatic business logic via triggers
- **Double-entry bookkeeping** with automatic ledger entries
- **Real-time calculations** for invoices, payments, and reports
- **Security features** (rate limiting, input validation, CORS)
- **Complete Supabase Replacement** - Fully self-hosted solution

## 📋 Complete Workflow

### 1. User Management
- **Sign Up/Sign In** with email and password
- **Two User Roles**:
  - **Admin**: Full access to all features
  - **Invoicing User**: Can create transactions and view reports

### 2. Master Data Creation
- **Contact Master**: Customers and Vendors
- **Product Master**: Inventory with SKU, pricing, and tax
- **Taxes Master**: Tax rates and categories
- **Chart of Accounts**: Complete accounting structure

### 3. Purchase Workflow
```
Purchase Order → Vendor Bill → Bill Payment
```
- Create purchase orders with line items
- Convert to vendor bills with automatic calculations
- Record payments and update bill status

### 4. Sales Workflow
```
Sale Order → Customer Invoice → Invoice Payment
```
- Create sale orders with line items
- Convert to customer invoices with automatic calculations
- Record payments and update invoice status

### 5. Financial Reports
- **Partner Ledger**: Customer/Vendor transaction history
- **Profit & Loss**: Revenue and expense analysis
- **Balance Sheet**: Assets, liabilities, and equity
- **Stock Statement**: Inventory movement tracking

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **HTTP Client**: Axios

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
# Windows
setup-backend.bat

# Linux/Mac
chmod +x setup-backend.sh
./setup-backend.sh
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
- **Default Users**:
  - Admin: `admin@shivaccounts.com` / `password123`
  - Accountant: `accountant@shivaccounts.com` / `password123`

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
├── setup-backend.bat      # Windows setup script
├── setup-backend.sh       # Linux/Mac setup script
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

### Reports
- `GET /api/reports/dashboard` - Dashboard summary
- `GET /api/reports/partner-ledger` - Partner ledger
- `GET /api/reports/profit-loss` - P&L report
- `GET /api/reports/balance-sheet` - Balance sheet
- `GET /api/reports/stock-statement` - Stock statement

## 🗄️ Database Schema

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

- **JWT Authentication** with secure token management
- **Role-based access control** with granular permissions
- **Password hashing** with bcrypt
- **Rate limiting** (100 requests per 15 minutes)
- **Input validation** with express-validator
- **SQL injection protection** with parameterized queries
- **CORS configuration** for cross-origin requests

## 📊 Business Logic

### Automatic Calculations
The database handles complex business logic through PostgreSQL functions and triggers:

- **Invoice totals** calculated automatically when line items change
- **Ledger entries** created automatically for all transactions
- **Payment status** updated automatically based on payment amounts
- **Running balances** maintained for all accounts

### Role Permissions
- **Admin**: Full access to all features, can delete master data
- **Invoicing User**: Can create/modify data, view reports, cannot delete

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

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Use PM2 or similar process manager
3. Configure reverse proxy (Nginx)
4. Set up SSL certificates

### Database Deployment
1. Use managed PostgreSQL service (AWS RDS, etc.)
2. Configure connection pooling
3. Set up automated backups
4. Monitor performance

### Frontend Deployment
1. Build for production: `npm run build`
2. Deploy to Vercel, Netlify, or similar
3. Configure environment variables
4. Set up custom domain

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🔄 Supabase Removal

**✅ COMPLETED**: All Supabase dependencies have been completely removed from the frontend and replaced with direct PostgreSQL backend integration.

### What Changed
- **Frontend**: Updated to use local backend API instead of Supabase
- **Authentication**: JWT-based auth with local backend
- **Database**: Direct PostgreSQL connection via backend API
- **No External Dependencies**: Fully self-hosted solution

### Benefits
- ✅ **Complete Control**: No external service dependencies
- ✅ **Better Performance**: Direct database access
- ✅ **Enhanced Security**: All data stays on your servers
- ✅ **Cost Effective**: No external service fees
- ✅ **Full Customization**: Complete control over business logic

See [FRONTEND_INTEGRATION.md](shiv-accounts/FRONTEND_INTEGRATION.md) for detailed integration information.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced reporting features
- [ ] Multi-currency support
- [ ] Inventory management
- [ ] Tax compliance features
- [ ] API rate limiting improvements
- [ ] Real-time notifications
- [ ] Data export/import

---

**Shiv Accounts Cloud** - Complete accounting solution for modern businesses 🚀