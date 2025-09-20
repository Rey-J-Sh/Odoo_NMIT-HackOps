'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Navigation from './Navigation'
import Image from 'next/image'

interface DashboardMainProps {
  children?: React.ReactNode
  title?: string
  subtitle?: string
}

export default function DashboardMain({ children, title, subtitle }: DashboardMainProps) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen relative">
      {/* Background Image Layer */}
      <div className="fixed inset-0 -z-10">
        <img 
          src="/images/background.jpg" 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      </div>
      
      {/* Cloud and Content Layer */}

      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-nav-container">
            <Navigation activePath={pathname} />
          </div>
        </div>
      </header>

      {/* Cloud-shaped Welcome Section */}
      <div className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        <div className="cloud-shape bg-white/90 backdrop-blur-sm">
          <div className="relative z-10 text-center px-6 py-12">
            <h1 className="font-['Garamond','EB_Garamond',serif] font-bold italic text-black leading-tight tracking-tight" style={{ fontSize: 'clamp(36px, 3.5vw, 56px)' }}>
              WELCOME TO SHIV ACCOUNTS
            </h1>
            <p className="mt-4 font-['Garamond','EB_Garamond',serif] text-gray-700 max-w-2xl mx-auto tracking-normal" style={{ fontSize: 'clamp(16px, 1.4vw, 22px)' }}>
              Your complete financial management solution
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Full Page Background */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
          <div className="[&>div]:text-white [&>div>h2]:text-3xl [&>div>h2]:md:text-4xl [&>div>h3]:text-2xl [&>div>h3]:md:text-3xl [&>div>p]:text-lg [&>div>p]:md:text-xl">
            {children}
          </div>
        </div>
      </main>

      <style jsx global>{`
        .cloud-shape {
          position: relative;
          width: 80vw;
          height: 60vh;
          max-width: 1200px;
          max-height: 800px;
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
        }
        .cloud-shape::before,
        .cloud-shape::after {
          content: '';
          position: absolute;
          background: inherit;
          border-radius: 50%;
        }
        .cloud-shape::before {
          top: 10%;
          left: 10%;
          width: 30%;
          height: 30%;
        }
        .cloud-shape::after {
          top: 15%;
          right: 10%;
          width: 25%;
          height: 25%;
        }
        /* Ensure content is above the cloud shape */
        /* Ensure content is above the cloud shape */
        .dashboard-header {
          position: relative;
          z-index: 20;
        }
        /* Make sure main content is below the cloud */
        main {
          position: relative;
          z-index: 5;
          margin-top: -10vh;
        }
      `}</style>
    </div>
  )
}
