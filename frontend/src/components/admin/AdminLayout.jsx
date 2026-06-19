import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import AdminSidebar from './AdminSidebar'
import AdminTopbar from './AdminTopbar'
import '../styles/admin.css'

function formatTopbarDate() {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar fixed inset-y-0 left-0 z-40 hidden lg:flex lg:flex-col">
        <AdminSidebar username={user?.username} onLogout={handleLogout} onNavigate={closeSidebar} />
      </aside>

      <AnimatePresence>
        {sidebarOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={closeSidebar}
            />
            <motion.aside
              className="admin-sidebar fixed inset-y-0 left-0 z-50 flex lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            >
              <AdminSidebar username={user?.username} onLogout={handleLogout} onNavigate={closeSidebar} />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <div className="lg:ml-64">
        <AdminTopbar onMenuOpen={() => setSidebarOpen(true)} dateLabel={formatTopbarDate()} />
        <main className="admin-main">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
