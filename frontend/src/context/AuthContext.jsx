import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getMe, login as apiLogin, register as apiRegister } from '../api/index.js'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('taskflow_token'))
  const [loading, setLoading] = useState(true)

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('taskflow_token')
      if (storedToken) {
        try {
          const { data } = await getMe()
          setUser(data)
          setToken(storedToken)
        } catch {
          localStorage.removeItem('taskflow_token')
          setToken(null)
          setUser(null)
        }
      }
      setLoading(false)
    }
    restoreSession()
  }, [])

  const login = useCallback(async (email, password) => {
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)

    const { data } = await apiLogin(formData)
    const accessToken = data.access_token
    localStorage.setItem('taskflow_token', accessToken)
    setToken(accessToken)

    const meRes = await getMe()
    setUser(meRes.data)
    return meRes.data
  }, [])

  const register = useCallback(async (userData) => {
    const { data } = await apiRegister(userData)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('taskflow_token')
    setToken(null)
    setUser(null)
    window.location.href = '/login'
  }, [])

  const isAdmin = useCallback(() => user?.role === 'admin', [user])
  const isManager = useCallback(
    () => user?.role === 'manager' || user?.role === 'admin',
    [user]
  )

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, register, logout, isAdmin, isManager }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
