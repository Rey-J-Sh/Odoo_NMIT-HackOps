import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Browser client for SSR
export const createClientComponentClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
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
