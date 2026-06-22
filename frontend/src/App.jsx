import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Landing } from './components/landing'
import { Login, Register } from './components/auth'
import {
  PatientLayout,
  PatientOverview,
  PatientBook,
  PatientDoctors,
  PatientBookingSuccess,
  PatientNotifications,
  PatientAppointments,
  PatientProfile,
} from './components/patient'
import {
  AdminLayout,
  AdminDashboard,
  AdminPatients,
  AdminStaff,
  AdminAppointments,
  AdminDoctors,
  AdminSlots,
} from './components/admin'

/** Gate routes by JWT session; admins and patients use separate dashboards. */
function ProtectedRoute({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin, bootstrapping } = useAuth()

  if (bootstrapping) return <p className="p-8 text-sm text-slate-400">Loading...</p>
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (requireAdmin && !isAdmin) return <Navigate to="/patient/dashboard" replace />
  if (!requireAdmin && isAdmin) return <Navigate to="/admin/dashboard" replace />

  return children
}

/** Redirect signed-in users away from login/register. */
function AuthOnlyRoute({ children }) {
  const { isAuthenticated, isAdmin, bootstrapping } = useAuth()

  if (bootstrapping) return <p className="p-8 text-sm text-slate-400">Loading...</p>
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? '/admin/dashboard' : '/patient/dashboard'} replace />
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
                <PatientLayout />
              </ProtectedRoute>
            )}
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<PatientOverview />} />
            <Route path="doctors" element={<PatientDoctors />} />
            <Route path="book" element={<PatientBook />} />
            <Route path="book/success" element={<PatientBookingSuccess />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="notifications" element={<PatientNotifications />} />
            <Route path="profile" element={<PatientProfile />} />
          </Route>
          <Route
            path="/admin"
            element={(
              <ProtectedRoute requireAdmin>
                <AdminLayout />
              </ProtectedRoute>
            )}
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
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
