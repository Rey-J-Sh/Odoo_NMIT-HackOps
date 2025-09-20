// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

// API Client
class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    this.token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  }

  setToken(token: string | null) {
    this.token = token
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token)
      } else {
        localStorage.removeItem('auth_token')
      }
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }))
      throw new Error(error.error || 'Request failed')
    }

    return response.json()
  }

  // Auth methods
  async signIn(email: string, password: string) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    
    if (response.token) {
      this.setToken(response.token)
    }
    
    return response
  }

  async signUp(email: string, password: string, name: string, role: 'admin' | 'invoicing_user' = 'invoicing_user') {
    const response = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, role }),
    })
    
    if (response.token) {
      this.setToken(response.token)
    }
    
    return response
  }

  async signOut() {
    this.setToken(null)
    return { error: null }
  }

  async getCurrentUser() {
    try {
      const response = await this.request('/auth/profile')
      return { user: response.user, error: null }
    } catch (error) {
      return { user: null, error }
    }
  }

  async getUserProfile(userId: string) {
    const response = await this.request(`/auth/profile`)
    return { data: response.user, error: null }
  }

  // Database methods
  async from(table: string) {
    return {
      select: (columns = '*') => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            const response = await this.request(`/${table}/${value}`)
            return { data: response, error: null }
          }
        }),
        in: (column: string, values: any[]) => ({
          select: async () => {
            const response = await this.request(`/${table}?${column}=${values.join(',')}`)
            return { data: response[table] || response, error: null }
          }
        }),
        select: async () => {
          const response = await this.request(`/${table}`)
          return { data: response[table] || response, error: null }
        }
      }),
      insert: (data: any) => ({
        select: async () => {
          const response = await this.request(`/${table}`, {
            method: 'POST',
            body: JSON.stringify(data),
          })
          return { data: response, error: null }
        }
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: async () => {
            const response = await this.request(`/${table}/${value}`, {
              method: 'PUT',
              body: JSON.stringify(data),
            })
            return { data: response, error: null }
          }
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          select: async () => {
            await this.request(`/${table}/${value}`, {
              method: 'DELETE',
            })
            return { data: null, error: null }
          }
        })
      })
    }
  }
}

// Create API client instance
export const apiClient = new ApiClient(API_BASE_URL)

// Legacy Supabase compatibility
export const supabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      try {
        const response = await apiClient.signIn(email, password)
        return { data: { user: response.user }, error: null }
      } catch (error) {
        return { data: null, error }
      }
    },
    signUp: async ({ email, password, options }: { email: string; password: string; options: { data: { name: string; role: string } } }) => {
      try {
        const response = await apiClient.signUp(email, password, options.data.name, options.data.role as 'admin' | 'invoicing_user')
        return { data: { user: response.user }, error: null }
      } catch (error) {
        return { data: null, error }
      }
    },
    signOut: async () => {
      try {
        await apiClient.signOut()
        return { error: null }
      } catch (error) {
        return { error }
      }
    },
    getUser: async () => {
      try {
        const response = await apiClient.getCurrentUser()
        return { data: { user: response.user }, error: response.error }
      } catch (error) {
        return { data: { user: null }, error }
      }
    }
  }
}

// Browser client for SSR compatibility
export const createClientComponentClient = () => {
  return apiClient
}

// Auth helper functions
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signUpWithEmail = async (email: string, password: string, name: string, role: 'admin' | 'invoicing_user' = 'invoicing_user') => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role
      }
    }
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

// Database types
export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string
          code: string
          name: string
          type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
          parent_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          name: string
          type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
          parent_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          name?: string
          type?: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
          parent_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      contacts: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          contact_type: 'customer' | 'vendor'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          contact_type: 'customer' | 'vendor'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          contact_type?: 'customer' | 'vendor'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          sku: string
          name: string
          description: string | null
          price: number
          tax_percentage: number
          hsn_code: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sku: string
          name: string
          description?: string | null
          price: number
          tax_percentage?: number
          hsn_code?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sku?: string
          name?: string
          description?: string | null
          price?: number
          tax_percentage?: number
          hsn_code?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          contact_id: string
          invoice_date: string
          due_date: string | null
          status: 'draft' | 'open' | 'partially_paid' | 'paid' | 'cancelled'
          subtotal: number
          tax_amount: number
          total_amount: number
          paid_amount: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          invoice_number: string
          contact_id: string
          invoice_date: string
          due_date?: string | null
          status?: 'draft' | 'open' | 'partially_paid' | 'paid' | 'cancelled'
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          paid_amount?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          invoice_number?: string
          contact_id?: string
          invoice_date?: string
          due_date?: string | null
          status?: 'draft' | 'open' | 'partially_paid' | 'paid' | 'cancelled'
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          paid_amount?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoice_lines: {
        Row: {
          id: string
          invoice_id: string
          product_id: string | null
          description: string
          quantity: number
          unit_price: number
          tax_percentage: number
          line_total: number
          created_at: string
        }
        Insert: {
          id?: string
          invoice_id: string
          product_id?: string | null
          description: string
          quantity: number
          unit_price: number
          tax_percentage?: number
          line_total: number
          created_at?: string
        }
        Update: {
          id?: string
          invoice_id?: string
          product_id?: string | null
          description?: string
          quantity?: number
          unit_price?: number
          tax_percentage?: number
          line_total?: number
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          payment_number: string
          invoice_id: string
          contact_id: string
          payment_date: string
          amount: number
          payment_method: 'cash' | 'bank_transfer' | 'cheque' | 'card'
          reference: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          payment_number: string
          invoice_id: string
          contact_id: string
          payment_date: string
          amount: number
          payment_method?: 'cash' | 'bank_transfer' | 'cheque' | 'card'
          reference?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          payment_number?: string
          invoice_id?: string
          contact_id?: string
          payment_date?: string
          amount?: number
          payment_method?: 'cash' | 'bank_transfer' | 'cheque' | 'card'
          reference?: string | null
          notes?: string | null
          created_at?: string
        }
      }
      ledger_entries: {
        Row: {
          id: string
          entry_date: string
          reference_type: 'invoice' | 'payment' | 'adjustment'
          reference_id: string
          account_id: string
          debit_amount: number
          credit_amount: number
          description: string
          created_at: string
        }
        Insert: {
          id?: string
          entry_date: string
          reference_type: 'invoice' | 'payment' | 'adjustment'
          reference_id: string
          account_id: string
          debit_amount?: number
          credit_amount?: number
          description: string
          created_at?: string
        }
        Update: {
          id?: string
          entry_date?: string
          reference_type?: 'invoice' | 'payment' | 'adjustment'
          reference_id?: string
          account_id?: string
          debit_amount?: number
          credit_amount?: number
          description?: string
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          role: 'admin' | 'invoicing_user'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          role?: 'admin' | 'invoicing_user'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role?: 'admin' | 'invoicing_user'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

