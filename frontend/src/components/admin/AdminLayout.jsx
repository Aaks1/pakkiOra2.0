import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import BrandLogo from '../brand/BrandLogo'
import Button from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { ADMIN_NAV } from './adminNav'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <div className="admin-shell">
      <div
        className={`admin-shell__backdrop ${sidebarOpen ? 'admin-shell__backdrop--open' : ''}`}
        onClick={closeSidebar}
        aria-hidden="true"
      />

      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__brand">
          <BrandLogo variant="compact" />
        </div>

        <nav className="admin-sidebar__nav" aria-label="Admin navigation">
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
              }
              onClick={closeSidebar}
            >
              <i className={`fas ${item.icon}`} aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <p className="admin-sidebar__user">{user?.username || 'Admin'}</p>
          <Link to="/" className="admin-sidebar__footer-link" onClick={closeSidebar}>
            <i className="fas fa-home" aria-hidden="true" />
            Landing page
          </Link>
          <Button variant="ghost" className="admin-sidebar__logout" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </aside>

      <div className="admin-shell__main">
        <header className="admin-topbar">
          <button
            type="button"
            className="admin-topbar__menu"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation menu"
          >
            <i className="fas fa-bars" aria-hidden="true" />
          </button>
          <p className="admin-topbar__title">Admin Panel</p>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
