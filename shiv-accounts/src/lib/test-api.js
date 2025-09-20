// Test script to verify API client is working
import { apiClient } from './api.js'

async function testAPI() {
  try {
    console.log('Testing API connection...')
    
    // Test health endpoint
    const health = await apiClient.request('/health')
    console.log('Health check:', health)
    
    // Test login
    const loginResponse = await apiClient.signIn('admin@shivaccounts.com', 'admin123')
    console.log('Login response:', loginResponse)
    
    // Test getting invoices
    const invoices = await apiClient.request('/invoices')
    console.log('Invoices:', invoices)
    
  } catch (error) {
    console.error('API test failed:', error)
  }
}

testAPI()

