import { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import PatientUIProvider from '../../context/PatientUIProvider'
import PatientSidebar from './PatientSidebar'
import PatientNavbar from './PatientNavbar'
import { prefetchPatientData } from '../../hooks/usePatientQueries'
import '../styles/patient.css'

export default function PatientLayout() {
  const queryClient = useQueryClient()

  useEffect(() => {
    prefetchPatientData(queryClient)
  }, [queryClient])

  return (
    <PatientUIProvider>
      <div className="patient-shell font-sans text-sm text-slate-600">
        <PatientSidebar />
        <div className="lg:pl-[288px]">
          <PatientNavbar />
          <main className="px-4 py-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </PatientUIProvider>
  )
}
