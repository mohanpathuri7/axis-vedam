import { useState, useEffect } from 'react'
import { Bell, Clock, Mail, MessageSquare, Save, RefreshCw } from 'lucide-react'
import { remindersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const Reminders = () => {
  const { canEdit } = useAuth()
  const [settings, setSettings] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sendingReminders, setSendingReminders] = useState(false)

  const [formData, setFormData] = useState({
    frequency: 'daily',
    hourUtc: 9,
    businessHoursStart: 9,
    businessHoursEnd: 18,
    channels: ['email']
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [settingsData, logsData] = await Promise.all([
        remindersAPI.getSettings(),
        remindersAPI.getLogs()
      ])
      
      if (settingsData) {
        setSettings(settingsData)
        setFormData({
          frequency: settingsData.frequency || 'daily',
          hourUtc: settingsData.hourUtc || 9,
          businessHoursStart: settingsData.businessHoursStart || 9,
          businessHoursEnd: settingsData.businessHoursEnd || 18,
          channels: settingsData.channels ? settingsData.channels.split(',') : ['email']
        })
      }
      setLogs(logsData || [])
    } catch (error) {
      console.error('Failed to load reminder data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      await remindersAPI.updateSettings({
        ...formData,
        channels: formData.channels
      })
      alert('Reminder settings saved successfully!')
      loadData()
    } catch (error) {
      alert('Failed to save settings: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSendReminders = async () => {
    if (!confirm('Send payment reminders to all pending flatmates?')) return
    
    try {
      setSendingReminders(true)
      await remindersAPI.sendReminders()
      alert('Reminders sent successfully!')
      loadData()
    } catch (error) {
      alert('Failed to send reminders: ' + error.message)
    } finally {
      setSendingReminders(false)
    }
  }

  const handleChannelChange = (channel) => {
    setFormData(prev => ({
      ...prev,
      channels: prev.channels.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...prev.channels, channel]
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Reminders</h2>
          <p className="text-gray-600 mt-1">Configure automated payment reminder system</p>
        </div>
        <button
          onClick={handleSendReminders}
          disabled={sendingReminders}
          className="btn-primary flex items-center space-x-2"
        >
          {sendingReminders ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <Bell className="h-5 w-5" />
              <span>Send Reminders Now</span>
            </>
          )}
        </button>
      </div>

      {/* Settings Card */}
      <div className="card">
        <form onSubmit={handleSaveSettings}>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reminder Settings</h3>
            <div className="space-y-6">
              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reminder Frequency
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                  disabled={!canEdit()}
                  className="input-field"
                >
                  <option value="daily">Daily</option>
                  <option value="twice_daily">Twice Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  How often reminders should be sent to defaulters
                </p>
              </div>

              {/* Notification Channels */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification Channels
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.channels.includes('email')}
                      onChange={() => handleChannelChange('email')}
                      disabled={!canEdit()}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
                    />
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-700">Email Notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.channels.includes('sms')}
                      onChange={() => handleChannelChange('sms')}
                      disabled={!canEdit()}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mr-2"
                    />
                    <MessageSquare className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm text-gray-700">SMS Notifications</span>
                  </label>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select channels for sending reminders
                </p>
              </div>

              {/* Business Hours */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Hours
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Start Time (Hour)</label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={formData.businessHoursStart}
                      onChange={(e) => setFormData({...formData, businessHoursStart: parseInt(e.target.value)})}
                      disabled={!canEdit()}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">End Time (Hour)</label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={formData.businessHoursEnd}
                      onChange={(e) => setFormData({...formData, businessHoursEnd: parseInt(e.target.value)})}
                      disabled={!canEdit()}
                      className="input-field"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Reminders will only be sent during these hours (24-hour format)
                </p>
              </div>

              {/* Preferred Hour */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Reminder Hour (UTC)
                </label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={formData.hourUtc}
                  onChange={(e) => setFormData({...formData, hourUtc: parseInt(e.target.value)})}
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Time of day to send daily reminders (0-23, UTC timezone)
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={loadData}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Reset</span>
            </button>
            {canEdit() && (
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center space-x-2"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            )}
            {!canEdit() && (
              <div className="text-sm text-gray-500 italic px-4 py-2 bg-gray-50 rounded-lg">
                📋 View-only mode (General User)
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Current Configuration Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900">Frequency</p>
              <p className="text-lg font-bold text-blue-700 capitalize">
                {formData.frequency.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Bell className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-900">Channels</p>
              <p className="text-lg font-bold text-green-700">
                {formData.channels.length} Active
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-purple-50 border-purple-200">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-purple-900">Business Hours</p>
              <p className="text-lg font-bold text-purple-700">
                {formData.businessHoursStart}:00 - {formData.businessHoursEnd}:00
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reminder Logs */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Reminder History</h3>
          <button
            onClick={loadData}
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-semibold text-gray-900 mb-2">No Reminders Sent Yet</h4>
            <p className="text-gray-600">
              Reminder logs will appear here once you start sending reminders
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Channel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.slice(0, 50).map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.target}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {log.channel}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        log.status === 'sent' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {log.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length > 50 && (
              <p className="text-center text-sm text-gray-500 py-4">
                Showing 50 most recent reminders of {logs.length} total
              </p>
            )}
          </div>
        )}
      </div>

      {/* Information Box */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 mb-2">How Reminders Work</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Reminders are sent automatically based on your frequency settings</li>
              <li>• Only flatmates with pending payments receive reminders</li>
              <li>• Notifications are sent via selected channels (Email/SMS)</li>
              <li>• All reminder activity is logged in the history table</li>
              <li>• You can also send manual reminders using the "Send Reminders Now" button</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reminders
