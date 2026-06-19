import {
  BarChart2,
  CalendarDays,
  Clock,
  ShieldCheck,
  Stethoscope,
  Users,
} from 'lucide-react'

export const ADMIN_NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', Icon: BarChart2 },
  { to: '/admin/doctors', label: 'Doctors', Icon: Stethoscope },
  { to: '/admin/appointments', label: 'Appointments', Icon: CalendarDays },
  { to: '/admin/slots', label: 'Slots', Icon: Clock },
  { to: '/admin/patients', label: 'Patients', Icon: Users },
  { to: '/admin/admins', label: 'Admins', Icon: ShieldCheck },
]
