import { useCallback, useEffect, useState } from 'react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import DoctorSlotModal from '../../components/admin/DoctorSlotModal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { getDoctorSlotOverview, listDoctors } from '../../api/admin'
import { getErrorMessage } from '../../api/axios'
import { normalizeList } from '../../utils/apiList'

function slotStatusClass(status) {
  return `slot-chip slot-chip--${status || 'disabled'}`
}

export default function AdminSlots() {
  const [doctors, setDoctors] = useState([])
  const [doctorId, setDoctorId] = useState('')
  const [date, setDate] = useState('')
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [configDoctor, setConfigDoctor] = useState(null)

  useEffect(() => {
    listDoctors()
      .then((data) => {
        const list = normalizeList(data)
        setDoctors(list)
        if (list.length) setDoctorId(String(list[0].id))
      })
      .catch(() => setDoctors([]))
  }, [])

  const loadOverview = useCallback(async () => {
    if (!doctorId || !date) {
      setSlots([])
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await getDoctorSlotOverview(doctorId, date)
      setSlots(data?.slots || [])
    } catch (err) {
      setError(getErrorMessage(err))
      setSlots([])
    } finally {
      setLoading(false)
    }
  }, [doctorId, date])

  useEffect(() => {
    if (doctorId && date) loadOverview()
  }, [doctorId, date, loadOverview])

  const selectedDoctor = doctors.find((d) => String(d.id) === doctorId)

  return (
    <>
      <AdminPageHeader
        title="Appointment Slots"
        subtitle="View available, booked, and cancelled slots. Configure schedules per doctor."
      />

      {error ? <p className="dashboard-feedback dashboard-feedback--error">{error}</p> : null}

      <article className="dashboard-card">
        <div className="admin-toolbar">
          <h2 className="dashboard-card__title admin-toolbar__title">Slot overview</h2>
          <div className="admin-toolbar__controls admin-toolbar__controls--filters">
            <Select label="Doctor" name="doctor" value={doctorId} onChange={(e) => setDoctorId(e.target.value)} wrapperClassName="admin-filter-field">
              <option value="">Select doctor</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>{d.full_name || `${d.first_name} ${d.last_name}`}</option>
              ))}
            </Select>
            <Input label="Date" name="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} wrapperClassName="admin-filter-field" />
            {selectedDoctor ? (
              <Button variant="secondary" onClick={() => setConfigDoctor(selectedDoctor)}>Configure schedule</Button>
            ) : null}
          </div>
        </div>

        <div className="slot-legend">
          <span className={slotStatusClass('available')}>Available</span>
          <span className={slotStatusClass('booked')}>Booked</span>
          <span className={slotStatusClass('cancelled')}>Cancelled</span>
          <span className={slotStatusClass('disabled')}>Disabled</span>
        </div>

        {loading ? (
          <p className="dashboard-card__hint">Loading slots…</p>
        ) : !date ? (
          <p className="dashboard-card__hint">Select a doctor and date to view slots.</p>
        ) : slots.length === 0 ? (
          <p className="dashboard-card__hint">No slots for this date.</p>
        ) : (
          <div className="slot-preview__chips">
            {slots.map((slot) => (
              <span key={slot.start_time} className={slotStatusClass(slot.slot_status)} title={slot.patient_name || slot.slot_status}>
                {slot.start_display}
                {slot.patient_name ? ` — ${slot.patient_name}` : ''}
              </span>
            ))}
          </div>
        )}
      </article>

      <DoctorSlotModal
        doctor={configDoctor}
        onClose={() => setConfigDoctor(null)}
        onSaved={loadOverview}
      />
    </>
  )
}
