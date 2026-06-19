import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { bookAppointment, getDoctor, getDoctorAvailableDates, getDoctorSlots, listDoctors } from '../../api/patient'
import { getErrorMessage } from '../../api/axios'
import { usePatientUI } from '../../hooks/usePatientUI'
import BookingStepProgress from './BookingStepProgress'
import BookingSummary from './BookingSummary'
import DateSlider from './DateSlider'
import PageLoader from './PageLoader'
import SlotPicker from './SlotPicker'

export default function PatientBook() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { refreshNotifications } = usePatientUI()
  const [step, setStep] = useState(1)
  const [doctors, setDoctors] = useState([])
  const [doctorId, setDoctorId] = useState('')
  const [doctor, setDoctor] = useState(null)
  const [dates, setDates] = useState([])
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState([])
  const [slot, setSlot] = useState(null)
  const [symptoms, setSymptoms] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const preselectedDoctor = searchParams.get('doctor')
    listDoctors()
      .then((data) => {
        setDoctors(data)
        if (preselectedDoctor && data.some((d) => String(d.id) === preselectedDoctor)) {
          setDoctorId(preselectedDoctor)
          setStep(2)
        }
      })
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [searchParams])

  useEffect(() => {
    if (!doctorId) return
    getDoctor(doctorId).then(setDoctor).catch(() => setDoctor(null))
    getDoctorAvailableDates(doctorId, 30)
      .then((d) => {
        setDates(d)
        if (d.length) setDate(d[0])
      })
      .catch(() => setDates([]))
  }, [doctorId])

  useEffect(() => {
    if (!doctorId || !date) return
    getDoctorSlots(doctorId, date)
      .then((data) => setSlots(data?.slots || []))
      .catch(() => setSlots([]))
  }, [doctorId, date])

  const handleBook = async () => {
    if (!doctorId || !date || !slot) return
    setSubmitting(true)
    setError('')
    try {
      const result = await bookAppointment({
        doctor_id: Number(doctorId),
        date,
        start_time: slot.start_time,
        symptoms: symptoms.trim(),
      })
      if (result?.id) {
        sessionStorage.setItem('pakkiora_last_booking_id', String(result.id))
      }
      refreshNotifications()
      navigate('/patient/book/success', { state: { doctor, date, slot, symptoms } })
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoader label="Loading booking..." />

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-xl font-semibold text-slate-800">Book appointment</h1>
        <p className="mt-1 text-sm text-slate-600">Choose a doctor, date, and time slot</p>
      </header>

      <BookingStepProgress step={step} />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {step === 1 && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">Select doctor</label>
          <select
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
          >
            <option value="">Choose a doctor</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.full_name || `${d.first_name} ${d.last_name}`}</option>
            ))}
          </select>
          <button
            type="button"
            disabled={!doctorId}
            onClick={() => setStep(2)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <DateSlider dates={dates} selected={date} onSelect={setDate} />
          <SlotPicker slots={slots} selected={slot} onSelect={setSlot} />
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(1)} className="rounded-md border border-slate-200 px-4 py-2 text-sm">Back</button>
            <button type="button" disabled={!slot} onClick={() => setStep(3)} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50">Continue</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <BookingSummary doctor={doctor} date={date} slot={slot} symptoms={symptoms} />
          <label className="block text-sm font-medium text-slate-700">Symptoms (optional)</label>
          <textarea
            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
            rows={3}
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
          />
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(2)} className="rounded-md border border-slate-200 px-4 py-2 text-sm">Back</button>
            <button type="button" disabled={submitting} onClick={handleBook} className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50">
              {submitting ? 'Booking…' : 'Confirm booking'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
