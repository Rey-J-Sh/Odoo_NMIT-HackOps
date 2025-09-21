// Test script to verify frontend can connect to backend
const API_BASE_URL = 'http://localhost:3001/api'

async function testBackendConnection() {
  console.log('🧪 Testing Frontend-Backend Integration...\n')

  try {
    // Test 1: Health check
    console.log('1. Testing backend health...')
    const healthResponse = await fetch(`${API_BASE_URL}/health`)
    if (healthResponse.ok) {
      console.log('✅ Backend is running')
    } else {
      console.log('❌ Backend health check failed')
      return
    }

    // Test 2: Test authentication
    console.log('\n2. Testing authentication...')
    const authResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    })

    if (authResponse.ok) {
      const authData = await authResponse.json()
      console.log('✅ Authentication successful')
      console.log(`   User: ${authData.user.name} (${authData.user.role})`)
      
      const token = authData.token
      
      // Test 3: Test protected endpoints
      console.log('\n3. Testing protected endpoints...')
      
      // Test contacts
      const contactsResponse = await fetch(`${API_BASE_URL}/contacts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json()
        console.log(`✅ Contacts API working (${contactsData.contacts?.length || 0} contacts)`)
      } else {
        console.log('❌ Contacts API failed')
      }

      // Test products
      const productsResponse = await fetch(`${API_BASE_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (productsResponse.ok) {
        const productsData = await productsResponse.json()
        console.log(`✅ Products API working (${productsData.products?.length || 0} products)`)
      } else {
        console.log('❌ Products API failed')
      }

      // Test invoices
      const invoicesResponse = await fetch(`${API_BASE_URL}/invoices`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json()
        console.log(`✅ Invoices API working (${invoicesData.invoices?.length || 0} invoices)`)
      } else {
        console.log('❌ Invoices API failed')
      }

      // Test accounts
      const accountsResponse = await fetch(`${API_BASE_URL}/accounts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (accountsResponse.ok) {
        const accountsData = await accountsResponse.json()
        console.log(`✅ Accounts API working (${accountsData.accounts?.length || 0} accounts)`)
      } else {
        console.log('❌ Accounts API failed')
      }

      // Test reports
      const reportsResponse = await fetch(`${API_BASE_URL}/reports/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json()
        console.log('✅ Reports API working')
      } else {
        console.log('❌ Reports API failed')
      }

    } else {
      console.log('❌ Authentication failed')
      const errorData = await authResponse.json()
      console.log(`   Error: ${errorData.error}`)
    }

  } catch (error) {
    console.log('❌ Connection failed:', error.message)
    console.log('\n💡 Make sure the backend is running on http://localhost:3001')
    console.log('   Run: cd backend && npm run dev')
  }

  console.log('\n🎉 Frontend-Backend integration test completed!')
  console.log('\n📝 Next steps:')
  console.log('   1. Start the backend: cd backend && npm run dev')
  console.log('   2. Start the frontend: cd shiv-accounts && npm run dev')
  console.log('   3. Open http://localhost:3000 in your browser')
  console.log('   4. Login with admin@example.com / admin123')
}

// Run the test
testBackendConnection()
