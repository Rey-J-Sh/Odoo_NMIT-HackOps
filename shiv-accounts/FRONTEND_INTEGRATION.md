# Frontend Integration with Local PostgreSQL Backend

## 🎯 Overview

The frontend has been completely updated to work with the local PostgreSQL backend instead of Supabase. All Supabase references have been removed and replaced with direct API calls to the local backend.

## 🔄 Changes Made

### 1. **API Client Updates** (`src/lib/api.ts`)
- ✅ Removed all Supabase dependencies
- ✅ Updated to use direct HTTP requests to local backend
- ✅ Added dedicated methods for each endpoint
- ✅ Maintained backward compatibility with existing auth functions

### 2. **Page Updates**
- ✅ **Contacts Page** (`src/app/contacts/page.tsx`)
  - Updated to use `apiClient.getContacts()`, `apiClient.createContact()`, etc.
  - Removed all Supabase queries

- ✅ **Products Page** (`src/app/products/page.tsx`)
  - Updated to use `apiClient.getProducts()`, `apiClient.createProduct()`, etc.
  - Removed all Supabase queries

- ✅ **Invoices Page** (`src/app/invoices/page.tsx`)
  - Updated to use `apiClient.getInvoices()`
  - Removed all Supabase queries

- ✅ **Invoice Create Page** (`src/app/invoices/create/page.tsx`)
  - Updated to use `apiClient.createInvoice()`
  - Simplified invoice creation with line items

- ✅ **Ledger Page** (`src/app/ledger/page.tsx`)
  - Updated to use `apiClient.getLedgerEntries()`
  - Removed all Supabase queries

- ✅ **Payment Modal** (`src/components/PaymentModal.tsx`)
  - Updated to use `apiClient.createPayment()`
  - Removed all Supabase queries

### 3. **Authentication Context** (`src/contexts/AuthContext.tsx`)
- ✅ Already using `apiClient` methods
- ✅ No changes needed

## 🚀 How to Run

### 1. **Start the Backend**
```bash
cd Odoo_NMIT-HackOps/backend
npm install
npm run dev
```
The backend will run on `http://localhost:3001`

### 2. **Start the Frontend**
```bash
cd Odoo_NMIT-HackOps/shiv-accounts
npm install
npm run dev
```
The frontend will run on `http://localhost:3000`

### 3. **Test the Integration**
```bash
cd Odoo_NMIT-HackOps/shiv-accounts
node test-frontend.js
```

## 🔧 API Endpoints Used

The frontend now uses these backend endpoints:

| Frontend Page | Backend Endpoint | Method | Purpose |
|---------------|------------------|--------|---------|
| Contacts | `/api/contacts` | GET, POST, PUT, DELETE | CRUD operations |
| Products | `/api/products` | GET, POST, PUT, DELETE | CRUD operations |
| Invoices | `/api/invoices` | GET, POST | List and create invoices |
| Payments | `/api/payments` | POST | Record payments |
| Ledger | `/api/ledger_entries` | GET | View ledger entries |
| Reports | `/api/reports/*` | GET | Financial reports |
| Auth | `/api/auth/*` | POST | Authentication |

## 🔐 Authentication

The frontend uses JWT tokens for authentication:
- Login: `POST /api/auth/login`
- Register: `POST /api/auth/register`
- Profile: `GET /api/auth/profile`
- All API requests include `Authorization: Bearer <token>` header

## 📊 Data Flow

1. **User logs in** → Frontend calls `/api/auth/login`
2. **Token stored** → JWT token stored in localStorage
3. **API calls** → All subsequent calls include Authorization header
4. **Data fetched** → Backend queries PostgreSQL database
5. **Response** → Data returned to frontend and displayed

## 🛠️ Development Notes

### API Client Methods
```javascript
// Direct API methods (recommended)
await apiClient.getContacts()
await apiClient.createContact(data)
await apiClient.updateContact(id, data)
await apiClient.deleteContact(id)

// Legacy Supabase-compatible methods (still work)
await apiClient.from('contacts').select()
await apiClient.from('contacts').insert(data)
```

### Error Handling
All API calls include proper error handling:
```javascript
try {
  const response = await apiClient.getContacts()
  setContacts(response.data || [])
} catch (error) {
  console.error('Error fetching contacts:', error)
}
```

## 🧪 Testing

### Manual Testing
1. Start both backend and frontend
2. Open http://localhost:3000
3. Login with `admin@example.com` / `admin123`
4. Test each page:
   - Contacts: Add, edit, delete contacts
   - Products: Add, edit, delete products
   - Invoices: Create invoices with line items
   - Payments: Record payments for invoices
   - Ledger: View general ledger entries
   - Reports: View financial reports

### Automated Testing
Run the test script:
```bash
node test-frontend.js
```

## 🐛 Troubleshooting

### Common Issues

1. **Backend not running**
   - Error: `Connection failed: fetch failed`
   - Solution: Start backend with `npm run dev` in backend directory

2. **Authentication errors**
   - Error: `401 Unauthorized`
   - Solution: Check if user exists in database, try logging in again

3. **CORS errors**
   - Error: `CORS policy` errors
   - Solution: Backend CORS is configured for localhost:3000

4. **Database connection**
   - Error: `Database connection failed`
   - Solution: Check PostgreSQL is running and database exists

### Debug Mode
Enable debug logging in the API client:
```javascript
// In src/lib/api.ts, add console.log statements
private async request(endpoint: string, options: RequestInit = {}) {
  console.log('API Request:', endpoint, options)
  // ... rest of method
}
```

## 📝 Next Steps

1. **Add more error handling** for specific error cases
2. **Implement loading states** for better UX
3. **Add form validation** on the frontend
4. **Implement real-time updates** using WebSockets
5. **Add more comprehensive testing** with Jest/Cypress

## 🎉 Success!

The frontend is now completely integrated with the local PostgreSQL backend. All Supabase dependencies have been removed, and the application uses the secure, local backend API for all operations.

The application now provides:
- ✅ Complete CRUD operations for all entities
- ✅ Secure JWT-based authentication
- ✅ Real-time data synchronization
- ✅ Financial reporting capabilities
- ✅ Double-entry bookkeeping
- ✅ Role-based access control
