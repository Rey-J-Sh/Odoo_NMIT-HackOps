'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavigationProps {
  activePath: string
}

export default function Navigation({ activePath }: NavigationProps) {
  const isAuthenticated = false; // This would come from your auth context
  const isActive = (path: string) => activePath === path;

  return (
    <>
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
      
      <div className="dashboard-auth-links">
        {isAuthenticated ? (
          <>
            <Link href="/account" className="dashboard-nav-link">
              Account Info
            </Link>
            <Link href="/logout" className="dashboard-nav-button">
              Sign Out
            </Link>
          </>
        ) : (
          <>
            <Link href="/login" className="dashboard-nav-button">
              Log In
            </Link>
            <Link href="/signup" className="dashboard-nav-button primary">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </>
  )
}
