'use client'

import Link from 'next/link'

interface DashboardHeaderProps {
  title: string
  subtitle: string
  children?: React.ReactNode
}

export default function DashboardHeader({ title, subtitle, children }: DashboardHeaderProps) {
  return (
    <>
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-black text-white shadow-lg border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white">{title}</h1>
              <p className="text-gray-300">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </header>

      {/* Fixed Navigation */}
      <nav className="fixed top-[120px] left-0 right-0 bg-black text-white shadow-lg border-b border-gray-800 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link href="/" className="text-gray-300 hover:text-white py-4 px-1 text-sm font-medium transition-colors">
              Dashboard
            </Link>
            <Link href="/contacts" className="text-gray-300 hover:text-white py-4 px-1 text-sm font-medium transition-colors">
              Contacts
            </Link>
            <Link href="/products" className="text-gray-300 hover:text-white py-4 px-1 text-sm font-medium transition-colors">
              Products
            </Link>
            <Link href="/invoices" className="text-gray-300 hover:text-white py-4 px-1 text-sm font-medium transition-colors">
              Invoices
            </Link>
            <Link href="/payments" className="text-gray-300 hover:text-white py-4 px-1 text-sm font-medium transition-colors">
              Payments
            </Link>
            <Link href="/ledger" className="text-gray-300 hover:text-white py-4 px-1 text-sm font-medium transition-colors">
              Ledger
            </Link>
            <Link href="/reports" className="text-gray-300 hover:text-white py-4 px-1 text-sm font-medium transition-colors">
              Reports
            </Link>
          </div>
        </div>
      </nav>

      {/* Spacer to push content below fixed header */}
      <div className="h-[200px]"></div>
    </>
  )
}
