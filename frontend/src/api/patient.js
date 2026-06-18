import api, { unwrap } from './axios'
import { normalizeList, withListParams } from '../utils/apiList'

export async function listDoctors(params) {
  const res = await api.get('/doctors/', { params: withListParams({ is_active: true, ...params }) })
  return normalizeList(unwrap(res))
}

export async function getDoctorAvailableDates(doctorId, days = 30) {
  const res = await api.get(`/doctors/${doctorId}/available-dates/`, { params: { days } })
  return unwrap(res)?.dates ?? []
}

export async function getDoctorSlots(doctorId, date) {
  const res = await api.get(`/doctors/${doctorId}/slots/`, { params: { date } })
  return unwrap(res)
}

export async function bookAppointment(payload) {
  const res = await api.post('/appointments/', payload)
  return unwrap(res)
}

export async function getAppointmentHistory() {
  const res = await api.get('/appointments/history/')
  return unwrap(res)
}

export async function cancelAppointment(id) {
  const res = await api.post(`/appointments/${id}/cancel/`)
  return unwrap(res)
}

export async function rescheduleAppointment(id, payload) {
  const res = await api.patch(`/appointments/${id}/`, payload)
  return unwrap(res)
}

export async function getProfile() {
  const res = await api.get('/profile/')
  return unwrap(res)
}

export async function updateProfile(payload) {
  const res = await api.patch('/profile/', payload)
  return unwrap(res)
}

export async function changePassword(payload) {
  const res = await api.post('/profile/change-password/', payload)
  return unwrap(res)
}
