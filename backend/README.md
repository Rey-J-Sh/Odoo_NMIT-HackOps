# Shiv Accounts Cloud - Backend API

A comprehensive Node.js backend API for the Shiv Accounts Cloud accounting system, built with Express.js, PostgreSQL, and JWT authentication.

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin & Invoicing User)
- Secure password hashing with bcrypt
- User profile management

### 📊 Master Data Management
- **Contacts**: Customers and Vendors
- **Products**: Inventory management with SKU, pricing, and tax
- **Chart of Accounts**: Complete accounting structure
- **Users**: System user management

### 💼 Transaction Management
- **Purchase Workflow**: Purchase Orders → Vendor Bills → Bill Payments
- **Sales Workflow**: Sale Orders → Customer Invoices → Invoice Payments
- **Double-entry bookkeeping** with automatic ledger entries
- **Real-time calculations** via PostgreSQL triggers

### 📈 Financial Reports
- **Partner Ledger**: Customer/Vendor transaction history
- **Profit & Loss**: Revenue and expense analysis
- **Balance Sheet**: Assets, liabilities, and equity
- **Stock Statement**: Inventory movement tracking
- **Dashboard Summary**: Key metrics and KPIs

### 🛡️ Security Features
- Helmet.js for security headers
- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Input validation with express-validator
- SQL injection protection with parameterized queries

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: helmet, express-rate-limit
- **Database Client**: pg (node-postgres)

## Installation

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rey-J-Sh/Odoo_NMIT-HackOps.git
   cd Odoo_NMIT-HackOps/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=shiv_accounts
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Server Configuration
   PORT=3001
   NODE_ENV=development
   
   # Frontend URL (for CORS)
   FRONTEND_URL=http://localhost:3000
   ```

4. **Database Setup**
   ```bash
   # Create database
   createdb shiv_accounts
   
   # Run schema
   psql -d shiv_accounts -f ../database/schema_final.sql
   
   # Seed with sample data
   psql -d shiv_accounts -f ../database/seed_complete.sql
   ```

5. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /profile` - Get current user profile
- `PUT /profile` - Update user profile
- `PUT /change-password` - Change password
- `POST /logout` - Logout (client-side token removal)

#### Contacts (`/api/contacts`)
- `GET /` - List all contacts (with pagination, search, filtering)
- `GET /:id` - Get contact by ID
- `POST /` - Create new contact
- `PUT /:id` - Update contact
- `DELETE /:id` - Delete contact (Admin only)

#### Products (`/api/products`)
- `GET /` - List all products (with pagination, search)
- `GET /:id` - Get product by ID
- `POST /` - Create new product
- `PUT /:id` - Update product
- `DELETE /:id` - Delete product (Admin only)

#### Chart of Accounts (`/api/accounts`)
- `GET /` - List all accounts (with pagination, search, filtering)
- `GET /:id` - Get account by ID
- `POST /` - Create new account (Admin only)
- `PUT /:id` - Update account (Admin only)
- `DELETE /:id` - Delete account (Admin only)

#### Purchase Orders (`/api/purchase-orders`)
- `GET /` - List all purchase orders
- `GET /:id` - Get purchase order by ID
- `POST /` - Create new purchase order
- `PUT /:id` - Update purchase order
- `DELETE /:id` - Delete purchase order

#### Vendor Bills (`/api/vendor-bills`)
- `GET /` - List all vendor bills
- `GET /:id` - Get vendor bill by ID
- `POST /` - Create new vendor bill
- `PUT /:id` - Update vendor bill
- `DELETE /:id` - Delete vendor bill

#### Bill Payments (`/api/bill-payments`)
- `GET /` - List all bill payments
- `GET /:id` - Get bill payment by ID
- `POST /` - Create new bill payment
- `PUT /:id` - Update bill payment
- `DELETE /:id` - Delete bill payment

#### Sale Orders (`/api/sale-orders`)
- `GET /` - List all sale orders
- `GET /:id` - Get sale order by ID
- `POST /` - Create new sale order
- `PUT /:id` - Update sale order
- `DELETE /:id` - Delete sale order

#### Customer Invoices (`/api/invoices`)
- `GET /` - List all invoices
- `GET /:id` - Get invoice by ID
- `POST /` - Create new invoice
- `PUT /:id` - Update invoice
- `DELETE /:id` - Delete invoice (Admin only)

#### Invoice Payments (`/api/payments`)
- `GET /` - List all invoice payments
- `GET /:id` - Get payment by ID
- `POST /` - Create new payment
- `PUT /:id` - Update payment
- `DELETE /:id` - Delete payment

#### Reports (`/api/reports`)
- `GET /partner-ledger` - Partner ledger report
- `GET /profit-loss` - Profit & Loss report
- `GET /balance-sheet` - Balance Sheet report
- `GET /stock-statement` - Stock statement report
- `GET /dashboard` - Dashboard summary

### Query Parameters

Most list endpoints support:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `search` - Search term
- `status` - Filter by status
- `type` - Filter by type

Report endpoints support date filtering:
- `start_date` - Start date (ISO 8601 format)
- `end_date` - End date (ISO 8601 format)
- `as_of_date` - As of date for balance sheet

## Database Schema

The application uses PostgreSQL with the following key tables:

### Core Tables
- `users` - System users and authentication
- `contacts` - Customers and vendors
- `products` - Product catalog
- `accounts` - Chart of accounts

### Transaction Tables
- `purchase_orders` - Purchase orders
- `purchase_order_lines` - Purchase order line items
- `vendor_bills` - Vendor bills
- `vendor_bill_lines` - Vendor bill line items
- `bill_payments` - Bill payments
- `sale_orders` - Sale orders
- `sale_order_lines` - Sale order line items
- `invoices` - Customer invoices
- `invoice_lines` - Invoice line items
- `payments` - Invoice payments

### Accounting Tables
- `ledger_entries` - Double-entry bookkeeping entries

## Business Logic

### Automatic Calculations
The database handles complex business logic through PostgreSQL functions and triggers:

- **Invoice totals** are automatically calculated when line items change
- **Ledger entries** are created automatically for invoices and payments
- **Payment status** is updated automatically based on payment amounts
- **Running balances** are maintained for all accounts

### Role-Based Access Control

#### Admin Role
- Full access to all endpoints
- Can create, modify, and delete master data
- Can delete transactions
- Can manage user accounts

#### Invoicing User Role
- Can create and modify master data
- Can create and modify transactions
- Can view all reports
- Cannot delete master data or transactions

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details (development only)"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

## Development

### Scripts
```bash
npm run dev      # Start with nodemon
npm start        # Start production server
npm test         # Run tests
```

### Code Structure
```
src/
├── config/
│   └── database.js      # Database connection
├── middleware/
│   └── auth.js          # Authentication middleware
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── contacts.js      # Contact management
│   ├── products.js      # Product management
│   ├── accounts.js      # Chart of accounts
│   ├── purchase-orders.js
│   ├── vendor-bills.js
│   ├── bill-payments.js
│   ├── sale-orders.js
│   ├── invoices.js      # Customer invoices
│   └── reports.js       # Financial reports
└── server.js            # Main server file
```

## Production Deployment

### Environment Variables
Set the following environment variables in production:

```env
NODE_ENV=production
DB_HOST=your-production-db-host
DB_PASSWORD=your-secure-password
JWT_SECRET=your-very-secure-jwt-secret
FRONTEND_URL=https://your-frontend-domain.com
```

### Security Considerations
- Use strong, unique JWT secrets
- Enable SSL/TLS for database connections
- Use environment variables for sensitive data
- Regularly update dependencies
- Monitor for security vulnerabilities

### Performance
- Database indexes are optimized for common queries
- Connection pooling is configured
- Rate limiting prevents abuse
- Pagination is implemented for large datasets

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, please contact the development team or create an issue in the repository.
