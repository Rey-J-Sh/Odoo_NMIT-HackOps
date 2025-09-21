'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardReports from '@/components/DashboardReports'
import { TrendingUp, DollarSign, FileText, Calendar } from 'lucide-react'
import '@/styles/dashboard.css'

interface ReportData {
  totalRevenue: number
  totalReceivables: number
  totalInvoices: number
  paidInvoices: number
  unpaidInvoices: number
  averageInvoiceValue: number
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({
    totalRevenue: 0,
    totalReceivables: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    unpaidInvoices: 0,
    averageInvoiceValue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      // Fetch dashboard data from backend
      const response = await apiClient.request('/reports/dashboard')
      const data = response.data || response

      setReportData({
        totalRevenue: data.total_revenue || 0,
        totalReceivables: data.total_receivables || 0,
        totalInvoices: data.total_invoices || 0,
        paidInvoices: data.paid_invoices || 0,
        unpaidInvoices: data.unpaid_invoices || 0,
        averageInvoiceValue: data.average_invoice_value || 0
      })
    } catch (error) {
      console.error('Error fetching report data:', error)
      // Fallback to basic data
      setReportData({
        totalRevenue: 0,
        totalReceivables: 0,
        totalInvoices: 0,
        paidInvoices: 0,
        unpaidInvoices: 0,
        averageInvoiceValue: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = () => {
    const reportContent = `
Shiv Accounts Cloud - Financial Report
Generated on: ${new Date().toLocaleDateString()}

SUMMARY:
- Total Revenue: ₹${reportData.totalRevenue.toLocaleString()}
- Total Receivables: ₹${reportData.totalReceivables.toLocaleString()}
- Total Invoices: ${reportData.totalInvoices}
- Paid Invoices: ${reportData.paidInvoices}
- Unpaid Invoices: ${reportData.unpaidInvoices}
- Average Invoice Value: ₹${reportData.averageInvoiceValue.toLocaleString()}

This is a basic report. More detailed reports will be available in future versions.
    `.trim()

    const blob = new Blob([reportContent], { type: 'text/plain' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `financial-report-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
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
        <DashboardReports 
          title="Reports" 
          subtitle="Financial reports and analytics"
        />

        {/* Main Content */}
        <main className="dashboard-main">
        {/* Financial Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">₹{reportData.totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-500">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Receivables</p>
                <p className="text-2xl font-bold text-orange-600">₹{reportData.totalReceivables.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-500">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-blue-600">{reportData.totalInvoices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-emerald-500">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paid Invoices</p>
                <p className="text-2xl font-bold text-emerald-600">{reportData.paidInvoices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-500">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unpaid Invoices</p>
                <p className="text-2xl font-bold text-red-600">{reportData.unpaidInvoices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-500">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Invoice Value</p>
                <p className="text-2xl font-bold text-purple-600">₹{reportData.averageInvoiceValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon */}
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Advanced Reports Coming Soon</h3>
          <p className="text-gray-600 mb-4">
            We&apos;re working on more detailed reports including:
          </p>
          <ul className="text-gray-600 space-y-2 max-w-md mx-auto">
            <li>• Profit & Loss Statement</li>
            <li>• Balance Sheet</li>
            <li>• Customer-wise Sales Report</li>
            <li>• Product Performance Report</li>
            <li>• Monthly/Yearly Trends</li>
            <li>• Tax Reports</li>
          </ul>
        </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
