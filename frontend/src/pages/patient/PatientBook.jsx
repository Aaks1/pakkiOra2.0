import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Textarea from '../../components/ui/Textarea'
import Alert from '../../components/ui/Alert'
import { getErrorMessage } from '../../api/axios'
import {
  bookAppointment,
  getDoctorAvailableDates,
  getDoctorSlots,
  listDoctors,
} from '../../api/patient'

function doctorLabel(doctor) {
  return `Dr. ${doctor.first_name} ${doctor.last_name} — ${doctor.specialization || 'General'}`
}

export default function PatientBook() {
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [search, setSearch] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [dates, setDates] = useState([])
  const [selectedDate, setSelectedDate] = useState('')
  const [slots, setSlots] = useState([])
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [symptoms, setSymptoms] = useState('')
  const [loading, setLoading] = useState(true)
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadDoctors = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listDoctors(search ? { search } : {})
      setDoctors(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    loadDoctors()
  }, [loadDoctors])

  const selectDoctor = async (doctor) => {
    setSelectedDoctor(doctor)
    setSelectedDate('')
    setSelectedSlot(null)
    setSlots([])
    setDates([])
    setError('')
    try {
      const available = await getDoctorAvailableDates(doctor.id)
      setDates(available)
      if (!available.length) {
        setError('This doctor has no available dates in the next 30 days.')
      }
    } catch (err) {
      setError(getErrorMessage(err))
    }
  }

  const selectDate = async (date) => {
    setSelectedDate(date)
    setSelectedSlot(null)
    setSlotsLoading(true)
    setError('')
    try {
      const data = await getDoctorSlots(selectedDoctor.id, date)
      setSlots(data?.slots ?? [])
      if (!data?.slots?.length) {
        setError('No time slots available for this date. Pick another date.')
      }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSlotsLoading(false)
    }
  }

  const handleBook = async () => {
    if (!selectedDoctor || !selectedDate || !selectedSlot) return
    setSubmitting(true)
    setError('')
    setSuccess('')
    try {
      await bookAppointment({
        doctor_id: selectedDoctor.id,
        date: selectedDate,
        start_time: selectedSlot.start_time,
        symptoms: symptoms.trim(),
      })
      setSuccess('Appointment booked successfully!')
      setTimeout(() => navigate('/patient/appointments'), 1500)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Book appointment"
        subtitle="Choose a doctor, date, and time slot."
      />

      <Alert message={error} onClose={() => setError('')} />
      {success && <p className="dashboard-feedback dashboard-feedback--success">{success}</p>}

      <section className="dashboard-card" style={{ marginBottom: '1rem' }}>
        <h2 className="dashboard-card__title">1. Select doctor</h2>
        <div className="admin-toolbar" style={{ marginBottom: '1rem' }}>
          <Input
            label="Search doctors"
            name="search"
            placeholder="Name or specialization"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            wrapperClassName="admin-toolbar__search"
          />
          <Button variant="secondary" onClick={loadDoctors} loading={loading}>
            Search
          </Button>
        </div>
        {loading ? (
          <p className="dashboard-feedback">Loading doctors…</p>
        ) : doctors.length === 0 ? (
          <p className="dashboard-feedback">No doctors found.</p>
        ) : (
          <div className="patient-doctor-grid">
            {doctors.map((doctor) => (
              <button
                key={doctor.id}
                type="button"
                className={`patient-doctor-card ${selectedDoctor?.id === doctor.id ? 'patient-doctor-card--active' : ''}`}
                onClick={() => selectDoctor(doctor)}
              >
                <p className="patient-doctor-card__name">
                  Dr. {doctor.first_name} {doctor.last_name}
                </p>
                <p className="patient-doctor-card__meta">{doctor.specialization || 'General'}</p>
                {doctor.department && (
                  <p className="patient-doctor-card__meta">{doctor.department}</p>
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedDoctor && (
        <section className="dashboard-card" style={{ marginBottom: '1rem' }}>
          <h2 className="dashboard-card__title">2. Select date</h2>
          <p className="dashboard-feedback" style={{ marginBottom: '0.75rem' }}>
            {doctorLabel(selectedDoctor)}
          </p>
          {dates.length === 0 ? (
            <p className="dashboard-feedback">No dates available.</p>
          ) : (
            <div className="patient-slot-grid">
              {dates.map((date) => (
                <button
                  key={date}
                  type="button"
                  className={`patient-slot-chip ${selectedDate === date ? 'patient-slot-chip--active' : ''}`}
                  onClick={() => selectDate(date)}
                >
                  {date}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {selectedDate && (
        <section className="dashboard-card" style={{ marginBottom: '1rem' }}>
          <h2 className="dashboard-card__title">3. Select time</h2>
          {slotsLoading ? (
            <p className="dashboard-feedback">Loading slots…</p>
          ) : slots.length === 0 ? (
            <p className="dashboard-feedback">No slots for this date.</p>
          ) : (
            <div className="patient-slot-grid">
              {slots.map((slot) => (
                <button
                  key={slot.start_time}
                  type="button"
                  className={`patient-slot-chip ${selectedSlot?.start_time === slot.start_time ? 'patient-slot-chip--active' : ''}`}
                  onClick={() => setSelectedSlot(slot)}
                >
                  {slot.start_display || slot.start_time}
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {selectedSlot && (
        <section className="dashboard-card">
          <h2 className="dashboard-card__title">4. Confirm booking</h2>
          <p className="dashboard-feedback" style={{ marginBottom: '1rem' }}>
            {doctorLabel(selectedDoctor)} · {selectedDate} at{' '}
            {selectedSlot.start_display || selectedSlot.start_time}
          </p>
          <Textarea
            label="Symptoms (optional)"
            name="symptoms"
            placeholder="Briefly describe your symptoms"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={3}
          />
          <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
            <Button variant="primary" onClick={handleBook} loading={submitting}>
              Confirm booking
            </Button>
            <Button variant="ghost" onClick={() => navigate('/patient/dashboard')}>
              Cancel
            </Button>
          </div>
        </section>
      )}
    </>
  )
}
