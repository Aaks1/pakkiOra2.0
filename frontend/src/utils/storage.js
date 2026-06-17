const ACCESS_KEY = 'pakkiora_access'
const REFRESH_KEY = 'pakkiora_refresh'
const USER_KEY = 'pakkiora_user'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}

export function getUser() {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

export function setTokens(access, refresh) {
  localStorage.setItem(ACCESS_KEY, access)
  if (refresh) localStorage.setItem(REFRESH_KEY, refresh)
}

export function setUser(user) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function saveAuth({ user, tokens }) {
  setTokens(tokens.access, tokens.refresh)
  setUser(user)
}

export function clearAuth() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
}

export function isAdmin(user) {
  return user?.is_staff || user?.role === 'admin'
}
