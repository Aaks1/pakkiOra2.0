import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookCheck,
  CalendarDays,
  CircleCheck,
  CircleX,
  Clock,
  ShieldCheck,
  Stethoscope,
  Users,
} from 'lucide-react'
import AdminPageHeader from './AdminPageHeader'
import { AdminError } from './AdminFeedback'
import { getAdminStats } from '../../api/admin'
import { getErrorMessage } from '../../api/axios'

function formatToday() {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.4, 0, 0.2, 1] },
  }),
}

function StatCard({ icon: Icon, label, value, trend, red, index }) {
  return (
    <motion.div
      className="admin-stat-card"
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -2 }}
    >
      <div className="flex items-center justify-between">
        <div className="admin-stat-card__icon-wrap">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <span className="admin-stat-card__label">{label}</span>
      </div>
      <p className={`admin-stat-card__value${red ? ' admin-stat-card__value--alert' : ''}`}>{value}</p>
      {trend ? <p className="admin-stat-card__trend">{trend}</p> : null}
    </motion.div>
  )
}

const QUICK_ACTIONS = [
  { to: '/admin/doctors', label: 'Doctors', Icon: Stethoscope },
  { to: '/admin/slots', label: 'Slots', Icon: Clock },
  { to: '/admin/appointments', label: 'Appointments', Icon: CalendarDays },
  { to: '/admin/admins', label: 'Admins', Icon: ShieldCheck },
  { to: '/admin/patients', label: 'Patients', Icon: Users },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadStats = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAdminStats()
      setStats(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStats()
  }, [loadStats])

  const statCards = [
    { icon: Stethoscope, label: 'Total doctors', value: stats?.total_doctors ?? 0 },
    { icon: Users, label: 'Total patients', value: stats?.total_users ?? 0 },
    { icon: CalendarDays, label: 'Total appointments', value: stats?.total_appointments ?? 0 },
    { icon: Clock, label: "Today's appts", value: stats?.todays_appointments ?? 0 },
    { icon: BookCheck, label: 'Booked', value: stats?.booked_appointments ?? 0 },
    { icon: CircleCheck, label: 'Completed', value: stats?.completed_appointments ?? 0 },
    { icon: CircleX, label: 'Cancelled', value: stats?.cancelled_appointments ?? 0, red: true },
  ]

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        subtitle="PakkiOra health platform overview"
        right={<span className="text-sm text-slate-400">{formatToday()}</span>}
      />

      <AdminError message={error} />

      {loading ? (
        <div className="admin-skeleton" aria-busy="true" aria-label="Loading dashboard">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="admin-skeleton__card" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statCards.map((card, index) => (
              <StatCard key={card.label} {...card} index={index} />
            ))}
          </div>

          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.35 }}
          >
            <p className="admin-section-label">Quick actions</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_ACTIONS.map(({ to, label, Icon }) => (
                <Link key={to} to={to} className="admin-quick-action">
                  <Icon className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  {label}
                </Link>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}
