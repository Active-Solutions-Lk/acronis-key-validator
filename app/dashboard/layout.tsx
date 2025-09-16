'use client'

import { useState, useEffect } from 'react'
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { Toaster } from "@/components/ui/sonner"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { UserProvider } from "@/hooks/usePermissions"
import LoginDialog from '@/components/admin/LoginDialog'
import { checkAuth } from '@/app/actions/checkAuth'
import { AuthProvider, useAuth } from '@/components/auth-context'

// Define the Admin type based on the Prisma schema
interface Admin {
  id: number;
  user_name: string;
  password: string;
  email: string;
  sync: number;
  department: string;
  privilege: string;
  created_at: Date;
  updated_at: Date;
  // Allow additional properties with unknown type
  [key: string]: unknown;
}

// Create a component that uses the auth context
function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, login, loading, authChecked } = useAuth()
  const [showAlert, setShowAlert] = useState(false)
  const [alertName, setAlertName] = useState('')
  const [alertPassword, setAlertPassword] = useState('')
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<Admin | null>(null)
  const [userChecked, setUserChecked] = useState(false)

  useEffect(() => {
    // console.log('DashboardContent - Auth state changed:', { authChecked, isAuthenticated, userChecked });
    if (authChecked) {
      setShowAlert(!isAuthenticated)
      // If user is authenticated, fetch user data
      if (isAuthenticated && !userChecked) {
        fetchUserData()
      }
    }
  }, [authChecked, isAuthenticated, userChecked])

  const fetchUserData = async () => {
    try {
      // console.log('DashboardContent - Fetching user data...');
      const { user: userData } = await checkAuth()
      // console.log('DashboardContent - Fetched user data:', userData)
      // console.log('Fetched user data:', userData)
      setUser(userData as Admin | null)
      setUserChecked(true)
    } catch (error) {
      console.error('Error fetching user data:', error)
      setUserChecked(true)
    }
  }

  const handleOkClick = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    if (!alertName || !alertPassword) {
      setMessage('Username and password are required')
      return
    }

    try {
      const result = await login(alertName, alertPassword)
      
      if (result.success) {
        setMessage('User validated successfully')
        setShowAlert(false)
        // Set user data after successful login
        // console.log('Login result user:', result.user)
        // console.log('Login result user:', result.user)
        setUser(result.user as Admin | null)
        setUserChecked(true)
      } else {
        setMessage(result.message || 'Validation failed')
      }
    } catch (error) {
      // console.log('Error validating user:', error)
      setMessage('Error validating credentials')
    }
  }

  // Show nothing until we've checked auth state
  if (!authChecked || (isAuthenticated && !userChecked)) {
    // console.log('DashboardContent - Still checking auth state...');
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Show login dialog if not authenticated
  if (showAlert) {
    // console.log('DashboardContent - Showing login dialog...');
    return (
      <LoginDialog
        showAlert={showAlert}
        alertName={alertName}
        setAlertName={setAlertName}
        alertPassword={alertPassword}
        setAlertPassword={setAlertPassword}
        message={message}
        setMessage={setMessage}
        loading={loading}
        handleOkClick={handleOkClick}
      />
    )
  }

  // Show dashboard content if authenticated
  // console.log('DashboardContent - Rendering dashboard with user:', user)
  // console.log('Rendering dashboard with user:', user)
  return (
    <UserProvider user={user}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              {children}
              <Toaster />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </UserProvider>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <DashboardContent>
        {children}
      </DashboardContent>
    </AuthProvider>
  )
}