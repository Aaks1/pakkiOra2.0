import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../api/auth'
import { getUser, saveAuth, clearAuth, isAdmin } from '../utils/storage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setUser(getUser())
  }, [])

  const login = async (username, password) => {
    setLoading(true)
    try {
      const data = await apiLogin(username, password)
      saveAuth(data)
      setUser(data.user)
      return data.user
    } finally {
      setLoading(false)
    }
  }

  const register = async (formData) => {
    setLoading(true)
    try {
      const data = await apiRegister(formData)
      saveAuth(data)
      setUser(data.user)
      return data.user
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await apiLogout()
    clearAuth()
    setUser(null)
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: isAdmin(user),
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
