# Shiv Accounts Cloud - Custom Backend Version

A comprehensive cloud-based accounting system for furniture businesses, now powered by a custom Node.js backend with PostgreSQL database.

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **PostgreSQL** - Relational database
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing

### Database
- **PostgreSQL** - Primary database
- **AWS RDS** - Cloud database hosting (production)

## 📁 Project Structure

```
shiv-accounts/
├── src/                          # Frontend (Next.js)
│   ├── app/                      # App Router pages
│   ├── components/               # React components
│   ├── contexts/                 # React contexts
│   └── lib/                      # Utilities and API client
├── backend/                      # Backend (Node.js)
│   ├── src/
│   │   ├── config/               # Database configuration
│   │   ├── middleware/           # Express middleware
│   │   ├── routes/               # API routes
│   │   └── server.js             # Main server file
│   └── package.json              # Backend dependencies
├── database/                     # Database files
│   ├── schema_updated.sql        # Updated database schema
│   └── seed.sql                  # Sample data
└── README_UPDATED.md             # This file
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn

### 1. Database Setup

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL locally
# Create database
createdb shiv_accounts

# Run schema
psql -d shiv_accounts -f database/schema_updated.sql

# Seed data (optional)
psql -d shiv_accounts -f database/seed.sql
```

#### Option B: AWS RDS PostgreSQL
1. Create RDS PostgreSQL instance on AWS
2. Configure security groups for your IP
3. Connect and run schema:
```bash
psql -h your-rds-endpoint.region.rds.amazonaws.com -U your_username -d shiv_accounts -f database/schema_updated.sql
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost (or your RDS endpoint)
# DB_PORT=5432
# DB_NAME=shiv_accounts
# DB_USER=your_username
# DB_PASSWORD=your_password
# JWT_SECRET=your-super-secret-jwt-key
# FRONTEND_URL=http://localhost:3000

# Start backend server
npm run dev
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd shiv-accounts

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local

# Start frontend development server
npm run dev
```

## 🔐 Authentication System

### Features
- **JWT-based authentication** - Secure token-based auth
- **Password hashing** - bcryptjs for secure password storage
- **Role-based access** - Admin and Invoicing User roles
- **Session management** - Automatic token handling

### User Roles
- **Admin**: Full access to all features
- **Invoicing User**: Limited access to invoices and payments

### Demo Accounts
- **Admin**: `admin@shivaccounts.com` / `admin123`
- **Invoicing User**: `invoice@shivaccounts.com` / `invoice123`

## 🗄️ Database Schema

The database includes:
- **Users** - Authentication and user management
- **Contacts** - Customers and vendors
- **Products** - Product catalog
- **Invoices** - Sales invoices
- **Invoice Lines** - Invoice line items
- **Payments** - Payment records
- **Ledger Entries** - Double-entry bookkeeping
- **Accounts** - Chart of accounts

### Key Features
- **Automatic calculations** - Triggers for invoice totals
- **Double-entry bookkeeping** - Automatic ledger entries
- **Payment tracking** - Invoice status updates
- **Data integrity** - Foreign key constraints

## 🚀 Deployment

### Backend Deployment

#### Option A: Vercel (Serverless)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy backend
cd backend
vercel --prod
```

#### Option B: AWS EC2
```bash
# Create EC2 instance
# Install Node.js and PostgreSQL client
# Clone repository
# Install dependencies
# Configure environment
# Use PM2 for process management
npm install -g pm2
pm2 start src/server.js --name "shiv-accounts-api"
```

### Frontend Deployment

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd shiv-accounts
vercel --prod
```

### Database Deployment

#### AWS RDS PostgreSQL
1. Create RDS PostgreSQL instance
2. Configure security groups
3. Set up VPC and subnets
4. Configure backup and monitoring
5. Update backend environment variables

## 🔧 Environment Variables

### Backend (.env)
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shiv_accounts
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Server
PORT=3001
NODE_ENV=production

# CORS
FRONTEND_URL=https://your-frontend-domain.com
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - Logout

### Business Logic
- `GET /api/contacts` - List contacts
- `POST /api/contacts` - Create contact
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/invoices` - List invoices
- `POST /api/invoices` - Create invoice

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcryptjs with salt rounds
- **Rate Limiting** - API rate limiting
- **CORS Protection** - Cross-origin request security
- **Input Validation** - Request validation
- **SQL Injection Protection** - Parameterized queries

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd shiv-accounts
npm run build
npm start
```

## 📈 Monitoring

### Backend Monitoring
- Health check endpoint: `GET /health`
- Process monitoring with PM2
- Database connection monitoring
- Error logging

### Database Monitoring
- AWS CloudWatch (for RDS)
- Query performance monitoring
- Connection pool monitoring

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check database credentials
   - Verify network connectivity
   - Check firewall settings

2. **Authentication Errors**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Verify user exists in database

3. **CORS Errors**
   - Check FRONTEND_URL in backend .env
   - Verify frontend is calling correct API URL

### Debug Steps

1. Check backend logs
2. Verify database connection
3. Test API endpoints with Postman
4. Check browser console for errors
5. Verify environment variables

## 📝 Migration from Supabase

### What Changed
- ✅ Removed Supabase dependencies
- ✅ Implemented custom authentication
- ✅ Created Node.js backend API
- ✅ Updated database schema
- ✅ Maintained all business logic
- ✅ Preserved frontend functionality

### Migration Steps
1. Set up PostgreSQL database
2. Run updated schema
3. Deploy Node.js backend
4. Update frontend environment
5. Test all functionality

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues or questions:
1. Check troubleshooting section
2. Review API documentation
3. Check database logs
4. Verify environment configuration

---

**Note**: This is a complete replacement of the Supabase backend with a custom Node.js solution. All business logic and database functions are preserved while providing full control over the backend infrastructure.

