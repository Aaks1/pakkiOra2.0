import { useCallback, useEffect, useState } from 'react'
import { Calendar, ClipboardList, Search, Stethoscope, Sparkles } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getErrorMessage } from '../../api/axios'
import { cancelAppointment, getAppointmentHistory } from '../../api/patient'
import AppointmentDrawer from './AppointmentDrawer'
import NextAppointmentTicket from './NextAppointmentTicket'
import PageLoader from './PageLoader'
import PatientButton, { PatientFadeIn, PatientQuickLink, PatientStagger } from './PatientButton'
import { greeting } from '../../utils/patientFormat'
import { usePatientUI } from '../../hooks/usePatientUI'

const QUICK_ACTIONS = [
  { to: '/patient/book', label: 'Book appointment', Icon: Calendar, tone: 'blue' },
  { to: '/patient/doctors', label: 'Find doctors', Icon: Search, tone: 'teal' },
  { to: '/patient/appointments', label: 'My appointments', Icon: ClipboardList, tone: 'violet' },
  { to: '/patient/profile', label: 'My profile', Icon: Stethoscope, tone: 'rose' },
]

export default function PatientOverview() {
  const { user } = useAuth()
  const { refreshNotifications } = usePatientUI()
  const [history, setHistory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [drawerAppt, setDrawerAppt] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getAppointmentHistory()
      setHistory(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const nextAppt = history?.upcoming?.[0]
  const stats = [
    { label: 'Upcoming', value: history?.upcoming?.length ?? 0, tone: 'blue' },
    { label: 'Completed', value: history?.completed?.length ?? 0, tone: 'teal' },
    { label: 'Past visits', value: history?.past?.length ?? 0, tone: 'violet' },
    { label: 'Cancelled', value: history?.cancelled?.length ?? 0, tone: 'amber' },
  ]

  const handleCancel = async (appointment) => {
    if (!window.confirm('Cancel this appointment?')) return
    setCancelling(true)
    try {
      await cancelAppointment(appointment.id)
      refreshNotifications()
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setCancelling(false)
    }
  }

  if (loading) return <PageLoader label="Loading dashboard..." />

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PatientFadeIn>
        <section className="patient-hero">
          <div className="patient-hero__content">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-blue-100">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  Your care hub
                </p>
                <h1 className="patient-hero__title">
                  {greeting(user?.first_name || user?.username)}
                </h1>
                <p className="patient-hero__text">
                  Book visits, track appointments, and manage your health — all in one calm, simple place.
                </p>
              </div>
              <PatientButton to="/patient/book" variant="ghost-white" className="hidden shrink-0 sm:inline-flex">
                Book now
              </PatientButton>
            </div>
          </div>
        </section>
      </PatientFadeIn>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <PatientFadeIn delay={0.08}>
        <section>
          <h2 className="patient-section-title">At a glance</h2>
          <div className="patient-stat-grid">
            {stats.map((stat) => (
              <article key={stat.label} className={`patient-stat patient-stat--${stat.tone}`}>
                <p className="patient-stat__value">{stat.value}</p>
                <p className="patient-stat__label">{stat.label}</p>
              </article>
            ))}
          </div>
        </section>
      </PatientFadeIn>

      <PatientFadeIn delay={0.14}>
        {nextAppt ? (
          <NextAppointmentTicket
            appointment={nextAppt}
            onReschedule={() => setDrawerAppt(nextAppt)}
            onCancel={() => handleCancel(nextAppt)}
            cancelling={cancelling}
          />
        ) : (
          <div className="patient-empty-card">
            <p className="text-sm text-slate-600">No upcoming appointments yet.</p>
            <div className="mt-4">
              <PatientButton to="/patient/book">Book your first appointment</PatientButton>
            </div>
          </div>
        )}
      </PatientFadeIn>

      <PatientFadeIn delay={0.2}>
        <section>
          <h2 className="patient-section-title">Quick actions</h2>
          <PatientStagger className="patient-quick-grid">
            {QUICK_ACTIONS.map(({ to, label, Icon, tone }) => (
              <PatientQuickLink key={to} to={to} icon={Icon} iconTone={tone}>
                {label}
              </PatientQuickLink>
            ))}
          </PatientStagger>
        </section>
      </PatientFadeIn>

      <AppointmentDrawer
        appointment={drawerAppt}
        onClose={() => setDrawerAppt(null)}
        onSaved={load}
      />
    </div>
  )
}
