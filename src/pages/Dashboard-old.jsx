import { DollarSign, Users, AlertTriangle, TrendingUp, Calendar, Clock } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const Dashboard = () => {
  // Sample data - in real app, this would come from API/state
  const stats = {
    totalMaintenance: 45000,
    pendingAmount: 12500,
    paidAmount: 32500,
    defaulters: 3,
    totalFlatmates: 8,
  }

  const monthlyData = [
    { month: 'Jan', collected: 40000, pending: 5000 },
    { month: 'Feb', collected: 35000, pending: 10000 },
    { month: 'Mar', collected: 32500, pending: 12500 },
    { month: 'Apr', collected: 30000, pending: 15000 },
  ]

  const defaulterData = [
    { id: 1, name: 'Rajesh Kumar', flat: 'A-101', amount: 5000, daysOverdue: 15, phone: '+91 98765 43210' },
    { id: 2, name: 'Priya Sharma', flat: 'B-203', amount: 4500, daysOverdue: 10, phone: '+91 98765 43211' },
    { id: 3, name: 'Amit Patel', flat: 'C-305', amount: 3000, daysOverdue: 7, phone: '+91 98765 43212' },
  ]

  const recentPayments = [
    { id: 1, name: 'Sneha Reddy', flat: 'A-102', amount: 5000, date: '2024-04-15', status: 'Paid' },
    { id: 2, name: 'Vikram Singh', flat: 'B-204', amount: 5000, date: '2024-04-14', status: 'Paid' },
    { id: 3, name: 'Anjali Desai', flat: 'C-306', amount: 5000, date: '2024-04-13', status: 'Paid' },
  ]

  const upcomingDue = [
    { name: 'Maintenance - April', amount: 5000, dueDate: '2024-04-20', flatmates: 5 },
    { name: 'Electricity Bill', amount: 3500, dueDate: '2024-04-22', flatmates: 8 },
    { name: 'Water Bill', amount: 2000, dueDate: '2024-04-25', flatmates: 8 },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Overview of apartment financial status</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Maintenance</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">₹{stats.totalMaintenance.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">This month</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Amount</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">₹{stats.pendingAmount.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.defaulters} defaulters</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid Amount</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">₹{stats.paidAmount.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-1">72% collected</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Flatmates</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalFlatmates}</p>
              <p className="text-xs text-gray-500 mt-1">Active members</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Collection Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="collected" stroke="#0ea5e9" name="Collected" strokeWidth={2} />
              <Line type="monotone" dataKey="pending" stroke="#f59e0b" name="Pending" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection vs Pending</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="collected" fill="#10b981" name="Collected" />
              <Bar dataKey="pending" fill="#ef4444" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Defaulters Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            Defaulters ({defaulterData.length})
          </h3>
          <button className="btn-primary text-sm">Send Reminders</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Flat</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Days Overdue</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contact</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {defaulterData.map((defaulter) => (
                <tr key={defaulter.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{defaulter.name}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="badge-info">{defaulter.flat}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <p className="font-semibold text-gray-900">₹{defaulter.amount.toLocaleString()}</p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="badge-danger">{defaulter.daysOverdue} days</span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-600">{defaulter.phone}</p>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                      Contact
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Payments & Upcoming Dues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Recent Payments
          </h3>
          <div className="space-y-3">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{payment.name}</p>
                  <p className="text-sm text-gray-600">{payment.flat} • {payment.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">₹{payment.amount.toLocaleString()}</p>
                  <span className="badge-success text-xs">{payment.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Upcoming Dues
          </h3>
          <div className="space-y-3">
            {upcomingDue.map((due, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{due.name}</p>
                  <p className="text-sm text-gray-600">Due: {due.dueDate} • {due.flatmates} flatmates</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">₹{due.amount.toLocaleString()}</p>
                  <span className="badge-warning text-xs">Pending</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard












