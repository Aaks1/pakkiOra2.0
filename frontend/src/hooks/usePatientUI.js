import { useContext } from 'react'
import { PatientUIContext } from '../context/patientUIContext'

export function usePatientUI() {
  const ctx = useContext(PatientUIContext)
  if (!ctx) throw new Error('usePatientUI must be used within PatientUIProvider')
  return ctx
}
