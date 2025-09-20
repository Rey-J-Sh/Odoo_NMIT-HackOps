'use client'

import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'

export default function AuthDebug() {
  const { user, profile, loading } = useAuth()

  const testApi = async () => {
    try {
      const response = await apiClient.request('/health')
      console.log('Health check:', response)
    } catch (error) {
      console.error('Health check failed:', error)
    }
  }

  const testAuth = async () => {
    try {
      const response = await apiClient.getCurrentUser()
      console.log('Current user:', response)
    } catch (error) {
      console.error('Get current user failed:', error)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs z-50 max-w-xs">
      <div className="mb-2 font-bold">Auth Debug</div>
      <div>Loading: {loading ? 'true' : 'false'}</div>
      <div>User: {user ? 'logged in' : 'not logged in'}</div>
      <div>Profile: {profile ? profile.role : 'none'}</div>
      <div>Token: {typeof window !== 'undefined' ? (localStorage.getItem('auth_token') ? 'exists' : 'none') : 'unknown'}</div>
      <div className="mt-2 space-y-1">
        <button 
          onClick={testApi}
          className="bg-blue-500 text-white px-2 py-1 rounded text-xs mr-1"
        >
          Test API
        </button>
        <button 
          onClick={testAuth}
          className="bg-green-500 text-white px-2 py-1 rounded text-xs"
        >
          Test Auth
        </button>
      </div>
    </div>
  )
}

