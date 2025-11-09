import { useState, useEffect } from 'react'
import { AlertCircle, Send, Mail, MessageSquare, Download, Settings, CheckCircle2 } from 'lucide-react'
import { defaultersAPI, cyclesAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const Defaulters = () => {
  const { canEdit, isAdmin } = useAuth()
  const [cycles, setCycles] = useState([])
  const [selectedCycleId, setSelectedCycleId] = useState('')
  const [defaultersData, setDefaultersData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedFlats, setSelectedFlats] = useState([])
  const [showReminderModal, setShowReminderModal] = useState(false)
  const [reminderChannels, setReminderChannels] = useState(['email'])
  const [customMessage, setCustomMessage] = useState('')

  useEffect(() => {
    loadCycles()
  }, [])

  const loadCycles = async () => {
    try {
      const cyclesData = await cyclesAPI.getAll()
      setCycles(cyclesData)
      
      // Auto-select the most recent cycle
      if (cyclesData.length > 0) {
        const latestCycle = cyclesData[0]
        setSelectedCycleId(latestCycle.id)
        loadDefaulters(latestCycle.id)
      }
    } catch (error) {
      console.error('Failed to load cycles:', error)
    }
  }

  const loadDefaulters = async (cycleId) => {
    try {
      setLoading(true)
      const data = await defaultersAPI.getByCycle(cycleId)
      setDefaultersData(data)
    } catch (error) {
      console.error('Failed to load defaulters:', error)
      alert('Failed to load defaulters: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCycleChange = (cycleId) => {
    setSelectedCycleId(cycleId)
    setSelectedFlats([])
    if (cycleId) {
      loadDefaulters(cycleId)
    }
  }

  const handleSelectAll = () => {
    if (selectedFlats.length === defaultersData.defaulters.length) {
      setSelectedFlats([])
    } else {
      setSelectedFlats(defaultersData.defaulters.map(d => d.flatId))
    }
  }

  const handleSelectFlat = (flatId) => {
    if (selectedFlats.includes(flatId)) {
      setSelectedFlats(selectedFlats.filter(id => id !== flatId))
    } else {
      setSelectedFlats([...selectedFlats, flatId])
    }
  }

  const handleSendReminders = async () => {
    if (selectedFlats.length === 0) {
      alert('Please select at least one flat')
      return
    }

    try {
      await defaultersAPI.sendReminders(selectedCycleId, {
        flatIds: selectedFlats,
        channels: reminderChannels,
        customMessage
      })
      alert(`Reminders sent to ${selectedFlats.length} flat(s)`)
      setShowReminderModal(false)
      setSelectedFlats([])
      setCustomMessage('')
      loadDefaulters(selectedCycleId)
    } catch (error) {
      alert('Failed to send reminders: ' + error.message)
    }
  }

  const getMonthName = (month) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months[month - 1]
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (date) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const exportToCSV = () => {
    if (!defaultersData) return

    const headers = ['Flat', 'Owner', 'Email', 'Phone', 'Maintenance', 'Late Fee', 'Total Due', 'Days Overdue', 'Last Reminder']
    const rows = defaultersData.defaulters.map(d => [
      d.flatNumber,
      d.ownerName,
      d.email,
      d.phone,
      d.maintenanceAmount,
      d.lateFee,
      d.totalDue,
      d.daysOverdue,
      formatDate(d.lastReminderSent)
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `defaulters-${defaultersData.cycle.month}-${defaultersData.cycle.year}.csv`
    a.click()
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

  if (loading && !defaultersData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading defaulters...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Payment Defaulters</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Track and manage pending payments</p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <select
            value={selectedCycleId}
            onChange={(e) => handleCycleChange(e.target.value)}
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
      </div>

      {defaultersData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Total Defaulters</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600 mt-1">
                    {defaultersData.summary.totalDefaulters}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    out of {defaultersData.summary.totalFlats} flats
                  </p>
                </div>
                <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-200" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Pending Amount</p>
                  <p className="text-xl sm:text-2xl font-bold text-orange-600 mt-1">
                    {formatCurrency(defaultersData.summary.totalPendingAmount)}
                  </p>
                </div>
                <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-orange-200" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Late Fees</p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600 mt-1">
                    {formatCurrency(defaultersData.summary.totalLateFees)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    @{defaultersData.cycle.lateFeePercent}%
                  </p>
                </div>
                <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-purple-200" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Collection Rate</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">
                    {defaultersData.summary.collectionRate}%
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {defaultersData.summary.totalPaid} flats paid
                  </p>
                </div>
                <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-green-200" />
              </div>
            </div>
          </div>

          {/* Cycle Info */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-amber-900">
                  {getMonthName(defaultersData.cycle.month)} {defaultersData.cycle.year} - 
                  {defaultersData.summary.daysOverdue > 0 ? (
                    <span className="text-red-600 ml-2">
                      {defaultersData.summary.daysOverdue} days overdue
                    </span>
                  ) : (
                    <span className="text-green-600 ml-2">Within grace period</span>
                  )}
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Due Date: {new Date(defaultersData.cycle.dueDate).toLocaleDateString('en-IN')} | 
                  Grace Period: {defaultersData.cycle.gracePeriodDays} days | 
                  Late Fee: {defaultersData.cycle.lateFeePercent}%
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {defaultersData.defaulters.length > 0 && (
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {canEdit() && (
                    <>
                      <input
                        type="checkbox"
                        checked={selectedFlats.length === defaultersData.defaulters.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-600">
                        {selectedFlats.length} of {defaultersData.defaulters.length} selected
                      </span>
                    </>
                  )}
                  {!canEdit() && (
                    <div className="text-sm text-gray-500 italic">
                      📋 View-only mode (General User)
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={exportToCSV}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                  {canEdit() && (
                    <button
                      onClick={() => setShowReminderModal(true)}
                      disabled={selectedFlats.length === 0}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      Send Reminders ({selectedFlats.length})
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Defaulters Table */}
          {defaultersData.defaulters.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">All Payments Collected!</h3>
              <p className="text-gray-500 mt-2">No pending payments for this cycle.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {canEdit() && (
                      <th className="px-3 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedFlats.length === defaultersData.defaulters.length}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300"
                        />
                      </th>
                    )}
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Flat</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Maintenance</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Late Fee</th>
                    <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Due</th>
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">Days</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Reminder</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {defaultersData.defaulters.map((defaulter) => (
                    <tr key={defaulter.flatId} className="hover:bg-gray-50">
                      {canEdit() && (
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            checked={selectedFlats.includes(defaulter.flatId)}
                            onChange={() => handleSelectFlat(defaulter.flatId)}
                            className="rounded border-gray-300"
                          />
                        </td>
                      )}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="font-medium text-gray-900 text-sm">{defaulter.flatNumber}</div>
                        <div className="text-xs text-gray-500">{defaulter.bhk} • {defaulter.sizeSqft} sqft</div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-gray-900 text-sm">{defaulter.ownerName}</td>
                      <td className="px-3 py-3">
                        <div className="text-sm text-gray-900 truncate max-w-[150px]" title={isAdmin() ? defaulter.email : 'Hidden'}>
                          {isAdmin() ? defaulter.email : maskEmail(defaulter.email)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {isAdmin() ? defaulter.phone : maskPhone(defaulter.phone)}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-right text-gray-900 text-sm">
                        {formatCurrency(defaulter.maintenanceAmount)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-right text-red-600 text-sm">
                        {formatCurrency(defaulter.lateFee)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-right font-semibold text-gray-900 text-sm">
                        {formatCurrency(defaulter.totalDue)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-center">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          defaulter.daysOverdue === 0 ? 'bg-green-100 text-green-800' :
                          defaulter.daysOverdue <= 7 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {defaulter.daysOverdue === 0 ? 'Grace' : `${defaulter.daysOverdue}d`}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                        {defaulter.lastReminderSent ? (
                          <div>
                            <div className="text-xs">{formatDate(defaulter.lastReminderSent)}</div>
                            <div className="text-xs text-gray-400">{defaulter.lastReminderChannel}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">Never</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Send Payment Reminders</h3>
              <p className="text-sm text-gray-500 mt-1">
                Send to {selectedFlats.length} flat(s)
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Channels</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={reminderChannels.includes('email')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setReminderChannels([...reminderChannels, 'email'])
                        } else {
                          setReminderChannels(reminderChannels.filter(c => c !== 'email'))
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={reminderChannels.includes('whatsapp')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setReminderChannels([...reminderChannels, 'whatsapp'])
                        } else {
                          setReminderChannels(reminderChannels.filter(c => c !== 'whatsapp'))
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">WhatsApp</span>
                    <span className="text-xs text-gray-400">(Coming soon)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Message (Optional)
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={4}
                  placeholder="Add a custom message to the reminder..."
                  className="input-field"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
              <button
                onClick={() => setShowReminderModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReminders}
                disabled={reminderChannels.length === 0}
                className="btn-primary disabled:opacity-50"
              >
                Send Reminders
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Defaulters
