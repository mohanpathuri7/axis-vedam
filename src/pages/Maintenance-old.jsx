import { useState } from 'react'
import { Plus, Calendar, Filter, Download, DollarSign, Clock, CheckCircle2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const Maintenance = () => {
  const [filter, setFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)

  // Sample data
  const maintenanceRecords = [
    {
      id: 1,
      month: 'April 2024',
      amount: 5000,
      dueDate: '2024-04-20',
      status: 'Partial',
      paid: 32500,
      total: 40000,
      description: 'Monthly maintenance for April',
      createdDate: '2024-04-01',
      payments: [
        { flatmate: 'Sneha Reddy', amount: 5000, date: '2024-04-15', status: 'Paid' },
        { flatmate: 'Vikram Singh', amount: 5000, date: '2024-04-14', status: 'Paid' },
        { flatmate: 'Anjali Desai', amount: 5000, date: '2024-04-13', status: 'Paid' },
        { flatmate: 'Kavya Nair', amount: 5000, date: '2024-04-16', status: 'Paid' },
        { flatmate: 'Rajesh Kumar', amount: 5000, date: null, status: 'Pending' },
        { flatmate: 'Priya Sharma', amount: 5000, date: null, status: 'Pending' },
        { flatmate: 'Amit Patel', amount: 5000, date: null, status: 'Pending' },
        { flatmate: 'Rohit Mehta', amount: 2500, date: '2024-04-12', status: 'Partial' },
      ],
    },
    {
      id: 2,
      month: 'March 2024',
      amount: 5000,
      dueDate: '2024-03-20',
      status: 'Paid',
      paid: 40000,
      total: 40000,
      description: 'Monthly maintenance for March',
      createdDate: '2024-03-01',
      payments: [],
    },
    {
      id: 3,
      month: 'February 2024',
      amount: 5000,
      dueDate: '2024-02-20',
      status: 'Paid',
      paid: 40000,
      total: 40000,
      description: 'Monthly maintenance for February',
      createdDate: '2024-02-01',
      payments: [],
    },
    {
      id: 4,
      month: 'January 2024',
      amount: 5000,
      dueDate: '2024-01-20',
      status: 'Paid',
      paid: 40000,
      total: 40000,
      description: 'Monthly maintenance for January',
      createdDate: '2024-01-01',
      payments: [],
    },
  ]

  const otherBills = [
    { id: 1, type: 'Electricity', amount: 3500, dueDate: '2024-04-22', status: 'Pending', description: 'Monthly electricity bill' },
    { id: 2, type: 'Water', amount: 2000, dueDate: '2024-04-25', status: 'Pending', description: 'Monthly water bill' },
    { id: 3, type: 'Cleaning', amount: 1500, dueDate: '2024-04-28', status: 'Pending', description: 'Monthly cleaning service' },
    { id: 4, type: 'Security', amount: 3000, dueDate: '2024-04-30', status: 'Pending', description: 'Monthly security service' },
  ]

  const chartData = maintenanceRecords.map((record) => ({
    month: record.month.split(' ')[0],
    paid: record.paid,
    pending: record.total - record.paid,
  }))

  const filteredRecords = maintenanceRecords.filter((record) => {
    if (filter === 'all') return true
    if (filter === 'paid') return record.status === 'Paid'
    if (filter === 'pending') return record.status === 'Pending'
    if (filter === 'partial') return record.status === 'Partial'
    return true
  })

  const totalPending = maintenanceRecords.reduce((sum, record) => sum + (record.total - record.paid), 0)
  const totalCollected = maintenanceRecords.reduce((sum, record) => sum + record.paid, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Maintenance</h2>
          <p className="text-gray-600 mt-1">Track all maintenance payments and bills</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Add Bill</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Collected</p>
              <p className="text-2xl font-bold text-green-600 mt-2">₹{totalCollected.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Pending</p>
              <p className="text-2xl font-bold text-red-600 mt-2">₹{totalPending.toLocaleString()}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Collection Rate</p>
              <p className="text-2xl font-bold text-primary-600 mt-2">
                {((totalCollected / (totalCollected + totalPending)) * 100).toFixed(1)}%
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="paid" fill="#10b981" name="Paid" />
            <Bar dataKey="pending" fill="#ef4444" name="Pending" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        {['all', 'paid', 'partial', 'pending'].map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              filter === filterOption
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </button>
        ))}
      </div>

      {/* Maintenance Records */}
      <div className="space-y-4">
        {filteredRecords.map((record) => (
          <div key={record.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900">{record.month}</h3>
                  <span
                    className={`badge ${
                      record.status === 'Paid'
                        ? 'badge-success'
                        : record.status === 'Partial'
                        ? 'badge-warning'
                        : 'badge-danger'
                    }`}
                  >
                    {record.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{record.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="font-medium text-gray-900">{record.dueDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Amount per Flatmate</p>
                <p className="text-lg font-semibold text-gray-900">₹{record.amount.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-lg font-semibold text-gray-900">₹{record.total.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Collected</p>
                <p className="text-lg font-semibold text-green-600">₹{record.paid.toLocaleString()}</p>
              </div>
            </div>

            {record.payments.length > 0 && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Payment Details</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2 text-gray-700">Flatmate</th>
                        <th className="text-right py-2 text-gray-700">Amount</th>
                        <th className="text-center py-2 text-gray-700">Payment Date</th>
                        <th className="text-center py-2 text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {record.payments.map((payment, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2">{payment.flatmate}</td>
                          <td className="py-2 text-right font-medium">₹{payment.amount.toLocaleString()}</td>
                          <td className="py-2 text-center text-gray-600">{payment.date || '-'}</td>
                          <td className="py-2 text-center">
                            <span
                              className={`badge ${
                                payment.status === 'Paid'
                                  ? 'badge-success'
                                  : payment.status === 'Partial'
                                  ? 'badge-warning'
                                  : 'badge-danger'
                              }`}
                            >
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Other Bills */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Other Bills</h3>
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View All
          </button>
        </div>
        <div className="space-y-3">
          {otherBills.map((bill) => (
            <div key={bill.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{bill.type}</p>
                <p className="text-sm text-gray-600">{bill.description}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">₹{bill.amount.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Due: {bill.dueDate}</p>
                <span className="badge-warning text-xs mt-1">Pending</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Bill Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add New Bill</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bill Type</label>
                <select className="input-field">
                  <option>Maintenance</option>
                  <option>Electricity</option>
                  <option>Water</option>
                  <option>Cleaning</option>
                  <option>Security</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input type="number" className="input-field" placeholder="Enter amount" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input-field" rows="3" placeholder="Bill description"></textarea>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-primary"
              >
                Add Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Maintenance












