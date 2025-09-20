'use client'

import { usePathname } from 'next/navigation'
import Navigation from './Navigation'

interface DashboardContactsProps {
  title: string
  subtitle: string
}

export default function DashboardContacts({}: DashboardContactsProps) {
  const pathname = usePathname()
  
  return (
    <>
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-nav-container">
            <Navigation activePath={pathname} />
          </div>
        </div>
      </header>

      {/* Content Spacer */}
      <div className="dashboard-content-spacer"></div>
    </>
  )
}
