'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'

interface User {
  id: string
  email: string
  name: string | null
  role: 'admin' | 'invoicing_user'
}

interface UserProfile {
  id: string
  email: string
  name: string | null
  role: 'admin' | 'invoicing_user'
  is_active: boolean
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any }>
  signOut: () => Promise<void>
  isAdmin: boolean
  isInvoicingUser: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        // Check if there's a token in localStorage
        const token = localStorage.getItem('auth_token')
        
        if (!token) {
          setUser(null)
          setProfile(null)
          setLoading(false)
          return
        }

        const { user, error } = await apiClient.getCurrentUser()
        
        if (user && !error) {
          setUser(user)
          setProfile({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        } else {
          // Invalid token, clear it
          localStorage.removeItem('auth_token')
          setUser(null)
          setProfile(null)
        }
      } catch (error) {
        console.error('Error getting initial session:', error)
        // Clear invalid token
        localStorage.removeItem('auth_token')
        setUser(null)
        setProfile(null)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const response = await apiClient.signIn(email, password)
      if (response.user) {
        apiClient.setToken(response.token)
        setUser(response.user)
        setProfile({
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        return { user: response.user, error: null }
      } else {
        return { user: null, error: { message: 'Login failed' } }
      }
    } catch (error: any) {
      return { user: null, error }
    }
  }

  const signOut = async () => {
    try {
      await apiClient.signOut()
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signOut,
    isAdmin: profile?.role === 'admin',
    isInvoicingUser: profile?.role === 'invoicing_user'
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
