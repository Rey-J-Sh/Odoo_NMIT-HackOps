'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLedger from '@/components/DashboardLedger'
import Pagination from '@/components/Pagination'
import { Search, Filter, BookOpen, Calendar, Download } from 'lucide-react'
import { format } from 'date-fns'
import '@/styles/dashboard.css'

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


export default function LedgerPage() {
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [accountFilter, setAccountFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  
  const itemsPerPage = 12

  const fetchLedgerEntries = useCallback(async () => {
    try {
      // For now, we'll fetch all entries and filter on the client side
      // In a real app, you'd want to implement server-side filtering
      const response = await apiClient.getLedgerEntries()
      setLedgerEntries(response.data || [])
    } catch (error) {
      console.error('Error fetching ledger entries:', error)
    } finally {
      setLoading(false)
    }
  }, [dateFrom, dateTo])

  useEffect(() => {
    fetchLedgerEntries()
  }, [fetchLedgerEntries])

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

  // Pagination logic
  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedEntries = filteredEntries.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

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
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <DashboardLedger 
          title="General Ledger" 
          subtitle="Double-entry bookkeeping records"
        />

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="flex items-center justify-between gap-4">
                <div className="relative w-full sm:w-[420px] md:w-[560px] lg:w-[700px]">
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
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-600">
                {filteredEntries.length} entr{filteredEntries.length !== 1 ? 'ies' : 'y'}
              </div>
              <button
                onClick={handleExportCSV}
                className="btn btn-secondary"
              >
                <Download className="btn-icon" />
                Export CSV
              </button>
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
                {paginatedEntries.map((entry) => (
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

        {/* Pagination */}
        {filteredEntries.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={filteredEntries.length}
            itemsPerPage={itemsPerPage}
          />
        )}
        </main>
      </div>
    </ProtectedRoute>
  )
}
