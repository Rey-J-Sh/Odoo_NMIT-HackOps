'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

interface DashboardLedgerProps {
  title: string
  subtitle: string
  actionRight?: ReactNode
}

export default function DashboardLedger({ title, subtitle, actionRight }: DashboardLedgerProps) {
  return (
    <>
      {/* Combined Header and Navigation */}
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-header-inner">
            <div>
              <h1 className="dashboard-title">{title}</h1>
              <p className="dashboard-subtitle">{subtitle}</p>
            </div>

            {/* Right side: nav + optional action */}
            <div className="flex items-center gap-4">
              <div className="dashboard-nav-links">
                <Link href="/" className="dashboard-nav-link">
                  Dashboard
                </Link>
                <Link href="/contacts" className="dashboard-nav-link">
                  Contacts
                </Link>
                <Link href="/products" className="dashboard-nav-link">
                  Products
                </Link>
                <Link href="/invoices" className="dashboard-nav-link">
                  Invoices
                </Link>
                <Link href="/payments" className="dashboard-nav-link">
                  Payments
                </Link>
                <Link href="/ledger" className="dashboard-nav-link">
                  Ledger
                </Link>
                <Link href="/reports" className="dashboard-nav-link">
                  Reports
                </Link>
              </div>
              {actionRight && (
                <div className="hidden md:block">{actionRight}</div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content Spacer */}
      <div className="dashboard-content-spacer"></div>

    </>
  )
}
