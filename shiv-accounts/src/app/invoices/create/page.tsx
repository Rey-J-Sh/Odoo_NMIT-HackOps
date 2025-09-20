'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import DashboardInvoiceCreate from '@/components/DashboardInvoiceCreate'
import { Plus, Minus, User, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'
import '@/styles/dashboard.css'

interface Contact {
  id: string
  name: string
  email: string | null
  contact_type: 'customer' | 'vendor'
}

interface Product {
  id: string
  sku: string
  name: string
  price: number
  tax_percentage: number
}

interface InvoiceLine {
  id: string
  product_id: string | null
  description: string
  quantity: number
  unit_price: number
  tax_percentage: number
  line_total: number
}

export default function CreateInvoicePage() {
  const router = useRouter()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    contact_id: '',
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: '',
    notes: ''
  })
  
  const [invoiceLines, setInvoiceLines] = useState<InvoiceLine[]>([
    {
      id: '1',
      product_id: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      tax_percentage: 18,
      line_total: 0
    }
  ])

  useEffect(() => {
    fetchContacts()
    fetchProducts()
  }, [])

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, name, email, contact_type')
        .eq('contact_type', 'customer')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setContacts(data || [])
    } catch (error) {
      console.error('Error fetching contacts:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, sku, name, price, tax_percentage')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const addInvoiceLine = () => {
    const newLine: InvoiceLine = {
      id: Date.now().toString(),
      product_id: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      tax_percentage: 18,
      line_total: 0
    }
    setInvoiceLines([...invoiceLines, newLine])
  }

  const removeInvoiceLine = (id: string) => {
    if (invoiceLines.length > 1) {
      setInvoiceLines(invoiceLines.filter(line => line.id !== id))
    }
  }

  const updateInvoiceLine = (id: string, field: keyof InvoiceLine, value: string | number) => {
    setInvoiceLines(invoiceLines.map(line => {
      if (line.id === id) {
        const updatedLine = { ...line, [field]: value }
        
        // Auto-fill product details when product is selected
        if (field === 'product_id' && value) {
          const product = products.find(p => p.id === value)
          if (product) {
            updatedLine.description = product.name
            updatedLine.unit_price = product.price
            updatedLine.tax_percentage = product.tax_percentage
          }
        }
        
        // Calculate line total
        updatedLine.line_total = updatedLine.quantity * updatedLine.unit_price
        
        return updatedLine
      }
      return line
    }))
  }

  const calculateTotals = () => {
    const subtotal = invoiceLines.reduce((sum, line) => sum + line.line_total, 0)
    const taxAmount = invoiceLines.reduce((sum, line) => 
      sum + (line.line_total * line.tax_percentage / 100), 0)
    const total = subtotal + taxAmount
    
    return { subtotal, taxAmount, total }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Generate invoice number
      const { data: lastInvoice } = await supabase
        .from('invoices')
        .select('invoice_number')
        .order('created_at', { ascending: false })
        .limit(1)

      const lastNumber = lastInvoice?.[0]?.invoice_number || 'INV-2024-000'
      const nextNumber = `INV-2024-${String(parseInt(lastNumber.split('-')[2]) + 1).padStart(3, '0')}`

      const { subtotal, taxAmount, total } = calculateTotals()

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          invoice_number: nextNumber,
          contact_id: formData.contact_id,
          invoice_date: formData.invoice_date,
          due_date: formData.due_date || null,
          status: 'draft',
          subtotal,
          tax_amount: taxAmount,
          total_amount: total,
          notes: formData.notes || null
        }])
        .select()
        .single()

      if (invoiceError) throw invoiceError

      // Create invoice lines
      const linesToInsert = invoiceLines.map(line => ({
        invoice_id: invoice.id,
        product_id: line.product_id || null,
        description: line.description,
        quantity: line.quantity,
        unit_price: line.unit_price,
        tax_percentage: line.tax_percentage,
        line_total: line.line_total
      }))

      const { error: linesError } = await supabase
        .from('invoice_lines')
        .insert(linesToInsert)

      if (linesError) throw linesError

      router.push('/invoices')
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert('Error creating invoice. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const { subtotal, taxAmount, total } = calculateTotals()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardInvoiceCreate 
        title="Create Invoice" 
        subtitle="Create a new sales invoice"
      />

      {/* Main Content */}
      <main className="dashboard-main">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Invoice Header */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Invoice Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    required
                    value={formData.contact_id}
                    onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Customer</option>
                    {contacts.map(contact => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Invoice Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.invoice_date}
                  onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Invoice Lines */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Line Items</h2>
              <button
                type="button"
                onClick={addInvoiceLine}
                className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Line
              </button>
            </div>

            <div className="space-y-4">
              {invoiceLines.map((line) => (
                <div key={line.id} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border border-gray-200 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Product
                    </label>
                    <div className="relative">
                      <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <select
                        value={line.product_id || ''}
                        onChange={(e) => updateInvoiceLine(line.id, 'product_id', e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select Product</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.sku} - {product.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <input
                      type="text"
                      required
                      value={line.description}
                      onChange={(e) => updateInvoiceLine(line.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      required
                      value={line.quantity}
                      onChange={(e) => updateInvoiceLine(line.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unit Price (₹) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={line.unit_price}
                      onChange={(e) => updateInvoiceLine(line.id, 'unit_price', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tax (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.tax_percentage}
                      onChange={(e) => updateInvoiceLine(line.id, 'tax_percentage', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Line Total
                      </label>
                      <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm font-medium">
                        ₹{line.line_total.toLocaleString()}
                      </div>
                    </div>
                    {invoiceLines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeInvoiceLine(line.id)}
                        className="ml-2 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice Totals */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Invoice Summary</h2>
            <div className="max-w-md ml-auto">
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-600">Subtotal:</span>
                <span className="text-sm font-medium text-gray-900">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm font-medium text-gray-600">Tax Amount:</span>
                <span className="text-sm font-medium text-gray-900">₹{taxAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-gray-200">
                <span className="text-base font-bold text-gray-900">Total Amount:</span>
                <span className="text-base font-bold text-blue-600">₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  )
}
