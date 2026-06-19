import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { usePatientUI } from '../../hooks/usePatientUI'
import NotificationDropdown from './NotificationDropdown'
import { PatientSidebarMenuButton } from './PatientSidebar'
import { patientInitials } from './patientNav'

export default function PatientNavbar() {
  const { user } = useAuth()
  const { search, setSearch } = usePatientUI()

  return (
    <header className="patient-navbar sticky top-0 z-30">
      <div className="flex h-14 items-center gap-4 px-4 lg:px-6">
        <PatientSidebarMenuButton />

        <div className="relative max-w-md flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search doctors…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <NotificationDropdown />

          <Link
            to="/patient/profile"
            className="patient-avatar"
            title={user?.first_name || user?.username || 'Profile'}
          >
            {patientInitials(user)}
          </Link>
        </div>
      </div>
    </header>
  )
}
