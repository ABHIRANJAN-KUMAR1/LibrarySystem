import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(false)

  const login = async (username, password, captcha_id, captcha_answer) => {
    setLoading(true)
    try {
      const { data } = await api.post('/login/', { username, password, captcha_id, captcha_answer })
      localStorage.setItem('access_token', data.tokens.access)
      localStorage.setItem('refresh_token', data.tokens.refresh)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      toast.success(`Welcome back, ${data.user.username}! 👋`)
      return { success: true, user: data.user }
    } catch (err) {
      let msg = 'Login failed. Please try again.';
      if (err.response?.data?.error) {
        msg = err.response.data.error;
      } else if (err.response?.data?.captcha) {
        msg = err.response.data.captcha[0];
      }
      toast.error(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }

  const register = async (formData) => {
    setLoading(true)
    try {
      const { data } = await api.post('/register/', formData)
      localStorage.setItem('access_token', data.tokens.access)
      localStorage.setItem('refresh_token', data.tokens.refresh)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      toast.success('Account created successfully! 🎉')
      return { success: true, user: data.user }
    } catch (err) {
      const errors = err.response?.data
      const msg = typeof errors === 'object'
        ? Object.values(errors).flat().join(', ')
        : 'Registration failed.'
      toast.error(msg)
      return { success: false, error: msg }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token')
      await api.post('/logout/', { refresh: refreshToken })
    } catch { /* silent */ }
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
    setUser(null)
    toast.success('Logged out successfully.')
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
