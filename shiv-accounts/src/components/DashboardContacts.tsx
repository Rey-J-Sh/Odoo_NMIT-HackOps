'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface DashboardContactsProps {
  title: string
  subtitle: string
}

export default function DashboardContacts({}: DashboardContactsProps) {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path
  return (
    <>
      {/* Combined Header and Navigation */}
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-header-inner">
            {/* Left: Navigation */}
            <div className="dashboard-nav-links">
              <Link href="/" className={`dashboard-nav-link ${isActive('/') ? 'active' : ''}`}>
                Dashboard
              </Link>
              <Link href="/contacts" className={`dashboard-nav-link ${isActive('/contacts') ? 'active' : ''}`}>
                Contacts
              </Link>
              <Link href="/products" className={`dashboard-nav-link ${isActive('/products') ? 'active' : ''}`}>
                Products
              </Link>
              <Link href="/invoices" className={`dashboard-nav-link ${isActive('/invoices') ? 'active' : ''}`}>
                Invoices
              </Link>
              <Link href="/payments" className={`dashboard-nav-link ${isActive('/payments') ? 'active' : ''}`}>
                Payments
              </Link>
              <Link href="/ledger" className={`dashboard-nav-link ${isActive('/ledger') ? 'active' : ''}`}>
                Ledger
              </Link>
              <Link href="/reports" className={`dashboard-nav-link ${isActive('/reports') ? 'active' : ''}`}>
                Reports
              </Link>
            </div>

            {/* Right: Auth / Account */}
            <div className="dashboard-auth">
              <Link href="/login" className="dashboard-nav-link">Log in</Link>
              <Link href="/signup" className="btn btn-primary">Sign up</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content Spacer */}
      <div className="dashboard-content-spacer"></div>

    </>
  )
}
