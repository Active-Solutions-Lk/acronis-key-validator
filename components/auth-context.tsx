'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import ValidateUser from '@/app/actions/validateUser'

interface AuthContextType {
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
  loading: boolean
  authChecked: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    // Check if user is already authenticated
    const storedAuth = localStorage.getItem('isAuthenticated')
    if (storedAuth === 'true') {
      setIsAuthenticated(true)
    }
    setAuthChecked(true)
  }, [])

  const login = async (username: string, password: string) => {
    setLoading(true)
    try {
      const formData = {
        user_name: username,
        password: password
      }

      const result = await ValidateUser(formData)
      
      if (result?.data) {
        // Authentication successful
        setIsAuthenticated(true)
        localStorage.setItem('isAuthenticated', 'true')
        return { success: true }
      } else {
        // Authentication failed
        return { success: false, message: result?.message || 'Invalid username or password' }
      }
    } catch (error) {
      return { success: false, message: 'An error occurred during authentication' }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setIsAuthenticated(false)
    localStorage.removeItem('isAuthenticated')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading, authChecked }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}