import { NavLink } from 'react-router-dom'
import { Activity, ExternalLink, LogOut } from 'lucide-react'
import { ADMIN_NAV } from './adminNav'

export default function AdminSidebar({ username, onLogout, onNavigate }) {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="admin-sidebar__brand">
        <div className="admin-sidebar__brand-mark" aria-hidden="true">
          <Activity className="h-4 w-4" />
        </div>
        <div className="admin-sidebar__brand-text">
          <span className="admin-sidebar__brand-name">PakkiOra</span>
          <span className="admin-sidebar__brand-role">Admin Console</span>
        </div>
      </div>

      <p className="admin-sidebar__section-label">Navigation</p>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-1" aria-label="Admin navigation">
        {ADMIN_NAV.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `admin-nav-link${isActive ? ' admin-nav-link--active' : ''}`
            }
          >
            <Icon className="admin-nav-link__icon" aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar__footer">
        <p className="admin-sidebar__user">{username || 'Admin'}</p>
        <div className="mt-2 flex flex-col gap-1">
          <NavLink to="/" onClick={onNavigate} className="admin-sidebar__meta-link">
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
            View site
          </NavLink>
          <button type="button" onClick={onLogout} className="admin-sidebar__meta-link">
            <LogOut className="h-3 w-3" aria-hidden="true" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
