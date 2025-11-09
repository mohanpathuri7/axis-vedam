import { useState, useEffect } from 'react'
import { Plus, Search, Phone, Mail, MapPin, Edit, Trash2, UserPlus, Home, X } from 'lucide-react'
import { flatmatesAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

const Flatmates = () => {
  const { canEdit, isAdmin } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedFlatmate, setSelectedFlatmate] = useState(null)
  const [flatmates, setFlatmates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    moveInDate: '',
    moveOutDate: '',
    isActive: true
  })

  // Fetch flatmates from API
  useEffect(() => {
    loadFlatmates()
  }, [])

  const loadFlatmates = async () => {
    try {
      setLoading(true)
      const data = await flatmatesAPI.getAll()
      setFlatmates(data)
      setError(null)
    } catch (err) {
      setError('Failed to load flatmates')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filteredFlatmates = flatmates.filter((flatmate) =>
    flatmate.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flatmate.flat?.number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flatmate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    flatmate.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeFlatmates = flatmates.filter(f => f.isActive)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="card bg-red-50 border-red-200">
          <p className="text-red-800">{error}</p>
          <button onClick={loadFlatmates} className="btn-primary mt-4">
            Retry
          </button>
        </div>
      </div>
    )
  }

  const handleEdit = (flatmate) => {
    setSelectedFlatmate(flatmate)
    setEditForm({
      fullName: flatmate.fullName || '',
      email: flatmate.email || '',
      phone: flatmate.phone || '',
      moveInDate: flatmate.moveInDate ? new Date(flatmate.moveInDate).toISOString().split('T')[0] : '',
      moveOutDate: flatmate.moveOutDate ? new Date(flatmate.moveOutDate).toISOString().split('T')[0] : '',
      isActive: flatmate.isActive
    })
    setShowEditModal(true)
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    try {
      await flatmatesAPI.update(selectedFlatmate.id, {
        ...editForm,
        moveInDate: editForm.moveInDate || null,
        moveOutDate: editForm.moveOutDate || null
      })
      setShowEditModal(false)
      loadFlatmates()
      alert('Flatmate updated successfully!')
    } catch (error) {
      console.error('Update error:', error)
      alert('Failed to update flatmate: ' + error.message)
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

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this flatmate?')) {
      setFlatmates(flatmates.filter((f) => f.id !== id))
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Flatmates</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage all apartment members ({flatmates.length} residents)
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, flat, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field pl-10 text-sm sm:text-base"
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="card">
          <p className="text-xs sm:text-sm text-gray-600">Total Flatmates</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{flatmates.length}</p>
        </div>
        <div className="card">
          <p className="text-xs sm:text-sm text-gray-600">Active Members</p>
          <p className="text-xl sm:text-2xl font-bold text-green-600 mt-1">{activeFlatmates.length}</p>
        </div>
        <div className="card">
          <p className="text-xs sm:text-sm text-gray-600">Total Flats</p>
          <p className="text-xl sm:text-2xl font-bold text-primary-600 mt-1">
            {new Set(flatmates.map(f => f.flatId)).size}
          </p>
        </div>
      </div>

      {/* Flatmates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredFlatmates.map((flatmate) => (
          <div key={flatmate.id} className="card hover:shadow-md transition-shadow relative">
            {/* Edit Button - Top Right (Admin Only) */}
            {canEdit() && (
              <button
                onClick={() => handleEdit(flatmate)}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-primary-50 text-gray-600 hover:text-primary-600 transition-colors"
                title="Edit flatmate details"
              >
                <Edit className="h-4 w-4" />
              </button>
            )}
            
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 pr-10">
                <h3 className="text-lg font-semibold text-gray-900">{flatmate.fullName}</h3>
                <div className="flex items-center mt-1">
                  <Home className="h-4 w-4 text-gray-400 mr-1" />
                  <span className="badge-info text-xs">
                    {flatmate.flat?.number || `Flat #${flatmate.flatId}`}
                  </span>
                </div>
                {flatmate.isActive ? (
                  <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded">
                    Active
                  </span>
                ) : (
                  <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded">
                    Inactive
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {flatmate.phone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className={!isAdmin() ? 'select-none' : ''}>
                    {isAdmin() ? flatmate.phone : maskPhone(flatmate.phone)}
                  </span>
                  {!isAdmin() && (
                    <span className="ml-2 text-xs text-gray-400 italic">(Hidden for General User)</span>
                  )}
                </div>
              )}
              {flatmate.email && (
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className={`truncate ${!isAdmin() ? 'select-none' : ''}`}>
                    {isAdmin() ? flatmate.email : maskEmail(flatmate.email)}
                  </span>
                  {!isAdmin() && (
                    <span className="ml-2 text-xs text-gray-400 italic whitespace-nowrap">(Hidden for General User)</span>
                  )}
                </div>
              )}
              {flatmate.flat && (
                <>
                  {flatmate.flat.bhk && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{flatmate.flat.bhk} • {flatmate.flat.sizeSqft} sqft</span>
                    </div>
                  )}
                  {flatmate.flat.floor !== null && flatmate.flat.floor !== undefined && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Floor:</span> {flatmate.flat.floor}
                    </div>
                  )}
                </>
              )}
            </div>

            {(flatmate.moveInDate || flatmate.moveOutDate) && (
              <div className="border-t border-gray-200 pt-3 space-y-1">
                {flatmate.moveInDate && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Move In:</span> {new Date(flatmate.moveInDate).toLocaleDateString()}
                  </div>
                )}
                {flatmate.moveOutDate && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Move Out:</span> {new Date(flatmate.moveOutDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredFlatmates.length === 0 && (
        <div className="card text-center py-12">
          <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No flatmates found</h3>
          <p className="text-gray-600">
            {searchTerm
              ? 'Try adjusting your search criteria'
              : 'No flatmates have been added yet'}
          </p>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedFlatmate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white sm:rounded-lg shadow-xl w-full sm:max-w-md h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSaveEdit} className="flex flex-col h-full sm:h-auto">
              <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Edit Flatmate</h3>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Flat: {selectedFlatmate.flat?.number} (Cannot be changed)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="flex-1 p-4 sm:p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                    className="input-field text-sm sm:text-base"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="input-field text-sm sm:text-base"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="input-field text-sm sm:text-base"
                    placeholder="+91-9876543210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Move In Date
                  </label>
                  <input
                    type="date"
                    value={editForm.moveInDate}
                    onChange={(e) => setEditForm({...editForm, moveInDate: e.target.value})}
                    className="input-field text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Move Out Date
                  </label>
                  <input
                    type="date"
                    value={editForm.moveOutDate}
                    onChange={(e) => setEditForm({...editForm, moveOutDate: e.target.value})}
                    className="input-field text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editForm.isActive}
                      onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">Active Member</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Uncheck if the flatmate has moved out
                  </p>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 border-t border-gray-200 flex gap-2 sm:gap-3 justify-end sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary text-sm sm:text-base px-3 sm:px-4"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-sm sm:text-base px-3 sm:px-4">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Flatmates













