import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, Users, Calendar, Bell, TrendingUp, Upload, AlertCircle, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'

const Layout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout, canEdit } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/flatmates', icon: Users, label: 'Flatmates' },
    { path: '/maintenance', icon: Calendar, label: 'Maintenance', adminOnly: true },
    { path: '/defaulters', icon: AlertCircle, label: 'Defaulters' },
    { path: '/reminders', icon: Bell, label: 'Reminders', adminOnly: true },
    { path: '/import', icon: Upload, label: 'Import Data', adminOnly: true },
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout()
      navigate('/login')
    }
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-primary-600 p-1.5 sm:p-2 rounded-lg">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base sm:text-xl font-bold text-gray-900">Axis Vedam Finance</h1>
                <p className="text-xs text-gray-500 hidden md:block">Apartment Management</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-sm font-bold text-gray-900">Axis Vedam</h1>
              </div>
            </div>

            {/* User Info & Logout */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-gray-900">{user?.displayName || 'User'}</p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'admin' ? 'Administrator' : 'General User'}
                </p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-sm">
                {user?.username?.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <nav className="px-4 py-2 space-y-1">
              {navItems.map((item) => {
                if (item.adminOnly && !canEdit()) return null
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMobileMenu}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      active
                        ? 'bg-primary-50 text-primary-700 border border-primary-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.adminOnly && (
                      <span className="ml-auto text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                        Admin
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        )}
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)] border-r border-gray-200 sticky top-16">
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              if (item.adminOnly && !canEdit()) return null
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.adminOnly && (
                    <span className="ml-auto text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout












