import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// User credentials (in real app, this would be in database)
const USERS = {
  admin: {
    username: 'Admin',
    password: 'Vedam@1234',
    role: 'admin',
    displayName: 'Admin User'
  },
  general: {
    username: 'General',
    password: 'Vedam1234',
    role: 'general',
    displayName: 'General User'
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('axisFinanceUser')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('axisFinanceUser')
      }
    }
    setLoading(false)
  }, [])

  const login = (username, password) => {
    // Find user
    const userKey = Object.keys(USERS).find(
      key => USERS[key].username.toLowerCase() === username.toLowerCase()
    )

    if (!userKey) {
      throw new Error('Invalid username or password')
    }

    const foundUser = USERS[userKey]

    if (foundUser.password !== password) {
      throw new Error('Invalid username or password')
    }

    // Create user session
    const userSession = {
      username: foundUser.username,
      role: foundUser.role,
      displayName: foundUser.displayName
    }

    setUser(userSession)
    localStorage.setItem('axisFinanceUser', JSON.stringify(userSession))

    return userSession
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('axisFinanceUser')
  }

  const isAdmin = () => {
    return user?.role === 'admin'
  }

  const isGeneral = () => {
    return user?.role === 'general'
  }

  const canEdit = () => {
    return user?.role === 'admin'
  }

  const value = {
    user,
    login,
    logout,
    isAdmin,
    isGeneral,
    canEdit,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
