const axios = require('axios');

const BASE_URL = 'http://localhost:3001/api';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
  role: 'admin'
};

const testContact = {
  name: 'Test Customer',
  email: 'customer@test.com',
  phone: '+1-555-0123',
  address: '123 Test St, Test City, TC 12345',
  contact_type: 'customer'
};

const testProduct = {
  sku: 'TEST-001',
  name: 'Test Product',
  description: 'A test product',
  price: 100.00,
  tax_percentage: 18.00,
  hsn_code: '1234.56.78'
};

async function testAPI() {
  console.log('🚀 Starting API Tests...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get(`${BASE_URL.replace('/api', '')}/health`);
    console.log('✅ Health Check:', healthResponse.data.status);

    // Test 2: Register User
    console.log('\n2. Testing User Registration...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
      console.log('✅ User Registration:', registerResponse.data.message);
      var authToken = registerResponse.data.token;
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.error === 'User already exists') {
        console.log('ℹ️  User already exists, proceeding with login...');
        
        // Test 3: Login
        console.log('\n3. Testing User Login...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
          email: testUser.email,
          password: testUser.password
        });
        console.log('✅ User Login:', loginResponse.data.message);
        var authToken = loginResponse.data.token;
      } else {
        throw error;
      }
    }

    const headers = { Authorization: `Bearer ${authToken}` };

    // Test 4: Get Profile
    console.log('\n4. Testing Get Profile...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, { headers });
    console.log('✅ Get Profile:', profileResponse.data.user.name);

    // Test 5: Create Contact
    console.log('\n5. Testing Create Contact...');
    const contactResponse = await axios.post(`${BASE_URL}/contacts`, testContact, { headers });
    console.log('✅ Create Contact:', contactResponse.data.name);
    const contactId = contactResponse.data.id;

    // Test 6: Get Contacts
    console.log('\n6. Testing Get Contacts...');
    const contactsResponse = await axios.get(`${BASE_URL}/contacts`, { headers });
    console.log('✅ Get Contacts:', `${contactsResponse.data.contacts.length} contacts found`);

    // Test 7: Create Product
    console.log('\n7. Testing Create Product...');
    const productResponse = await axios.post(`${BASE_URL}/products`, testProduct, { headers });
    console.log('✅ Create Product:', productResponse.data.name);
    const productId = productResponse.data.id;

    // Test 8: Get Products
    console.log('\n8. Testing Get Products...');
    const productsResponse = await axios.get(`${BASE_URL}/products`, { headers });
    console.log('✅ Get Products:', `${productsResponse.data.products.length} products found`);

    // Test 9: Create Invoice
    console.log('\n9. Testing Create Invoice...');
    const invoiceData = {
      contact_id: contactId,
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      notes: 'Test invoice',
      line_items: [
        {
          product_id: productId,
          description: 'Test Product Sale',
          quantity: 2,
          unit_price: 100.00,
          tax_percentage: 18.00
        }
      ]
    };
    const invoiceResponse = await axios.post(`${BASE_URL}/invoices`, invoiceData, { headers });
    console.log('✅ Create Invoice:', invoiceResponse.data.invoice_number);

    // Test 10: Get Dashboard Summary
    console.log('\n10. Testing Dashboard Summary...');
    const dashboardResponse = await axios.get(`${BASE_URL}/reports/dashboard`, { headers });
    console.log('✅ Dashboard Summary:', {
      customers: dashboardResponse.data.contacts.customers,
      products: dashboardResponse.data.total_products,
      monthlyRevenue: dashboardResponse.data.monthly_revenue
    });

    // Test 11: Get Chart of Accounts
    console.log('\n11. Testing Chart of Accounts...');
    const accountsResponse = await axios.get(`${BASE_URL}/accounts`, { headers });
    console.log('✅ Chart of Accounts:', `${accountsResponse.data.accounts.length} accounts found`);

    console.log('\n🎉 All tests passed successfully!');
    console.log('\n📊 API Summary:');
    console.log(`- Server: ${BASE_URL.replace('/api', '')}`);
    console.log(`- Authentication: JWT Token-based`);
    console.log(`- Database: PostgreSQL with automatic calculations`);
    console.log(`- Features: Complete accounting workflow implemented`);

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 500) {
      console.log('\n💡 Make sure the database is running and the schema is loaded:');
      console.log('   psql -d shiv_accounts -f ../database/schema_final.sql');
      console.log('   psql -d shiv_accounts -f ../database/seed_complete.sql');
    }
    process.exit(1);
  }
}

// Run tests
testAPI();
