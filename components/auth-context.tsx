'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import ValidateUser from '@/app/actions/validateUser'
import { logout as serverLogout } from '@/app/actions/logout'
import { checkAuth } from '@/app/actions/checkAuth'

interface AuthContextType {
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string; user?: any }>
  logout: () => Promise<void>
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
    const checkAuthentication = async () => {
      try {
        const { isAuthenticated: authStatus } = await checkAuth()
        setIsAuthenticated(authStatus)
      } catch (error) {
        console.error('Error checking authentication:', error)
        setIsAuthenticated(false)
      } finally {
        setAuthChecked(true)
      }
    }
    
    checkAuthentication()
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
        // Store user details in localStorage
        const userData = {
          user_name: result.data.user_name,
          email: result.data.email,
          avatar: '/avatars/default.png'
        }
        localStorage.setItem('currentUser', JSON.stringify(userData))
        return { success: true, user: result.data }
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

  const logout = async () => {
    try {
      await serverLogout() // This will clear the session cookie
      setIsAuthenticated(false)
      // Clear localStorage items
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('currentUser')
    } catch (error) {
      console.error('Error during logout:', error)
      // Even if server logout fails, clear client state
      setIsAuthenticated(false)
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('currentUser')
    }
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