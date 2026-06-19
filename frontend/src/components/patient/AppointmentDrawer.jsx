import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { getErrorMessage } from '../../api/axios'
import {
  cancelAppointment,
  getDoctorAvailableDates,
  getDoctorSlots,
  rescheduleAppointment,
} from '../../api/patient'
import DateSlider from './DateSlider'
import SlotPicker from './SlotPicker'
import { doctorName } from '../../utils/patientFormat'
import { usePatientUI } from '../../hooks/usePatientUI'

export default function AppointmentDrawer({ appointment, onClose, onSaved }) {
  const { refreshNotifications } = usePatientUI()
  const [dates, setDates] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const doctorId = appointment?.doctor?.id

  useEffect(() => {
    if (!appointment) {
      setSelectedDate('')
      setSelectedSlot(null)
      setSlots([])
      setDates([])
      setError('')
      return
    }
    setSelectedDate(appointment.date)
    setSelectedSlot(null)
    setError('')
  }, [appointment?.id])

  useEffect(() => {
    if (!doctorId || !appointment) return
    getDoctorAvailableDates(doctorId).then(setDates).catch(() => setDates([]))
  }, [doctorId, appointment?.id])

  useEffect(() => {
    if (!doctorId || !selectedDate) return
    getDoctorSlots(doctorId, selectedDate)
      .then((d) => setSlots(d?.slots ?? []))
      .catch(() => setSlots([]))
  }, [doctorId, selectedDate])

  useEffect(() => {
    if (!appointment) return
    if (selectedDate !== appointment.date) {
      setSelectedSlot(null)
    }
  }, [selectedDate, appointment?.date])

  useEffect(() => {
    if (!appointment || !slots.length) return
    const currentTime = String(appointment.start_time).slice(0, 5)
    const match = slots.find((s) => String(s.start_time).slice(0, 5) === currentTime)
    if (match && selectedDate === appointment.date) {
      setSelectedSlot(match)
    }
  }, [appointment, slots, selectedDate])

  const handleSave = async () => {
    if (!selectedDate || !selectedSlot) return
    setLoading(true)
    setError('')
    try {
      await rescheduleAppointment(appointment.id, {
        date: selectedDate,
        start_time: selectedSlot.start_time,
      })
      refreshNotifications()
      onSaved?.()
      onClose?.()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async () => {
    if (!window.confirm('Cancel this appointment?')) return
    setLoading(true)
    try {
      await cancelAppointment(appointment.id)
      refreshNotifications()
      onSaved?.()
      onClose?.()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {appointment && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-[450px] flex-col border-l border-slate-200 bg-white"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Edit Appointment</h2>
              <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
              <p className="mb-6 text-sm text-slate-500">{doctorName(appointment.doctor)}</p>

              <h3 className="mb-3 text-sm font-semibold text-slate-700">Date</h3>
              <DateSlider dates={dates} selected={selectedDate} onSelect={setSelectedDate} />

              <h3 className="mb-3 mt-6 text-sm font-semibold text-slate-700">Time</h3>
              <SlotPicker
                slots={slots}
                selected={selectedSlot}
                onSelect={setSelectedSlot}
              />
            </div>

            <div className="flex gap-3 border-t border-slate-200 p-6">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 rounded-md border border-red-200 py-3 text-sm font-medium text-red-600 transition-colors hover:border-red-300"
              >
                Cancel appt
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={loading || !selectedSlot}
                className="flex-1 rounded-md bg-blue-600 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Saving…' : 'Save'}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
