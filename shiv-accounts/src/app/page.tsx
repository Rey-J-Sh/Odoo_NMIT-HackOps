'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import DashboardMain from '@/components/DashboardMain'
import { 
  Users, 
  Package, 
  FileText, 
  CreditCard, 
  TrendingUp, 
  AlertCircle
} from 'lucide-react'
import '@/styles/dashboard.css'

interface DashboardStats {
  totalContacts: number
  totalProducts: number
  totalInvoices: number
  totalReceivables: number
  totalRevenue: number
  unpaidInvoices: number
  overdueInvoices: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalContacts: 0,
    totalProducts: 0,
    totalInvoices: 0,
    totalReceivables: 0,
    totalRevenue: 0,
    unpaidInvoices: 0,
    overdueInvoices: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Fetch contacts count
      const { count: contactsCount } = await supabase
        .from('contacts')
        .select('*', { count: 'exact', head: true })

      // Fetch products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      // Fetch invoices count
      const { count: invoicesCount } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })

      // Fetch total receivables (open + partially paid invoices)
      const { data: receivablesData } = await supabase
        .from('invoices')
        .select('total_amount, paid_amount')
        .in('status', ['open', 'partially_paid'])

      const totalReceivables = receivablesData?.reduce((sum, invoice) => 
        sum + (invoice.total_amount - invoice.paid_amount), 0) || 0

      // Fetch total revenue (paid invoices)
      const { data: revenueData } = await supabase
        .from('invoices')
        .select('total_amount')
        .eq('status', 'paid')

      const totalRevenue = revenueData?.reduce((sum, invoice) => 
        sum + invoice.total_amount, 0) || 0

      // Fetch unpaid invoices count
      const { count: unpaidCount } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .in('status', ['open', 'partially_paid'])

      // Fetch overdue invoices count
      const today = new Date().toISOString().split('T')[0]
      const { count: overdueCount } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .in('status', ['open', 'partially_paid'])
        .lt('due_date', today)

      setStats({
        totalContacts: contactsCount || 0,
        totalProducts: productsCount || 0,
        totalInvoices: invoicesCount || 0,
        totalReceivables,
        totalRevenue,
        unpaidInvoices: unpaidCount || 0,
        overdueInvoices: overdueCount || 0
      })
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Contacts',
      value: stats.totalContacts,
      icon: Users,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Total Invoices',
      value: stats.totalInvoices,
      icon: FileText,
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'Total Receivables',
      value: `₹${stats.totalReceivables.toLocaleString()}`,
      icon: CreditCard,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600'
    },
    {
      title: 'Unpaid Invoices',
      value: stats.unpaidInvoices,
      icon: AlertCircle,
      color: 'bg-red-500',
      textColor: 'text-red-600'
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <DashboardMain 
      title="Shiv Accounts Cloud" 
      subtitle="Cloud-based accounting system for furniture business"
    >
      <div className="dashboard-main">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Invoices */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Recent Invoices</h3>
            </div>
            <div className="p-6">
              <div className="text-center text-gray-500 py-8">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Recent invoices will appear here</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium">Create New Invoice</p>
                      <p className="text-sm text-gray-600">Generate a new sales invoice</p>
                    </div>
                  </div>
                </button>
                <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium">Add New Contact</p>
                      <p className="text-sm text-gray-600">Add customer or vendor</p>
                    </div>
                  </div>
                </button>
                <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 text-purple-600 mr-3" />
                    <div>
                      <p className="font-medium">Add Product</p>
                      <p className="text-sm text-gray-600">Add new product to catalog</p>
                    </div>
                  </div>
                </button>
                <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-orange-600 mr-3" />
                    <div>
                      <p className="font-medium">Record Payment</p>
                      <p className="text-sm text-gray-600">Record payment against invoice</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardMain>
  )
}