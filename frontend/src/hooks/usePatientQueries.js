import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getAppointmentHistory,
  getDoctorBookingContext,
  getDoctorSlots,
  listDoctors,
} from '../api/patient'

export function doctorsQueryKey(search = '') {
  return ['doctors', search]
}

export function useDoctors(search = '') {
  return useQuery({
    queryKey: doctorsQueryKey(search),
    queryFn: () => listDoctors(search ? { search } : {}),
  })
}

export function useAppointmentHistory() {
  return useQuery({
    queryKey: ['appointmentHistory'],
    queryFn: getAppointmentHistory,
  })
}

export function useDoctorBookingContext(doctorId) {
  return useQuery({
    queryKey: ['doctorBooking', doctorId],
    queryFn: () => getDoctorBookingContext(doctorId),
    enabled: Boolean(doctorId),
  })
}

export function useDoctorSlots(doctorId, date, enabled = true) {
  return useQuery({
    queryKey: ['doctorSlots', doctorId, date],
    queryFn: () => getDoctorSlots(doctorId, date),
    enabled: Boolean(doctorId && date && enabled),
    staleTime: 30 * 1000,
  })
}

export function useInvalidatePatientData() {
  const queryClient = useQueryClient()
  return {
    invalidateHistory: () => queryClient.invalidateQueries({ queryKey: ['appointmentHistory'] }),
    invalidateDoctors: () => queryClient.invalidateQueries({ queryKey: ['doctors'] }),
    invalidateDoctorBooking: (doctorId) => {
      queryClient.invalidateQueries({ queryKey: ['doctorBooking', doctorId] })
      queryClient.invalidateQueries({ queryKey: ['doctorSlots', doctorId] })
    },
  }
}

export function prefetchPatientData(queryClient) {
  // Warm cache when the patient layout mounts.
  return Promise.all([
    queryClient.prefetchQuery({
      queryKey: doctorsQueryKey(''),
      queryFn: () => listDoctors(),
    }),
    queryClient.prefetchQuery({
      queryKey: ['appointmentHistory'],
      queryFn: getAppointmentHistory,
    }),
  ])
}
