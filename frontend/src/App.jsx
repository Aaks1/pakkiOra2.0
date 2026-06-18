import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import PatientDashboard from './pages/dashboard/PatientDashboard'
import AdminLayout from './components/admin/AdminLayout'
import AdminOverview from './pages/admin/AdminOverview'
import AdminPatients from './pages/admin/AdminPatients'
import AdminStaff from './pages/admin/AdminStaff'
import AdminAppointments from './pages/admin/AdminAppointments'
import AdminDoctors from './pages/admin/AdminDoctors'
import AdminSlots from './pages/admin/AdminSlots'

function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin } = useAuth()

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (requireAdmin && !isAdmin) return <Navigate to="/patient" replace />
  if (!requireAdmin && isAdmin) return <Navigate to="/admin/dashboard" replace />

  return children
}

function AuthOnlyRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth()

  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/patient'} replace />
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
                <AdminLayout />
              </ProtectedRoute>
            )}
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminOverview />} />
            <Route path="patients" element={<AdminPatients />} />
            <Route path="users" element={<Navigate to="/admin/patients" replace />} />
            <Route path="admins" element={<AdminStaff />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="doctors" element={<AdminDoctors />} />
            <Route path="slots" element={<AdminSlots />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
