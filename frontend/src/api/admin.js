import api, { unwrap } from './axios'

export async function getAdminStats() {
  const res = await api.get('/admin/dashboard/')
  return unwrap(res)
}

export async function listAdminStaff() {
  const res = await api.get('/admin/staff/')
  return unwrap(res)
}

export async function createAdminStaff(payload) {
  const res = await api.post('/admin/staff/', payload)
  return unwrap(res)
}

export async function listAdminPatients(params) {
  const res = await api.get('/admin/patients/', { params })
  return unwrap(res)
}

export async function getAdminPatient(id) {
  const res = await api.get(`/admin/patients/${id}/`)
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
  const res = await api.get('/admin/appointments/', { params })
  return unwrap(res)
}

export async function cancelAdminAppointment(id) {
  const res = await api.post(`/admin/appointments/${id}/cancel/`)
  return unwrap(res)
}

export async function listDoctors(params) {
  const res = await api.get('/doctors/', { params })
  return unwrap(res)
}

export async function createDoctor(payload) {
  const res = await api.post('/doctors/', payload)
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
