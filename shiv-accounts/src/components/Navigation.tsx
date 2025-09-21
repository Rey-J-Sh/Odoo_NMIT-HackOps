'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  FileText, 
  CreditCard, 
  BookOpen, 
  BarChart3,
  LogOut,
  User,
  ChevronDown,
  ShoppingCart,
  Receipt,
  FileCheck
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: any
  roles: ('admin' | 'invoicing_user')[]
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['admin', 'invoicing_user'] },
  { name: 'Contacts', href: '/contacts', icon: Users, roles: ['admin', 'invoicing_user'] },
  { name: 'Products', href: '/products', icon: Package, roles: ['admin', 'invoicing_user'] },
  { name: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCart, roles: ['admin', 'invoicing_user'] },
  { name: 'Vendor Bills', href: '/vendor-bills', icon: Receipt, roles: ['admin', 'invoicing_user'] },
  { name: 'Sale Orders', href: '/sale-orders', icon: FileCheck, roles: ['admin', 'invoicing_user'] },
  { name: 'Invoices', href: '/invoices', icon: FileText, roles: ['admin', 'invoicing_user'] },
  { name: 'Payments', href: '/payments', icon: CreditCard, roles: ['admin', 'invoicing_user'] },
  { name: 'Ledger', href: '/ledger', icon: BookOpen, roles: ['admin', 'invoicing_user'] },
  { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['admin', 'invoicing_user'] },
]

export default function Navigation() {
  const pathname = usePathname()
  const { user, profile, signOut, isAdmin } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(profile?.role || 'invoicing_user')
  )

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Shiv Accounts Cloud</h1>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-6">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {profile?.name || user?.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {profile?.role?.replace('_', ' ')}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <p className="font-medium">{profile?.name || user?.email}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {profile?.role?.replace('_', ' ')}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

