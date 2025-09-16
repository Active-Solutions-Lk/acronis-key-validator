'use client'

import { useState, useEffect } from 'react'
import LoginDialog from '@/components/admin/LoginDialog'
import ValidateUser from '@/app/actions/validateUser'
import { useRouter } from 'next/navigation'
import { checkAuth } from '@/app/actions/checkAuth'

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [showAlert, setShowAlert] = useState(false)
  const [alertName, setAlertName] = useState('')
  const [alertPassword, setAlertPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const router = useRouter()

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        // First check localStorage flag
        const localStorageAuth = localStorage.getItem('dashboardAuthenticated')
      //  console.log('LocalStorage auth flag:', localStorageAuth)
        
        if (localStorageAuth === 'true') {
          // Verify with server that the session is still valid
          const { isAuthenticated } = await checkAuth()
        //  console.log('Server auth check:', isAuthenticated)
          if (isAuthenticated) {
            setShowAlert(false)
            setAuthChecked(true)
            return
          } else {
            // Session expired, remove the flag
            localStorage.removeItem('dashboardAuthenticated')
          }
        }
        
        // If no localStorage flag or session expired, check with server
        const { isAuthenticated } = await checkAuth()
       // console.log('Server auth check (no localStorage):', isAuthenticated)
        setShowAlert(!isAuthenticated)
      } catch (error) {
        console.error('Error checking authentication:', error)
        setShowAlert(true)
      } finally {
        setAuthChecked(true)
      }
    }
    
    checkAuthentication()
  }, [])

  const handleOkClick = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    if (!alertName || !alertPassword) {
      setMessage('Username and password are required')
      return
    }

    try {
      setLoading(true)
      const formData = {
        user_name: alertName,
        password: alertPassword
      }

      const response = await ValidateUser(formData)
   //   console.log('ValidateUser response:', response)
      
      if (response?.status === 200) {
        setMessage('User validated successfully')
        setLoading(false)
        setShowAlert(false)
        // Set localStorage flag to indicate authentication
        localStorage.setItem('dashboardAuthenticated', 'true')
      } else {
        setLoading(false)
        setMessage(response?.message || 'Validation failed')
      }
    } catch (error) {
    //  console.log('Error validating user:', error)
      setLoading(false)
      setMessage('Error validating credentials')
    }
  }

  // Show nothing until we've checked auth state to avoid hydration issues
  if (!authChecked) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

 // console.log('Rendering AuthWrapper, showAlert:', showAlert)
  return (
    <>
      {showAlert && (
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
      )}
      {!showAlert && children}
    </>
  )
}