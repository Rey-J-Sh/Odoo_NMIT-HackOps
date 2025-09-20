'use client'

import { usePathname } from 'next/navigation'
import Navigation from './Navigation'

interface DashboardMainProps {
  children?: React.ReactNode
}

export default function DashboardMain({ children }: DashboardMainProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-nav-container">
            <Navigation activePath={pathname} />
          </div>
        </div>
      </header>

      {/* Content Spacer */}
      <div className="dashboard-content-spacer"></div>
      
      {/* Main content container with semi-transparent black background */}
      <main className="min-h-[calc(100vh-64px)] bg-black/70 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
