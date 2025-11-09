import { useState } from 'react'
import { Bell, Clock, Send, Settings, Calendar, Mail, MessageCircle, CheckCircle2 } from 'lucide-react'

const Reminders = () => {
  const [reminders, setReminders] = useState([
    {
      id: 1,
      type: 'Payment Due',
      recipient: 'Rajesh Kumar',
      flat: 'A-101',
      amount: 5000,
      dueDate: '2024-04-20',
      daysUntilDue: 5,
      status: 'Pending',
      lastSent: null,
      frequency: 'daily',
      enabled: true,
      method: 'email',
    },
    {
      id: 2,
      type: 'Payment Due',
      recipient: 'Priya Sharma',
      flat: 'B-203',
      amount: 4500,
      dueDate: '2024-04-20',
      daysUntilDue: 5,
      status: 'Pending',
      lastSent: '2024-04-15 10:30 AM',
      frequency: 'daily',
      enabled: true,
      method: 'sms',
    },
    {
      id: 3,
      type: 'Payment Overdue',
      recipient: 'Amit Patel',
      flat: 'C-305',
      amount: 3000,
      dueDate: '2024-04-13',
      daysUntilDue: -7,
      status: 'Overdue',
      lastSent: '2024-04-15 09:15 AM',
      frequency: 'twice_daily',
      enabled: true,
      method: 'both',
    },
    {
      id: 4,
      type: 'Upcoming Due',
      recipient: 'All Flatmates',
      flat: 'All',
      amount: 3500,
      dueDate: '2024-04-22',
      daysUntilDue: 7,
      status: 'Scheduled',
      lastSent: null,
      frequency: 'weekly',
      enabled: true,
      method: 'email',
    },
  ])

  const [notificationSettings, setNotificationSettings] = useState({
    autoReminder: true,
    reminderBeforeDays: 3,
    overdueReminderInterval: 'daily',
    paymentMethods: ['email', 'sms'],
    businessHours: { start: '09:00', end: '18:00' },
  })

  const [showSettings, setShowSettings] = useState(false)

  const handleSendReminder = (id) => {
    setReminders(
      reminders.map((r) =>
        r.id === id
          ? { ...r, lastSent: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) }
          : r
      )
    )
  }

  const handleSendAll = () => {
    setReminders(
      reminders.map((r) => ({
        ...r,
        lastSent: new Date().toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }),
      }))
    )
  }

  const handleToggleReminder = (id) => {
    setReminders(reminders.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)))
  }

  const getMethodIcon = (method) => {
    if (method === 'email') return <Mail className="h-4 w-4" />
    if (method === 'sms') return <MessageCircle className="h-4 w-4" />
    return (
      <div className="flex space-x-1">
        <Mail className="h-4 w-4" />
        <MessageCircle className="h-4 w-4" />
      </div>
    )
  }

  const getFrequencyLabel = (frequency) => {
    const labels = {
      daily: 'Daily',
      twice_daily: 'Twice Daily',
      weekly: 'Weekly',
      monthly: 'Monthly',
    }
    return labels[frequency] || frequency
  }

  const pendingReminders = reminders.filter((r) => r.enabled && r.status !== 'Sent')
  const sentReminders = reminders.filter((r) => r.status === 'Sent')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Reminders</h2>
          <p className="text-gray-600 mt-1">Automated reminders for payment dues</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSettings(true)}
            className="btn-secondary flex items-center space-x-2"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>
          <button
            onClick={handleSendAll}
            className="btn-primary flex items-center space-x-2"
            disabled={pendingReminders.length === 0}
          >
            <Send className="h-5 w-5" />
            <span>Send All ({pendingReminders.length})</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Reminders</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">{pendingReminders.length}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Auto-Reminders</p>
              <p className="text-2xl font-bold text-primary-600 mt-2">
                {reminders.filter((r) => r.enabled).length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Bell className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                {reminders.filter((r) => r.status === 'Overdue').length}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <Bell className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Auto-Reminder</p>
              <p className="text-sm font-semibold text-green-600 mt-2">
                {notificationSettings.autoReminder ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Reminders List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Reminders</h3>
        <div className="space-y-4">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={`p-4 rounded-lg border-2 ${
                reminder.status === 'Overdue'
                  ? 'border-red-200 bg-red-50'
                  : reminder.status === 'Pending'
                  ? 'border-yellow-200 bg-yellow-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{reminder.recipient}</h4>
                    <span className="badge-info text-xs">{reminder.flat}</span>
                    <span
                      className={`badge ${
                        reminder.status === 'Overdue'
                          ? 'badge-danger'
                          : reminder.status === 'Pending'
                          ? 'badge-warning'
                          : 'badge-info'
                      }`}
                    >
                      {reminder.status}
                    </span>
                    {reminder.enabled ? (
                      <span className="badge-success text-xs">Auto</span>
                    ) : (
                      <span className="badge text-xs bg-gray-200 text-gray-700">Manual</span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Amount</p>
                      <p className="font-semibold text-gray-900">₹{reminder.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Due Date</p>
                      <p className="font-semibold text-gray-900 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {reminder.dueDate}
                        {reminder.daysUntilDue < 0 && (
                          <span className="ml-2 text-red-600">({Math.abs(reminder.daysUntilDue)} days overdue)</span>
                        )}
                        {reminder.daysUntilDue >= 0 && (
                          <span className="ml-2 text-gray-500">(in {reminder.daysUntilDue} days)</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Frequency</p>
                      <p className="font-semibold text-gray-900">{getFrequencyLabel(reminder.frequency)}</p>
                    </div>
                  </div>
                  {reminder.lastSent && (
                    <p className="text-xs text-gray-500 mt-2">Last sent: {reminder.lastSent}</p>
                  )}
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs text-gray-600">Method:</span>
                    <div className="flex items-center space-x-1 text-primary-600">
                      {getMethodIcon(reminder.method)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => handleSendReminder(reminder.id)}
                    className="btn-primary text-sm whitespace-nowrap"
                  >
                    Send Now
                  </button>
                  <button
                    onClick={() => handleToggleReminder(reminder.id)}
                    className={`text-sm px-3 py-1 rounded-lg font-medium whitespace-nowrap ${
                      reminder.enabled
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                    }`}
                  >
                    {reminder.enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-Reminder Info */}
      <div className="card bg-primary-50 border-primary-200">
        <div className="flex items-start space-x-3">
          <Bell className="h-5 w-5 text-primary-600 mt-0.5" />
          <div>
            <h4 className="font-semibold text-primary-900">Auto-Reminder System</h4>
            <p className="text-sm text-primary-700 mt-1">
              When enabled, reminders are automatically sent based on your configured settings. Reminders are sent
              {notificationSettings.reminderBeforeDays > 0 && (
                <span> {notificationSettings.reminderBeforeDays} days before</span>
              )}{' '}
              the due date and continue for overdue payments according to your frequency settings.
            </p>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Reminder Settings</h3>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notificationSettings.autoReminder}
                    onChange={(e) =>
                      setNotificationSettings({ ...notificationSettings, autoReminder: e.target.checked })
                    }
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <span className="font-medium text-gray-900">Enable Auto-Reminder</span>
                </label>
                <p className="text-sm text-gray-600 mt-1 ml-8">
                  Automatically send reminders based on due dates
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remind Before Due Date (Days)
                </label>
                <input
                  type="number"
                  value={notificationSettings.reminderBeforeDays}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      reminderBeforeDays: parseInt(e.target.value),
                    })
                  }
                  className="input-field"
                  min="0"
                  max="30"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overdue Reminder Frequency
                </label>
                <select
                  value={notificationSettings.overdueReminderInterval}
                  onChange={(e) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      overdueReminderInterval: e.target.value,
                    })
                  }
                  className="input-field"
                >
                  <option value="daily">Daily</option>
                  <option value="twice_daily">Twice Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Methods
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.paymentMethods.includes('email')}
                      onChange={(e) => {
                        const methods = notificationSettings.paymentMethods
                        if (e.target.checked) {
                          setNotificationSettings({
                            ...notificationSettings,
                            paymentMethods: [...methods, 'email'],
                          })
                        } else {
                          setNotificationSettings({
                            ...notificationSettings,
                            paymentMethods: methods.filter((m) => m !== 'email'),
                          })
                        }
                      }}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-gray-700">Email</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings.paymentMethods.includes('sms')}
                      onChange={(e) => {
                        const methods = notificationSettings.paymentMethods
                        if (e.target.checked) {
                          setNotificationSettings({
                            ...notificationSettings,
                            paymentMethods: [...methods, 'sms'],
                          })
                        } else {
                          setNotificationSettings({
                            ...notificationSettings,
                            paymentMethods: methods.filter((m) => m !== 'sms'),
                          })
                        }
                      }}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-gray-700">SMS</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Hours</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Start</label>
                    <input
                      type="time"
                      value={notificationSettings.businessHours.start}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          businessHours: {
                            ...notificationSettings.businessHours,
                            start: e.target.value,
                          },
                        })
                      }
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">End</label>
                    <input
                      type="time"
                      value={notificationSettings.businessHours.end}
                      onChange={(e) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          businessHours: {
                            ...notificationSettings.businessHours,
                            end: e.target.value,
                          },
                        })
                      }
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button onClick={() => setShowSettings(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="btn-primary"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Reminders












