import { useState, useEffect } from 'react'
import { DollarSign, Users, AlertTriangle, TrendingUp, Home, Building2 } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { flatmatesAPI, flatsAPI, cyclesAPI, paymentsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const { isAdmin } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalFlats: 0,
    totalFlatmates: 0,
    activeFlatmates: 0,
  })
  const [flats, setFlats] = useState([])
  const [flatmates, setFlatmates] = useState([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [flatsData, flatmatesData] = await Promise.all([
        flatsAPI.getAll(),
        flatmatesAPI.getAll(),
      ])

      setFlats(flatsData)
      setFlatmates(flatmatesData)

      setStats({
        totalFlats: flatsData.length,
        totalFlatmates: flatmatesData.length,
        activeFlatmates: flatmatesData.filter(f => f.isActive).length,
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Helper functions to mask sensitive data for general users
  const maskEmail = (email) => {
    if (!email) return ''
    const [username, domain] = email.split('@')
    if (!domain) return '••••••••'
    return `${username.charAt(0)}${'•'.repeat(Math.min(username.length - 1, 6))}@${domain}`
  }

  const maskPhone = (phone) => {
    if (!phone) return ''
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length <= 4) return '••••••••'
    return `${'•'.repeat(cleaned.length - 4)}${cleaned.slice(-4)}`
  }

  // Group flats by BHK type
  const bhkDistribution = flats.reduce((acc, flat) => {
    const bhk = flat.bhk || 'Unknown'
    acc[bhk] = (acc[bhk] || 0) + 1
    return acc
  }, {})

  const bhkChartData = Object.entries(bhkDistribution).map(([bhk, count]) => ({
    bhk,
    count
  }))

  // Calculate area statistics
  const totalArea = flats.reduce((sum, flat) => sum + (flat.sizeSqft || 0), 0)
  const avgArea = flats.length > 0 ? Math.round(totalArea / flats.length) : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Overview of apartment status</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Flats</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.totalFlats}</p>
              <p className="text-xs text-gray-500 mt-1">Registered units</p>
            </div>
            <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Residents</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.totalFlatmates}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.activeFlatmates} active</p>
            </div>
            <div className="bg-purple-100 p-2 sm:p-3 rounded-lg">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Area</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">{totalArea.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">sq ft</p>
            </div>
            <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
              <Home className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Average Area</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 sm:mt-2">{avgArea.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">sq ft per flat</p>
            </div>
            <div className="bg-yellow-100 p-2 sm:p-3 rounded-lg">
              <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* BHK Distribution Chart */}
        <div className="card">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Flat Distribution by BHK</h3>
          {bhkChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bhkChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bhk" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Number of Flats" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">No data available</p>
          )}
        </div>

        {/* Occupancy Status */}
        <div className="card">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Occupancy Status</h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-xs sm:text-sm font-medium text-green-900">Occupied Flats</p>
                <p className="text-xl sm:text-2xl font-bold text-green-700 mt-1">{stats.totalFlats}</p>
              </div>
              <div className="text-green-600">
                <Building2 className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-xs sm:text-sm font-medium text-blue-900">Active Residents</p>
                <p className="text-xl sm:text-2xl font-bold text-blue-700 mt-1">{stats.activeFlatmates}</p>
              </div>
              <div className="text-blue-600">
                <Users className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-900">Inactive Residents</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-700 mt-1">
                  {stats.totalFlatmates - stats.activeFlatmates}
                </p>
              </div>
              <div className="text-gray-600">
                <Users className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Flatmates */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recently Added Residents</h3>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Flat
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  BHK
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {flatmates.slice(0, 10).map((flatmate) => (
                <tr key={flatmate.id} className="hover:bg-gray-50">
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {flatmate.fullName}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {flatmate.flat?.number || `#${flatmate.flatId}`}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {flatmate.flat?.bhk || '-'}
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {isAdmin() 
                      ? (flatmate.phone || flatmate.email || '-')
                      : flatmate.phone 
                        ? maskPhone(flatmate.phone)
                        : flatmate.email
                          ? maskEmail(flatmate.email)
                          : '-'
                    }
                  </td>
                  <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                    {flatmate.isActive ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {flatmates.slice(0, 10).map((flatmate) => (
            <div key={flatmate.id} className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">{flatmate.fullName}</h4>
                {flatmate.isActive ? (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    Inactive
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium">Flat:</span>
                  <span>{flatmate.flat?.number || `#${flatmate.flatId}`}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">BHK:</span>
                  <span>{flatmate.flat?.bhk || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Contact:</span>
                  <span>
                    {isAdmin() 
                      ? (flatmate.phone || flatmate.email || '-')
                      : flatmate.phone 
                        ? maskPhone(flatmate.phone)
                        : flatmate.email
                          ? maskEmail(flatmate.email)
                          : '-'
                    }
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {flatmates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No residents added yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
