'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Search, Download, Filter, BookOpen, Calendar, DollarSign } from 'lucide-react'
import { format } from 'date-fns'

interface LedgerEntry {
  id: string
  entry_date: string
  reference_type: 'invoice' | 'payment' | 'adjustment'
  reference_id: string
  account_id: string
  debit_amount: number
  credit_amount: number
  description: string
  created_at: string
  accounts: {
    code: string
    name: string
    type: string
  }
}

interface Contact {
  id: string
  name: string
  contact_type: 'customer' | 'vendor'
}

export default function LedgerPage() {
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [contactFilter, setContactFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [accountFilter, setAccountFilter] = useState('all')

  useEffect(() => {
    fetchLedgerEntries()
    fetchContacts()
  }, [])

  const fetchLedgerEntries = async () => {
    try {
      let query = supabase
        .from('ledger_entries')
        .select(`
          *,
          accounts:account_id (
            code,
            name,
            type
          )
        `)
        .order('entry_date', { ascending: false })
        .order('created_at', { ascending: false })

      // Apply date filters
      if (dateFrom) {
        query = query.gte('entry_date', dateFrom)
      }
      if (dateTo) {
        query = query.lte('entry_date', dateTo)
      }

      const { data, error } = await query

      if (error) throw error
      setLedgerEntries(data || [])
    } catch (error) {
      console.error('Error fetching ledger entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, name, contact_type')
        .order('name')

      if (error) throw error
      setContacts(data || [])
    } catch (error) {
      console.error('Error fetching contacts:', error)
    }
  }

  const handleExportCSV = () => {
    const headers = ['Date', 'Account', 'Description', 'Reference Type', 'Reference ID', 'Debit', 'Credit']
    const csvContent = [
      headers.join(','),
      ...ledgerEntries.map(entry => [
        entry.entry_date,
        `"${entry.accounts.code} - ${entry.accounts.name}"`,
        `"${entry.description}"`,
        entry.reference_type,
        entry.reference_id,
        entry.debit_amount,
        entry.credit_amount
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ledger-entries-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const filteredEntries = ledgerEntries.filter(entry => {
    const matchesSearch = 
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.accounts.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.accounts.code.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesAccount = accountFilter === 'all' || entry.accounts.code === accountFilter
    
    return matchesSearch && matchesAccount
  })

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case 'asset':
        return 'bg-blue-100 text-blue-800'
      case 'liability':
        return 'bg-red-100 text-red-800'
      case 'equity':
        return 'bg-purple-100 text-purple-800'
      case 'revenue':
        return 'bg-green-100 text-green-800'
      case 'expense':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getReferenceTypeColor = (type: string) => {
    switch (type) {
      case 'invoice':
        return 'bg-blue-100 text-blue-800'
      case 'payment':
        return 'bg-green-100 text-green-800'
      case 'adjustment':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">General Ledger</h1>
              <p className="text-gray-600">Double-entry bookkeeping records</p>
            </div>
            <button
              onClick={handleExportCSV}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <a href="/" className="text-gray-500 hover:text-gray-700 py-4 px-1 text-sm font-medium">
              Dashboard
            </a>
            <a href="/contacts" className="text-gray-500 hover:text-gray-700 py-4 px-1 text-sm font-medium">
              Contacts
            </a>
            <a href="/products" className="text-gray-500 hover:text-gray-700 py-4 px-1 text-sm font-medium">
              Products
            </a>
            <a href="/invoices" className="text-gray-500 hover:text-gray-700 py-4 px-1 text-sm font-medium">
              Invoices
            </a>
            <a href="/payments" className="text-gray-500 hover:text-gray-700 py-4 px-1 text-sm font-medium">
              Payments
            </a>
            <a href="/ledger" className="border-b-2 border-blue-600 text-blue-600 py-4 px-1 text-sm font-medium">
              Ledger
            </a>
            <a href="/reports" className="text-gray-500 hover:text-gray-700 py-4 px-1 text-sm font-medium">
              Reports
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date From
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date To
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account
              </label>
              <select
                value={accountFilter}
                onChange={(e) => setAccountFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Accounts</option>
                <option value="CASH">Cash</option>
                <option value="BANK">Bank Account</option>
                <option value="ACCOUNTS_RECEIVABLE">Accounts Receivable</option>
                <option value="SALES">Sales Revenue</option>
                <option value="TAX_PAYABLE">Tax Payable</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={fetchLedgerEntries}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Apply Filters
            </button>
            <div className="text-sm text-gray-600">
              {filteredEntries.length} entr{filteredEntries.length !== 1 ? 'ies' : 'y'}
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Debit
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credit
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(entry.entry_date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {entry.accounts.code}
                          </div>
                          <div className="text-sm text-gray-500">
                            {entry.accounts.name}
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getAccountTypeColor(entry.accounts.type)}`}>
                            {entry.accounts.type}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {entry.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getReferenceTypeColor(entry.reference_type)}`}>
                        {entry.reference_type}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">
                        {entry.reference_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {entry.debit_amount > 0 ? (
                        <span className="text-red-600 font-medium">
                          ₹{entry.debit_amount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                      {entry.credit_amount > 0 ? (
                        <span className="text-green-600 font-medium">
                          ₹{entry.credit_amount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No ledger entries found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || dateFrom || dateTo || accountFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Ledger entries will appear here as you create invoices and record payments.'}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
