import { useState, useEffect } from 'react'
import { Plus, Calendar, Filter, DollarSign, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { cyclesAPI, paymentsAPI, flatsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const Maintenance = () => {
  const { canEdit } = useAuth()
  const RATE_PER_SQFT = 3.75 // Rate per square foot
  
  const [filter, setFilter] = useState('all')
  const [showAddCycleModal, setShowAddCycleModal] = useState(false)
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false)
  const [showFlatDetailsModal, setShowFlatDetailsModal] = useState(false)
  const [cycles, setCycles] = useState([])
  const [payments, setPayments] = useState([])
  const [flats, setFlats] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCycle, setSelectedCycle] = useState(null)
  const [selectedFlatForPayment, setSelectedFlatForPayment] = useState(null)
  
  // Form states
  const [newCycle, setNewCycle] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    ratePerSqft: 3.75,
    dueDate: '',
    lateFeePercent: 3,
    gracePeriodDays: 3
  })
  
  const [newPayment, setNewPayment] = useState({
    flatId: '',
    cycleId: '',
    amount: '',
    method: 'bank_transfer',
    reference: '',
    paidAt: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [cyclesData, paymentsData, flatsData] = await Promise.all([
        cyclesAPI.getAll(),
        paymentsAPI.getAll(),
        flatsAPI.getAll()
      ])
      setCycles(cyclesData)
      setPayments(paymentsData)
      setFlats(flatsData)
    } catch (error) {
      console.error('Failed to load maintenance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCycle = async (e) => {
    e.preventDefault()
    try {
      // Create cycle with rate per sqft stored in dueAmount field
      const cycleData = {
        year: parseInt(newCycle.year),
        month: parseInt(newCycle.month),
        dueAmount: parseFloat(newCycle.ratePerSqft),
        dueDate: newCycle.dueDate || undefined,
        lateFeePercent: parseFloat(newCycle.lateFeePercent) || 3,
        gracePeriodDays: parseInt(newCycle.gracePeriodDays) || 3
      }
      console.log('Creating cycle with data:', cycleData)
      await cyclesAPI.create(cycleData)
      setShowAddCycleModal(false)
      setNewCycle({
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        ratePerSqft: 3.75,
        dueDate: '',
        lateFeePercent: 3,
        gracePeriodDays: 3
      })
      loadData()
    } catch (error) {
      console.error('Create cycle error:', error)
      alert('Failed to create cycle: ' + error.message)
    }
  }

  const handleCreatePayment = async (e) => {
    e.preventDefault()
    try {
      const paymentData = {
        ...newPayment,
        flatId: parseInt(newPayment.flatId),
        cycleId: parseInt(newPayment.cycleId),
        amount: parseFloat(newPayment.amount)
      }
      console.log('Creating payment with data:', paymentData)
      await paymentsAPI.create(paymentData)
      setShowAddPaymentModal(false)
      setNewPayment({
        flatId: '',
        cycleId: '',
        amount: '',
        method: 'bank_transfer',
        reference: '',
        paidAt: new Date().toISOString().split('T')[0]
      })
      setSelectedFlatForPayment(null)
      loadData()
    } catch (error) {
      console.error('Create payment error:', error)
      alert('Failed to record payment: ' + error.message)
    }
  }

  // Handle flat selection for payment - auto-fill amount
  const handleFlatSelection = (flatId) => {
    const flat = flats.find(f => f.id === parseInt(flatId))
    const cycle = cycles.find(c => c.id === parseInt(newPayment.cycleId))
    
    if (flat && cycle) {
      const ratePerSqft = parseFloat(cycle.dueAmount) || RATE_PER_SQFT
      const calculatedAmount = getFlatMaintenanceAmount(flat, ratePerSqft)
      setNewPayment({
        ...newPayment,
        flatId,
        amount: calculatedAmount.toFixed(2)
      })
      setSelectedFlatForPayment(flat)
    } else {
      setNewPayment({...newPayment, flatId})
      setSelectedFlatForPayment(flat)
    }
  }

  // Calculate statistics
  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months[month - 1]
  }

  // Calculate maintenance amount for a flat
  const getFlatMaintenanceAmount = (flat, ratePerSqft = RATE_PER_SQFT) => {
    if (!flat) return 0
    // If flat has fixed monthly due, use that, otherwise calculate from area
    if (flat.maintenanceBasis === 'fixed' && flat.fixedMonthlyDue) {
      return parseFloat(flat.fixedMonthlyDue)
    }
    return (flat.sizeSqft || 0) * ratePerSqft
  }

  // Calculate total expected for a cycle
  const getCycleExpectedAmount = (cycle) => {
    const ratePerSqft = parseFloat(cycle.dueAmount) || RATE_PER_SQFT
    return flats.reduce((sum, flat) => sum + getFlatMaintenanceAmount(flat, ratePerSqft), 0)
  }

  const getCyclePayments = (cycleId) => {
    return payments.filter(p => p.cycleId === cycleId && p.status === 'success')
  }

  const getTotalCollected = (cycleId) => {
    return getCyclePayments(cycleId).reduce((sum, p) => sum + parseFloat(p.amount), 0)
  }

  const getCycleStatus = (cycle) => {
    const collected = getTotalCollected(cycle.id)
    const expected = getCycleExpectedAmount(cycle)
    if (collected >= expected * 0.99) return 'Paid' // 99% threshold for rounding
    if (collected > 0) return 'Partial'
    return 'Pending'
  }

  // Chart data
  const chartData = cycles.slice(0, 6).reverse().map(cycle => {
    const collected = getTotalCollected(cycle.id)
    const expected = getCycleExpectedAmount(cycle)
    return {
      month: `${getMonthName(cycle.month)} ${cycle.year}`,
      collected: collected,
      pending: Math.max(0, expected - collected)
    }
  })

  const totalPending = cycles.reduce((sum, cycle) => {
    const collected = getTotalCollected(cycle.id)
    const expected = getCycleExpectedAmount(cycle)
    return sum + Math.max(0, expected - collected)
  }, 0)

  const totalCollected = payments
    .filter(p => p.status === 'success')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0)

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Maintenance</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Track all maintenance payments and bills</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {canEdit() && (
            <>
              <button
                onClick={() => setShowAddPaymentModal(true)}
                className="btn-secondary flex items-center space-x-2 text-sm sm:text-base"
                disabled={cycles.length === 0}
              >
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Record Payment</span>
              </button>
              <button
                onClick={() => setShowAddCycleModal(true)}
                className="btn-primary flex items-center space-x-2 text-sm sm:text-base"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>New Cycle</span>
              </button>
            </>
          )}
          {!canEdit() && (
            <div className="text-xs sm:text-sm text-gray-500 italic px-3 sm:px-4 py-2 bg-gray-50 rounded-lg">
              📋 View-only mode (General User)
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Collected</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1 sm:mt-2">₹{totalCollected.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </div>
            <div className="bg-green-100 p-2 sm:p-3 rounded-lg">
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Pending Amount</p>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600 mt-1 sm:mt-2">₹{totalPending.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Outstanding</p>
            </div>
            <div className="bg-yellow-100 p-2 sm:p-3 rounded-lg">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Cycles</p>
              <p className="text-xl sm:text-2xl font-bold text-primary-600 mt-1 sm:mt-2">{cycles.length}</p>
              <p className="text-xs text-gray-500 mt-1">Maintenance periods</p>
            </div>
            <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
              <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Collection Chart */}
      {chartData.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Collection Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="collected" fill="#10b981" name="Collected" />
              <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* No Cycles Message */}
      {cycles.length === 0 && (
        <div className="card text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Maintenance Cycles</h3>
          <p className="text-gray-600 mb-4">Create your first maintenance cycle to start tracking payments</p>
          <button
            onClick={() => setShowAddCycleModal(true)}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>Create First Cycle</span>
          </button>
        </div>
      )}

      {/* Maintenance Cycles List */}
      {cycles.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Maintenance Cycles</h3>
          {cycles.map((cycle) => {
            const cyclePayments = getCyclePayments(cycle.id)
            const collected = getTotalCollected(cycle.id)
            const expected = getCycleExpectedAmount(cycle)
            const ratePerSqft = parseFloat(cycle.dueAmount) || RATE_PER_SQFT
            const status = getCycleStatus(cycle)
            const percentage = expected > 0 ? (collected / expected) * 100 : 0

            return (
              <div key={cycle.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {getMonthName(cycle.month)} {cycle.year}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Due: {cycle.dueDate ? new Date(cycle.dueDate).toLocaleDateString() : 'Not set'} • 
                      Rate: ₹{ratePerSqft.toFixed(2)}/sqft
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {status === 'Paid' && (
                      <span className="badge-success">Paid</span>
                    )}
                    {status === 'Partial' && (
                      <span className="badge-warning">Partial</span>
                    )}
                    {status === 'Pending' && (
                      <span className="badge-danger">Pending</span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Collection Progress</span>
                    <span className="font-semibold text-gray-900">
                      ₹{collected.toLocaleString()} / ₹{expected.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        percentage === 100 ? 'bg-green-600' : percentage > 0 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {cyclePayments.length} of {flats.length} flats paid ({percentage.toFixed(1)}%)
                  </p>
                </div>

                {cyclePayments.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Recent Payments</h5>
                    <div className="space-y-2">
                      {cyclePayments.slice(0, 5).map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">
                            {payment.flat?.number || `Flat #${payment.flatId}`}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900">
                              ₹{parseFloat(payment.amount).toLocaleString()}
                            </span>
                            <span className="text-gray-500">
                              {new Date(payment.paidAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                      {cyclePayments.length > 5 && (
                        <p className="text-xs text-gray-500 text-center pt-2">
                          +{cyclePayments.length - 5} more payments
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Add Cycle Modal */}
      {showAddCycleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white sm:rounded-lg shadow-xl w-full sm:max-w-md h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreateCycle} className="flex flex-col h-full sm:h-auto">
              <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Create Maintenance Cycle</h3>
              </div>
              <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                    <input
                      type="number"
                      required
                      min="2000"
                      max="2100"
                      value={newCycle.year}
                      onChange={(e) => setNewCycle({...newCycle, year: e.target.value})}
                      className="input-field text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                    <select
                      required
                      value={newCycle.month}
                      onChange={(e) => setNewCycle({...newCycle, month: e.target.value})}
                      className="input-field text-sm sm:text-base"
                    >
                      {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>{getMonthName(m)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rate per Sq. Ft. (₹)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={newCycle.ratePerSqft}
                    onChange={(e) => setNewCycle({...newCycle, ratePerSqft: e.target.value})}
                    className="input-field text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Default is ₹3.75/sqft. Each flat will be charged: Area × Rate
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newCycle.dueDate}
                    onChange={(e) => setNewCycle({...newCycle, dueDate: e.target.value})}
                    className="input-field text-sm sm:text-base"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Late Fee (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={newCycle.lateFeePercent}
                      onChange={(e) => setNewCycle({...newCycle, lateFeePercent: e.target.value})}
                      className="input-field text-sm sm:text-base"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      One-time penalty on maintenance amount
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grace Period (Days)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      value={newCycle.gracePeriodDays}
                      onChange={(e) => setNewCycle({...newCycle, gracePeriodDays: e.target.value})}
                      className="input-field text-sm sm:text-base"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Days after due date before late fee applies
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6 border-t border-gray-200 flex justify-end gap-2 sm:gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setShowAddCycleModal(false)}
                  className="btn-secondary text-sm sm:text-base px-3 sm:px-4"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-sm sm:text-base px-3 sm:px-4">
                  Create Cycle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      {showAddPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white sm:rounded-lg shadow-xl w-full sm:max-w-md h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleCreatePayment} className="flex flex-col h-full sm:h-auto">
              <div className="p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Record Payment</h3>
              </div>
              <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cycle</label>
                  <select
                    required
                    value={newPayment.cycleId}
                    onChange={(e) => setNewPayment({...newPayment, cycleId: e.target.value})}
                    className="input-field text-sm sm:text-base"
                  >
                    <option value="">Select cycle...</option>
                    {cycles.map(cycle => (
                      <option key={cycle.id} value={cycle.id}>
                        {getMonthName(cycle.month)} {cycle.year}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Flat</label>
                  <select
                    required
                    value={newPayment.flatId}
                    onChange={(e) => handleFlatSelection(e.target.value)}
                    className="input-field text-sm sm:text-base"
                  >
                    <option value="">Select flat...</option>
                    {flats.map(flat => {
                      const cycle = cycles.find(c => c.id === parseInt(newPayment.cycleId))
                      const ratePerSqft = cycle ? parseFloat(cycle.dueAmount) : RATE_PER_SQFT
                      const amount = getFlatMaintenanceAmount(flat, ratePerSqft)
                      return (
                        <option key={flat.id} value={flat.id}>
                          {flat.number} - {flat.bhk || ''} ({flat.sizeSqft} sqft) - ₹{amount.toFixed(2)}
                        </option>
                      )
                    })}
                  </select>
                  {selectedFlatForPayment && (
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedFlatForPayment.bhk} • {selectedFlatForPayment.sizeSqft} sqft • 
                      ₹{getFlatMaintenanceAmount(selectedFlatForPayment, cycles.find(c => c.id === parseInt(newPayment.cycleId))?.dueAmount || RATE_PER_SQFT).toFixed(2)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                    className="input-field text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Amount is auto-filled based on flat area and rate per sqft
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={newPayment.method}
                    onChange={(e) => setNewPayment({...newPayment, method: e.target.value})}
                    className="input-field text-sm sm:text-base"
                  >
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="upi">UPI</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference/Transaction ID</label>
                  <input
                    type="text"
                    value={newPayment.reference}
                    onChange={(e) => setNewPayment({...newPayment, reference: e.target.value})}
                    className="input-field text-sm sm:text-base"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={newPayment.paidAt}
                    onChange={(e) => setNewPayment({...newPayment, paidAt: e.target.value})}
                    className="input-field text-sm sm:text-base"
                  />
                </div>
              </div>
              <div className="p-4 sm:p-6 border-t border-gray-200 flex justify-end gap-2 sm:gap-3 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setShowAddPaymentModal(false)}
                  className="btn-secondary text-sm sm:text-base px-3 sm:px-4"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-sm sm:text-base px-3 sm:px-4">
                  Record Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Maintenance
