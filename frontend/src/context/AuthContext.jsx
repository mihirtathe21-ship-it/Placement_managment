import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  const setAuthToken = (token) => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      localStorage.setItem('token', token)
    } else {
      delete api.defaults.headers.common['Authorization']
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) { setLoading(false); return }
    setAuthToken(token)
    try {
      const res = await api.get('/auth/me')
      setUser(res.data.user)
    } catch {
      setAuthToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadUser() }, [loadUser])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token, user, requiresVerification } = res.data

    // ── Unverified user: backend returns 403 with requiresVerification flag ──
    // This is caught by the catch block in HomePage's onSubmit,
    // so we just re-throw with the flag attached for the caller to handle.
    if (requiresVerification) {
      const err = new Error('Email not verified')
      err.requiresVerification = true
      err.email = email
      throw err
    }

    setAuthToken(token)
    setUser(user)
    localStorage.setItem('user', JSON.stringify(user))
    return user
  }

  // ── register: no longer returns token — just signals verification needed ──
  const register = async (formData) => {
    const res = await api.post('/auth/register', formData)
    // Returns { requiresVerification: true, email, message } — no token yet
    return res.data
  }

  const logout = () => {
    setAuthToken(null)
    setUser(null)
    toast.success('Logged out successfully')
  }

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedFields }
      localStorage.setItem('user', JSON.stringify(merged))
      return merged
    })
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}