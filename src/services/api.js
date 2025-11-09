// API service for AxisFinance

// Use relative path for production (Vercel), localhost for development
const API_BASE_URL = import.meta.env.PROD 
  ? '/api'  // Production (Vercel) - relative path
  : 'http://localhost:4000/api'  // Development

// Fetch wrapper with error handling
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}`
      throw new Error(errorMessage)
    }

    return await response.json()
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

// Flats API
export const flatsAPI = {
  getAll: () => fetchAPI('/flats'),
  getById: (id) => fetchAPI(`/flats/${id}`),
  create: (data) => fetchAPI('/flats', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchAPI(`/flats/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchAPI(`/flats/${id}`, { method: 'DELETE' }),
}

// Flatmates API
export const flatmatesAPI = {
  getAll: () => fetchAPI('/flatmates'),
  getById: (id) => fetchAPI(`/flatmates/${id}`),
  create: (data) => fetchAPI('/flatmates', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchAPI(`/flatmates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchAPI(`/flatmates/${id}`, { method: 'DELETE' }),
}

// Maintenance Cycles API
export const cyclesAPI = {
  getAll: () => fetchAPI('/cycles'),
  getById: (id) => fetchAPI(`/cycles/${id}`),
  create: (data) => fetchAPI('/cycles', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchAPI(`/cycles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchAPI(`/cycles/${id}`, { method: 'DELETE' }),
}

// Payments API
export const paymentsAPI = {
  getAll: () => fetchAPI('/payments'),
  getById: (id) => fetchAPI(`/payments/${id}`),
  getByCycle: (cycleId) => fetchAPI(`/payments?cycleId=${cycleId}`),
  create: (data) => fetchAPI('/payments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchAPI(`/payments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchAPI(`/payments/${id}`, { method: 'DELETE' }),
}

// Reminders API
export const remindersAPI = {
  getSettings: () => fetchAPI('/reminders/settings'),
  updateSettings: (data) => fetchAPI('/reminders/settings', { method: 'PUT', body: JSON.stringify(data) }),
  getLogs: () => fetchAPI('/reminders/logs'),
  sendReminders: () => fetchAPI('/reminders/send', { method: 'POST' }),
}

// Defaulters API
export const defaultersAPI = {
  getByCycle: (cycleId) => fetchAPI(`/defaulters/${cycleId}`),
  sendReminders: (cycleId, data) => fetchAPI(`/defaulters/${cycleId}/send-reminders`, { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  updateLateFee: (cycleId, lateFeePercent) => fetchAPI(`/defaulters/${cycleId}/late-fee`, { 
    method: 'PATCH', 
    body: JSON.stringify({ lateFeePercent }) 
  }),
}

// Dashboard Stats (derived from other APIs)
export const dashboardAPI = {
  getStats: async () => {
    const [flats, flatmates, cycles, payments] = await Promise.all([
      flatsAPI.getAll(),
      flatmatesAPI.getAll(),
      cyclesAPI.getAll(),
      paymentsAPI.getAll(),
    ])

    return {
      flats,
      flatmates,
      cycles,
      payments,
    }
  },
}

export default {
  flats: flatsAPI,
  flatmates: flatmatesAPI,
  cycles: cyclesAPI,
  payments: paymentsAPI,
  reminders: remindersAPI,
  defaulters: defaultersAPI,
  dashboard: dashboardAPI,
}
