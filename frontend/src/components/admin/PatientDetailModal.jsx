import { useEffect, useState } from 'react'
import Button from '../ui/Button'
import { getAdminPatient } from '../../api/admin'
import { getErrorMessage } from '../../api/axios'

function formatTime(time) {
  if (!time) return '—'
  return String(time).slice(0, 5)
}

export default function PatientDetailModal({ patientId, onClose }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!patientId) return undefined

    let active = true
    setLoading(true)
    setError('')

    getAdminPatient(patientId)
      .then((data) => {
        if (active) setDetail(data)
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [patientId])

  if (!patientId) return null

  const profile = detail?.profile

  return (
    <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="patient-detail-title">
      <button type="button" className="admin-modal__backdrop" onClick={onClose} aria-label="Close" />
      <div className="admin-modal__panel">
        <header className="admin-modal__header">
          <h2 id="patient-detail-title" className="admin-modal__title">Patient details</h2>
          <button type="button" className="admin-modal__close" onClick={onClose} aria-label="Close">
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        </header>

        <div className="admin-modal__body">
          {loading ? <p className="admin-modal__loading">Loading patient details…</p> : null}
          {error ? <p className="dashboard-feedback dashboard-feedback--error">{error}</p> : null}

          {!loading && !error && detail ? (
            <>
              <section className="admin-detail-grid">
                <div>
                  <p className="admin-detail__label">Username</p>
                  <p className="admin-detail__value">{detail.username}</p>
                </div>
                <div>
                  <p className="admin-detail__label">Email</p>
                  <p className="admin-detail__value">{detail.email || '—'}</p>
                </div>
                <div>
                  <p className="admin-detail__label">Name</p>
                  <p className="admin-detail__value">
                    {`${detail.first_name || ''} ${detail.last_name || ''}`.trim() || '—'}
                  </p>
                </div>
                <div>
                  <p className="admin-detail__label">Status</p>
                  <p className="admin-detail__value">{detail.is_active ? 'Active' : 'Inactive'}</p>
                </div>
                {profile ? (
                  <>
                    <div>
                      <p className="admin-detail__label">Phone</p>
                      <p className="admin-detail__value">{profile.phone || '—'}</p>
                    </div>
                    <div>
                      <p className="admin-detail__label">Date of birth</p>
                      <p className="admin-detail__value">{profile.date_of_birth || '—'}</p>
                    </div>
                    <div>
                      <p className="admin-detail__label">Blood group</p>
                      <p className="admin-detail__value">{profile.blood_group || '—'}</p>
                    </div>
                    <div>
                      <p className="admin-detail__label">Address</p>
                      <p className="admin-detail__value">{profile.address || '—'}</p>
                    </div>
                    <div className="admin-detail-grid__span">
                      <p className="admin-detail__label">Allergies</p>
                      <p className="admin-detail__value">{profile.allergies || '—'}</p>
                    </div>
                    <div className="admin-detail-grid__span">
                      <p className="admin-detail__label">Medical history</p>
                      <p className="admin-detail__value">{profile.medical_history || '—'}</p>
                    </div>
                  </>
                ) : null}
              </section>

              <h3 className="admin-modal__section-title">Appointments</h3>
              <div className="dashboard-table-wrap">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Doctor</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!detail.appointments?.length ? (
                      <tr>
                        <td colSpan={4} className="dashboard-table__empty">No appointments.</td>
                      </tr>
                    ) : (
                      detail.appointments.map((appt) => (
                        <tr key={appt.id}>
                          <td>{appt.date}</td>
                          <td>{formatTime(appt.start_time)}</td>
                          <td>{appt.doctor?.full_name || '—'}</td>
                          <td>{appt.status}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </div>

        <footer className="admin-modal__footer">
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </footer>
      </div>
    </div>
  )
}
