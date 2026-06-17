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
