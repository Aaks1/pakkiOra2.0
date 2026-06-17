import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import PatientDashboard from './pages/dashboard/PatientDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'

function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (requireAdmin && !isAdmin) return <Navigate to="/patient" replace />
  if (!requireAdmin && isAdmin) return <Navigate to="/admin" replace />

  return children
}

function AuthOnlyRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin' : '/patient'} replace />
  }

  return children
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<AuthOnlyRoute><Login /></AuthOnlyRoute>} />
          <Route path="/register" element={<AuthOnlyRoute><Register /></AuthOnlyRoute>} />
          <Route
            path="/patient"
            element={(
              <ProtectedRoute>
                <PatientDashboard />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/admin"
            element={(
              <ProtectedRoute requireAdmin>
                <AdminDashboard />
              </ProtectedRoute>
            )}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
