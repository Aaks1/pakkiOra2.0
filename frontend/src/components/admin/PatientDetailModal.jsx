import { useEffect, useState } from 'react'
import AdminModal from './AdminModal'
import AdminStatus from './AdminStatus'
import ProfileAvatar from '../ui/ProfileAvatar'
import { getAdminPatient } from '../../api/admin'
import { getErrorMessage } from '../../api/axios'
import { patientDisplayName, patientInitials } from '../patient/patientNav'

function formatTime(time) {
  if (!time) return '—'
  return String(time).slice(0, 5)
}

export default function PatientDetailModal({ patientId, open, onClose }) {
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open || !patientId) return undefined

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
  }, [patientId, open])

  if (!patientId) return null

  const profile = detail?.profile

  return (
    <AdminModal
      open={open}
      title="Patient details"
      onClose={onClose}
      maxWidth="max-w-2xl"
      footer={(
        <button type="button" onClick={onClose} className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700">
          Close
        </button>
      )}
    >
      {loading ? <p className="text-sm text-slate-400">Loading...</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!loading && !error && detail ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
            <ProfileAvatar
              photoUrl={profile?.photo_url}
              initials={patientInitials(detail)}
              size="2xl"
            />
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-slate-900">
                {patientDisplayName(detail) || detail.username}
              </h3>
              <p className="text-sm text-slate-500">@{detail.username}</p>
              <div className="mt-2">
                <AdminStatus status={detail.is_active ? 'active' : 'inactive'} />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium text-slate-500">Email</p>
              <p className="text-sm text-slate-900">{detail.email || '—'}</p>
            </div>
            {profile ? (
              <>
                <div>
                  <p className="text-xs font-medium text-slate-500">Phone</p>
                  <p className="text-sm text-slate-900">{profile.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Date of birth</p>
                  <p className="text-sm text-slate-900">{profile.date_of_birth || '—'}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Blood group</p>
                  <p className="text-sm text-slate-900">{profile.blood_group || '—'}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium text-slate-500">Address</p>
                  <p className="text-sm text-slate-900">{profile.address || '—'}</p>
                </div>
              </>
            ) : null}
          </div>

          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">Appointments</h3>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Time</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Doctor</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {!detail.appointments?.length ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-sm text-slate-400">No appointments.</td>
                    </tr>
                  ) : (
                    detail.appointments.map((appt) => (
                      <tr key={appt.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-2 text-slate-700">{appt.date}</td>
                        <td className="px-4 py-2 text-slate-700">{formatTime(appt.start_time)}</td>
                        <td className="px-4 py-2 text-slate-700">{appt.doctor?.full_name || '—'}</td>
                        <td className="px-4 py-2">
                          <AdminStatus status={appt.status?.toLowerCase()} label={appt.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </AdminModal>
  )
}
