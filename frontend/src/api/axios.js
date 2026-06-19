import axios from 'axios'
import { getAccessToken, getRefreshToken, setTokens, clearAuth } from '../utils/storage'

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? '/api/v1' : 'http://127.0.0.1:8000/api/v1')

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = getRefreshToken()
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh/`, { refresh })
          const access = data.data?.access || data.access
          if (access) {
            setTokens(access, refresh)
            original.headers.Authorization = `Bearer ${access}`
            return api(original)
          }
        } catch {
          clearAuth()
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  }
)

export function unwrap(response) {
  return response.data?.data ?? response.data
}

export function getErrorMessage(error) {
  const data = error.response?.data
  if (data?.message && data.message !== 'Validation failed') return data.message
  if (data?.errors) {
    const nonField = data.errors.non_field_errors
    if (nonField) {
      const text = Array.isArray(nonField) ? nonField[0] : String(nonField)
      return text
    }
    const entries = Object.entries(data.errors)
    if (entries.length) {
      const [field, messages] = entries[0]
      const text = Array.isArray(messages) ? messages[0] : String(messages)
      if (field === 'non_field_errors') return text
      const label = field.replace(/_/g, ' ')
      return `${label.charAt(0).toUpperCase()}${label.slice(1)}: ${text}`
    }
  }
  if (data?.detail) return String(data.detail)
  if (!error.response) {
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      return import.meta.env.DEV
        ? 'Cannot reach the server. Start the backend with: python manage.py runserver (port 8000), then refresh.'
        : 'Cannot reach the server. Check that the API is running and try again in a moment.'
    }
  }
  return error.message || 'Something went wrong'
}

export default api
