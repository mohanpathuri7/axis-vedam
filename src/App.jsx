import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Flatmates from './pages/Flatmates'
import Maintenance from './pages/Maintenance'
import Reminders from './pages/Reminders'
import Defaulters from './pages/Defaulters'
import Import from './pages/Import'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/flatmates" element={<Flatmates />} />
                    <Route path="/maintenance" element={<Maintenance />} />
                    <Route path="/defaulters" element={<Defaulters />} />
                    <Route path="/reminders" element={<Reminders />} />
                    <Route path="/import" element={<Import />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App


