import { useCallback, useEffect, useState } from 'react'
import { cancelAppointment, getAppointmentHistory } from '../../api/patient'
import { getErrorMessage } from '../../api/axios'
import AppointmentCard from './AppointmentCard'
import AppointmentDrawer from './AppointmentDrawer'
import PageLoader from './PageLoader'
import { usePatientUI } from '../../hooks/usePatientUI'

export default function PatientAppointments() {
  const { refreshNotifications } = usePatientUI()
  const [history, setHistory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [drawerAppt, setDrawerAppt] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setHistory(await getAppointmentHistory())
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleCancel = async (appointment) => {
    if (!window.confirm('Cancel this appointment?')) return
    try {
      await cancelAppointment(appointment.id)
      refreshNotifications()
      await load()
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  if (loading) return <PageLoader label="Loading appointments..." />

  const upcoming = history?.upcoming || []
  const past = [...(history?.completed || []), ...(history?.cancelled || [])]

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="text-xl font-semibold text-slate-800">Appointments</h1>
        <p className="mt-1 text-sm text-slate-600">Upcoming and past visits</p>
      </header>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <section>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-slate-400">Upcoming</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {upcoming.length === 0 ? (
            <p className="text-sm text-slate-500">No upcoming appointments.</p>
          ) : (
            upcoming.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                showActions
                onEdit={setDrawerAppt}
                onCancel={handleCancel}
              />
            ))
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-slate-400">Past</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {past.length === 0 ? (
            <p className="text-sm text-slate-500">No past appointments.</p>
          ) : (
            past.map((appt) => <AppointmentCard key={appt.id} appointment={appt} />)
          )}
        </div>
      </section>

      <AppointmentDrawer appointment={drawerAppt} onClose={() => setDrawerAppt(null)} onSaved={load} />
    </div>
  )
}
