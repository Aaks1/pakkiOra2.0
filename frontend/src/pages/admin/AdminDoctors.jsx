import { useCallback, useEffect, useState } from 'react'

import { Link } from 'react-router-dom'

import AdminPageHeader from '../../components/admin/AdminPageHeader'

import CreateDoctorForm from '../../components/admin/CreateDoctorForm'

import DoctorAppointmentsSection from '../../components/admin/DoctorAppointmentsSection'

import DoctorSlotModal from '../../components/admin/DoctorSlotModal'

import EditDoctorModal from '../../components/admin/EditDoctorModal'

import Button from '../../components/ui/Button'

import Input from '../../components/ui/Input'

import Select from '../../components/ui/Select'

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

  const [statusFilter, setStatusFilter] = useState('')

  const [specializationFilter, setSpecializationFilter] = useState('')

  const [slotDoctor, setSlotDoctor] = useState(null)

  const [editDoctor, setEditDoctor] = useState(null)

  const [appointmentsDoctor, setAppointmentsDoctor] = useState(null)



  const loadDoctors = useCallback(async () => {

    setLoading(true)

    setError('')

    try {

      const params = {}

      if (searchQuery.trim()) params.search = searchQuery.trim()

      if (specializationFilter.trim()) params.specialization = specializationFilter.trim()

      if (statusFilter === 'active') params.is_active = true

      if (statusFilter === 'inactive') params.is_active = false

      const data = await listDoctors(params)

      setDoctors(normalizeList(data))

    } catch (err) {

      setError(getErrorMessage(err))

    } finally {

      setLoading(false)

    }

  }, [searchQuery, specializationFilter, statusFilter])



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

      if (appointmentsDoctor?.id === doctor.id) setAppointmentsDoctor(null)

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

        title="Doctor Management"

        subtitle="Create, edit, and manage doctor profiles and consultation schedules."

      />



      {error ? <p className="dashboard-feedback dashboard-feedback--error">{error}</p> : null}

      {success ? <p className="dashboard-feedback dashboard-feedback--success">{success}</p> : null}



      <section className="dashboard-grid">

        <CreateDoctorForm onCreated={handleCreated} />



        <article className="dashboard-card dashboard-card--span">

          <div className="admin-toolbar">

            <h2 className="dashboard-card__title admin-toolbar__title">All doctors</h2>

            <div className="admin-toolbar__controls admin-toolbar__controls--filters">

              <Input

                name="search"

                placeholder="Search by name…"

                value={searchInput}

                onChange={(e) => setSearchInput(e.target.value)}

                onKeyDown={(e) => e.key === 'Enter' && setSearchQuery(searchInput)}

                wrapperClassName="admin-toolbar__search"

              />

              <Input

                name="specialization"

                placeholder="Specialization…"

                value={specializationFilter}

                onChange={(e) => setSpecializationFilter(e.target.value)}

                wrapperClassName="admin-toolbar__search"

              />

              <Select name="status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} wrapperClassName="admin-filter-field">

                <option value="">All statuses</option>

                <option value="active">Active</option>

                <option value="inactive">Inactive</option>

              </Select>

              <Button variant="secondary" onClick={() => setSearchQuery(searchInput)}>Search</Button>

            </div>

          </div>



          <div className="dashboard-table-wrap">

            <table className="dashboard-table">

              <thead>

                <tr>

                  <th>ID</th>

                  <th>Name</th>

                  <th>Specialization</th>

                  <th>Email</th>

                  <th>Phone</th>

                  <th>Schedule</th>

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

                      <td>{doctor.id}</td>

                      <td>{doctor.full_name || `${doctor.first_name} ${doctor.last_name}`}</td>

                      <td>{doctor.specialization || '—'}</td>

                      <td>{doctor.email || '—'}</td>

                      <td>{doctor.phone || '—'}</td>

                      <td>{doctor.time_slots || '09:00–17:00'}</td>

                      <td>

                        <span className={`status-badge ${doctor.is_active ? 'status-badge--active' : 'status-badge--inactive'}`}>

                          {doctor.is_active ? 'Active' : 'Inactive'}

                        </span>

                      </td>

                      <td>

                        <div className="dashboard-table__actions">

                          <Button variant="ghost" onClick={() => setEditDoctor(doctor)}>Edit</Button>

                          <Button variant="ghost" onClick={() => setSlotDoctor(doctor)}>Slots</Button>

                          <Button variant="ghost" onClick={() => { setAppointmentsDoctor(doctor); setSlotDoctor(null) }}>Bookings</Button>

                          <Button variant="ghost" loading={actionId === doctor.id} disabled={actionId === doctor.id} onClick={() => handleToggleActive(doctor)}>

                            {doctor.is_active ? 'Deactivate' : 'Activate'}

                          </Button>

                          <Button variant="ghost" disabled={actionId === doctor.id} onClick={() => handleDelete(doctor)}>Delete</Button>

                        </div>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>



          <p className="dashboard-card__hint">

            Manage slot availability on the <Link to="/admin/slots">Slots</Link> page.

          </p>

        </article>



        {appointmentsDoctor ? (

          <DoctorAppointmentsSection doctor={appointmentsDoctor} onClose={() => setAppointmentsDoctor(null)} />

        ) : null}

      </section>



      <DoctorSlotModal doctor={slotDoctor} onClose={() => setSlotDoctor(null)} onSaved={loadDoctors} />

      <EditDoctorModal doctor={editDoctor} onClose={() => setEditDoctor(null)} onSaved={loadDoctors} />

    </>

  )

}


