import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Stethoscope,
  Users,
  Calendar,
  Bell,
  User,
  LogOut,
  Menu,
} from 'lucide-react'
import BrandLogo from '../brand/BrandLogo'
import ProfileAvatar from '../ui/ProfileAvatar'
import { useAuth } from '../../context/AuthContext'
import { usePatientUI } from '../../hooks/usePatientUI'
import { PATIENT_NAV, patientDisplayName, patientInitials } from './patientNav'
import PatientButton from './PatientButton'

const NAV_ICONS = {
  stethoscope: Stethoscope,
  users: Users,
  calendar: Calendar,
  bell: Bell,
  user: User,
}

function SidebarInner({ onNavigate }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <>
      <div className="patient-sidebar__brand px-5 py-4">
        <BrandLogo variant="compact" to="/patient/dashboard" className="patient-sidebar__logo" />
        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-blue-600/80">Patient Portal</p>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4" aria-label="Patient navigation">
        {PATIENT_NAV.map((item) => {
          const Icon = NAV_ICONS[item.icon]
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) =>
                `patient-nav-link flex items-center gap-3 px-3 py-2.5 text-sm ${
                  isActive ? 'patient-nav-link--active' : 'text-slate-600'
                }`
              }
            >
              {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3 px-1">
          <ProfileAvatar
            initials={patientInitials(user)}
            size="sm"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-800">{patientDisplayName(user)}</p>
            <p className="text-xs text-slate-500">Patient account</p>
          </div>
        </div>
        <div className="mt-3">
          <PatientButton
            variant="secondary"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </PatientButton>
        </div>
      </div>
    </>
  )
}

export default function PatientSidebar() {
  const { sidebarOpen, setSidebarOpen } = usePatientUI()
  const close = () => setSidebarOpen(false)

  return (
    <>
      <aside className="patient-sidebar fixed left-0 top-0 z-40 hidden h-screen w-[288px] flex-col lg:flex">
        <SidebarInner onNavigate={close} />
      </aside>

      <AnimatePresence>
        {sidebarOpen ? (
          <>
            <motion.button
              type="button"
              className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              aria-label="Close menu"
            />
            <motion.aside
              className="patient-sidebar fixed left-0 top-0 z-50 flex h-screen w-[288px] flex-col lg:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            >
              <SidebarInner onNavigate={close} />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  )
}

export function PatientSidebarMenuButton() {
  const { setSidebarOpen } = usePatientUI()
  return (
    <button
      type="button"
      className="patient-icon-btn lg:hidden"
      onClick={() => setSidebarOpen(true)}
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  )
}
