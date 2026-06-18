import { useCallback, useEffect, useState } from 'react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import CreateDoctorForm from '../../components/admin/CreateDoctorForm'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import { deleteDoctor, listDoctors, toggleDoctorActive } from '../../api/admin'
import { getErrorMessage } from '../../api/axios'
import { normalizeList } from '../../utils/apiList'

export default function AdminDoctors() {
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [actionId, setActionId] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const loadDoctors = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (searchQuery.trim()) params.search = searchQuery.trim()
      const data = await listDoctors(params)
      setDoctors(normalizeList(data))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [searchQuery])

  useEffect(() => {
    loadDoctors()
  }, [loadDoctors])

  const handleToggleActive = async (doctor) => {
    setActionId(doctor.id)
    setError('')
    setSuccess('')
    try {
      const result = await toggleDoctorActive(doctor.id)
      setSuccess(`Doctor ${result.is_active ? 'activated' : 'deactivated'} successfully.`)
      await loadDoctors()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async (doctor) => {
    const name = doctor.full_name || `${doctor.first_name} ${doctor.last_name}`
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return

    setActionId(doctor.id)
    setError('')
    setSuccess('')
    try {
      await deleteDoctor(doctor.id)
      setSuccess('Doctor deleted successfully.')
      await loadDoctors()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setActionId(null)
    }
  }

  const handleCreated = async () => {
    setSuccess('Doctor created successfully.')
    await loadDoctors()
  }

  return (
    <>
      <AdminPageHeader
        title="Doctors"
        subtitle="Create doctor profiles and manage availability."
      />

      {error ? <p className="dashboard-feedback dashboard-feedback--error">{error}</p> : null}
      {success ? <p className="dashboard-feedback dashboard-feedback--success">{success}</p> : null}

      <section className="dashboard-grid">
        <CreateDoctorForm onCreated={handleCreated} />

        <article className="dashboard-card dashboard-card--span">
          <div className="admin-toolbar">
            <h2 className="dashboard-card__title admin-toolbar__title">Doctor directory</h2>
            <div className="admin-toolbar__controls">
              <Input
                name="search"
                placeholder="Search doctors…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setSearchQuery(searchInput)}
                wrapperClassName="admin-toolbar__search"
              />
              <Button variant="secondary" onClick={() => setSearchQuery(searchInput)}>Search</Button>
            </div>
          </div>

          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Specialization</th>
                  <th>Department</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Experience</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="dashboard-table__empty">
                      {loading ? 'Loading doctors…' : 'No doctors found.'}
                    </td>
                  </tr>
                ) : (
                  doctors.map((doctor) => (
                    <tr key={doctor.id}>
                      <td>{doctor.full_name || `${doctor.first_name} ${doctor.last_name}`}</td>
                      <td>{doctor.specialization || '—'}</td>
                      <td>{doctor.department || '—'}</td>
                      <td>{doctor.email || '—'}</td>
                      <td>{doctor.phone || '—'}</td>
                      <td>{doctor.experience_years != null ? `${doctor.experience_years} yrs` : '—'}</td>
                      <td>
                        <span className={`status-badge ${doctor.is_active ? 'status-badge--active' : 'status-badge--inactive'}`}>
                          {doctor.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="dashboard-table__actions">
                          <Button
                            variant="ghost"
                            loading={actionId === doctor.id}
                            disabled={actionId === doctor.id}
                            onClick={() => handleToggleActive(doctor)}
                          >
                            {doctor.is_active ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="ghost"
                            disabled={actionId === doctor.id}
                            onClick={() => handleDelete(doctor)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </>
  )
}
