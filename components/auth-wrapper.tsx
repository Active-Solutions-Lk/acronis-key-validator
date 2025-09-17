'use client'

import { useState } from 'react'
import LoginDialog from "@/components/admin/LoginDialog"
import { useAuth } from '@/components/auth-context'

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, login, loading, authChecked } = useAuth()
  // const [_showLoginDialog, _setShowLoginDialog] = useState(true)
  const [alertName, setAlertName] = useState('')
  const [alertPassword, setAlertPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleOkClick = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')

    const result = await login(alertName, alertPassword)
    
    if (!result.success) {
      setMessage(result.message || 'Invalid username or password')
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

  if (!isAuthenticated) {
    return (
      <LoginDialog
        showAlert={true}
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

  return children
}