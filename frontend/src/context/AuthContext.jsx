import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/auth'
import { queryClient } from '../lib/queryClient'
import {
  clearAuth,
  getAccessToken,
  getStoredUser,
  setStoredUser,
  setTokens,
} from '../utils/storage'

const AuthContext = createContext(null)

function isAdminUser(user) {
  return Boolean(user?.is_staff || user?.is_superuser || user?.role === 'admin')
}

function normalizeUser(user) {
  if (!user) return null
  const role = user.role || (user.is_staff || user.is_superuser ? 'admin' : user.is_patient ? 'patient' : 'user')
  return { ...user, role }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = getStoredUser()
    return stored && getAccessToken() ? normalizeUser(stored) : null
  })
  const [bootstrapping, setBootstrapping] = useState(true)

  // Rehydrate session from localStorage on first load.
  useEffect(() => {
    const stored = getStoredUser()
    if (stored && getAccessToken()) {
      setUser(normalizeUser(stored))
    } else if (!getAccessToken()) {
      clearAuth()
      setUser(null)
    }
    setBootstrapping(false)
  }, [])

  const persistSession = useCallback((sessionUser, tokens) => {
    const nextUser = normalizeUser(sessionUser)
    setTokens(tokens?.access, tokens?.refresh)
    setStoredUser(nextUser)
    setUser(nextUser)
    return nextUser
  }, [])

  const login = useCallback(async (username, password) => {
    const data = await authApi.login(username, password)
    const sessionUser = data?.user
    const tokens = data?.tokens
    if (!sessionUser?.id || !tokens?.access) {
      throw new Error('Invalid login response from server.')
    }
    return persistSession(sessionUser, tokens)
  }, [persistSession])

  const register = useCallback(async (payload) => {
    const data = await authApi.register(payload)
    const sessionUser = data?.user
    const tokens = data?.tokens
    if (!sessionUser?.id || !tokens?.access) {
      throw new Error('Invalid registration response from server.')
    }
    return persistSession(sessionUser, tokens)
  }, [persistSession])

  const logout = useCallback(async () => {
    try {
      await authApi.logout()
    } finally {
      clearAuth()
      setUser(null)
      queryClient.clear()  // drop cached patient data after sign-out
    }
  }, [])

  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      if (!prev) return prev
      const next = normalizeUser({ ...prev, ...patch })
      setStoredUser(next)
      return next
    })
  }, [])

  const value = useMemo(() => ({
    user,
    bootstrapping,
    isAuthenticated: Boolean(user && getAccessToken()),
    isAdmin: isAdminUser(user),
    login,
    register,
    logout,
    updateUser,
  }), [user, bootstrapping, login, register, logout, updateUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
