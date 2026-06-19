import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listDoctors } from '../../api/patient'
import { getErrorMessage } from '../../api/axios'
import DoctorCard from './DoctorCard'
import DoctorFilters from './DoctorFilters'
import PageLoader from './PageLoader'
import { usePatientUI } from '../../hooks/usePatientUI'

export default function PatientDoctors() {
  const { search } = usePatientUI()
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('all')

  useEffect(() => {
    let active = true
    setLoading(true)
    listDoctors(search ? { search } : {})
      .then((data) => {
        if (active) setDoctors(data)
      })
      .catch((err) => {
        if (active) setError(getErrorMessage(err))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [search])

  const filtered = tab === 'all'
    ? doctors
    : doctors.filter((d) => d.specialization?.toLowerCase().includes(tab))

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Doctors</h1>
          <p className="mt-1 text-sm text-slate-600">Browse available specialists</p>
        </div>
        <Link to="/patient/book" className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
          Book now
        </Link>
      </header>

      <DoctorFilters activeTab={tab} onTabChange={setTab} />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {loading ? <PageLoader label="Loading doctors..." /> : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.length === 0 ? (
            <p className="text-sm text-slate-500">No doctors found.</p>
          ) : (
            filtered.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} />)
          )}
        </div>
      )}
    </div>
  )
}
