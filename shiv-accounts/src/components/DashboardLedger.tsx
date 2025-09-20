'use client'

import { usePathname } from 'next/navigation'
import Navigation from './Navigation'
import Link from 'next/link'
import { ReactNode } from 'react'

interface DashboardLedgerProps {
  title: string
  subtitle: string
  actionRight?: ReactNode
}

export default function DashboardLedger({ actionRight }: DashboardLedgerProps) {
  const pathname = usePathname()
  
  return (
    <>
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-nav-container">
            <Navigation activePath={pathname} />
            
            {/* Right: Optional page action */}
            {actionRight && (
              <div className="hidden md:block mr-4">{actionRight}</div>
            )}
          </div>
        </div>
      </header>

      {/* Content Spacer */}
      <div className="dashboard-content-spacer"></div>

    </>
  )
}
