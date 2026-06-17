import api, { unwrap } from './axios'

export async function login(username, password) {
  const res = await api.post('/auth/login/', { username, password })
  return unwrap(res)
}

export async function register(form) {
  const res = await api.post('/auth/register/', form)
  return unwrap(res)
}

export async function logout() {
  const refresh = localStorage.getItem('pakkiora_refresh')
  try {
    await api.post('/auth/logout/', { refresh })
  } catch {
    // ignore
  }
}
