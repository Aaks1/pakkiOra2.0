import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getErrorMessage } from '../../api/axios'
import { useDoctors } from '../../hooks/usePatientQueries'
import { usePatientUI } from '../../hooks/usePatientUI'
import DoctorCard from './DoctorCard'
import DoctorFilters from './DoctorFilters'
import PageLoader from './PageLoader'

export default function PatientDoctors() {
  const { search } = usePatientUI()
  const { data: doctors = [], isLoading, isFetching, error } = useDoctors(search)
  const [tab, setTab] = useState('all')

  const filtered = tab === 'all'
    ? doctors
    : doctors.filter((d) => d.specialization?.toLowerCase().includes(tab))

  const showLoader = isLoading && doctors.length === 0

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

      {error ? <p className="text-sm text-red-600">{getErrorMessage(error)}</p> : null}
      {showLoader ? <PageLoader label="Loading doctors..." /> : (
        <>
          {isFetching && doctors.length > 0 ? (
            <p className="text-xs text-slate-400">Updating list…</p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.length === 0 ? (
              <p className="text-sm text-slate-500">No doctors found.</p>
            ) : (
              filtered.map((doctor) => <DoctorCard key={doctor.id} doctor={doctor} />)
            )}
          </div>
        </>
      )}
    </div>
  )
}
