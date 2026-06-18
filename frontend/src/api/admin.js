import api, { unwrap } from './axios'
import { withListParams } from '../utils/apiList'

export async function getAdminStats() {
  const res = await api.get('/admin/dashboard/')
  return unwrap(res)
}

export async function listAdminStaff(params) {
  const res = await api.get('/admin/staff/', { params: withListParams(params) })
  return unwrap(res)
}

export async function createAdminStaff(payload) {
  const res = await api.post('/admin/staff/', payload)
  return unwrap(res)
}

export async function updateAdminStaff(id, payload) {
  const res = await api.patch(`/admin/staff/${id}/`, payload)
  return unwrap(res)
}

export async function listAdminPatients(params) {
  const res = await api.get('/admin/patients/', { params: withListParams(params) })
  return unwrap(res)
}

export async function getAdminPatient(id) {
  const res = await api.get(`/admin/patients/${id}/`)
  return unwrap(res)
}

export async function updateAdminPatient(id, payload) {
  const res = await api.patch(`/admin/patients/${id}/`, payload)
  return unwrap(res)
}

export async function togglePatientActive(id) {
  const res = await api.post(`/admin/patients/${id}/toggle-active/`)
  return unwrap(res)
}

export async function deletePatient(id) {
  const res = await api.delete(`/admin/patients/${id}/`)
  return unwrap(res)
}

export async function listAdminAppointments(params) {
  const res = await api.get('/admin/appointments/', { params: withListParams(params) })
  return unwrap(res)
}

export async function updateAdminAppointment(id, payload) {
  const res = await api.patch(`/admin/appointments/${id}/`, payload)
  return unwrap(res)
}

export async function cancelAdminAppointment(id) {
  const res = await api.post(`/admin/appointments/${id}/cancel/`)
  return unwrap(res)
}

export async function listDoctors(params) {
  const res = await api.get('/doctors/', { params: withListParams(params) })
  return unwrap(res)
}

export async function createDoctor(payload) {
  const res = await api.post('/doctors/', payload)
  return unwrap(res)
}

export async function updateDoctor(id, payload) {
  const res = await api.patch(`/doctors/${id}/`, payload)
  return unwrap(res)
}

export async function deleteDoctor(id) {
  const res = await api.delete(`/doctors/${id}/`)
  return unwrap(res)
}

export async function toggleDoctorActive(id) {
  const res = await api.post(`/doctors/${id}/toggle-active/`)
  return unwrap(res)
}

export async function getDoctorSlotConfig(id) {
  const res = await api.get(`/doctors/${id}/slot-config/`)
  return unwrap(res)
}

export async function updateDoctorSlotConfig(id, payload) {
  const res = await api.patch(`/doctors/${id}/slot-config/`, payload)
  return unwrap(res)
}

export async function getDoctorSlots(id, date) {
  const res = await api.get(`/doctors/${id}/slots/`, { params: { date } })
  return unwrap(res)
}

export async function getDoctorSlotOverview(id, date) {
  const res = await api.get(`/doctors/${id}/slot-overview/`, { params: { date } })
  return unwrap(res)
}

export async function getDoctorAvailableDates(id, days = 30) {
  const res = await api.get(`/doctors/${id}/available-dates/`, { params: { days } })
  return unwrap(res)
}
