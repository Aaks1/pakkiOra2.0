import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { getAppointment } from '../../api/patient'
import { getErrorMessage } from '../../api/axios'
import SuccessAnimation from './SuccessAnimation'
import { doctorName, formatDateLong, formatTime } from '../../utils/patientFormat'

const LAST_BOOKING_KEY = 'pakkiora_last_booking_id'

function buildSummaryFromAppointment(appt) {
  if (!appt) return null
  return {
    doctor: appt.doctor,
    date: appt.date,
    slot: { start_time: appt.start_time },
  }
}

export default function PatientBookingSuccess() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [summary, setSummary] = useState(state ? { doctor: state.doctor, date: state.date, slot: state.slot } : null)
  const [loading, setLoading] = useState(!state?.doctor)
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    if (state?.doctor && state?.date && state?.slot) {
      setSummary({ doctor: state.doctor, date: state.date, slot: state.slot })
      setLoading(false)
      setMissing(false)
      return undefined
    }

    const bookingId = sessionStorage.getItem(LAST_BOOKING_KEY)
    if (!bookingId) {
      setLoading(false)
      setMissing(true)
      return undefined
    }

    let active = true
    getAppointment(bookingId)
      .then((appt) => {
        if (active) {
          setSummary(buildSummaryFromAppointment(appt))
          setMissing(!appt)
        }
      })
      .catch(() => {
        if (active) {
          setSummary(null)
          setMissing(true)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [state])

  const { doctor, date, slot } = summary || {}

  if (!loading && missing) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <p className="text-sm text-slate-600">No booking details found.</p>
        <Link to="/patient/book" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          Book an appointment
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-12 text-center">
      <SuccessAnimation />
      <h1 className="mt-6 text-xl font-semibold text-slate-800">Appointment booked</h1>
      <p className="mt-2 text-sm text-slate-600">
        Your appointment has been confirmed. Check your notifications for details.
      </p>
      {loading ? (
        <p className="mt-6 text-sm text-slate-400">Loading booking details…</p>
      ) : doctor && date && slot ? (
        <dl className="mt-6 w-full rounded-lg border border-slate-200 bg-white p-4 text-left text-sm">
          <div className="flex justify-between gap-4 py-1">
            <dt className="text-slate-500">Doctor</dt>
            <dd className="font-medium text-slate-900">{doctorName(doctor)}</dd>
          </div>
          <div className="flex justify-between gap-4 py-1">
            <dt className="text-slate-500">Date</dt>
            <dd className="font-medium text-slate-900">{formatDateLong(date)}</dd>
          </div>
          <div className="flex justify-between gap-4 py-1">
            <dt className="text-slate-500">Time</dt>
            <dd className="font-medium text-slate-900">{formatTime(slot.start_time)}</dd>
          </div>
        </dl>
      ) : (
        <p className="mt-6 text-sm text-slate-500">Booking confirmed. View your appointments for full details.</p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/patient/notifications"
          className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          View notification
        </Link>
        <Link
          to="/patient/appointments"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          View appointments
        </Link>
        <button
          type="button"
          onClick={() => navigate('/patient/dashboard')}
          className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Dashboard
        </button>
      </div>
    </div>
  )
}
