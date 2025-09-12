'use client'

import { useState, useEffect } from 'react'
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import LoginDialog from "@/components/admin/LoginDialog"
import ValidateUser from '@/app/actions/validateUser'
import data from "./data.json"

export default function Page() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showLoginDialog, setShowLoginDialog] = useState(true)
  const [alertName, setAlertName] = useState('')
  const [alertPassword, setAlertPassword] = useState('')
  const [message, setMessage] = useState('')
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

  const handleOkClick = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const formData = {
        user_name: alertName,
        password: alertPassword
      }

      const result = await ValidateUser(formData)
      
      if (result?.data) {
        // Authentication successful
        setIsAuthenticated(true)
        localStorage.setItem('isAuthenticated', 'true')
        
        // Store user details in localStorage
        const userData = {
          name: result.data.user_name,
          email: result.data.email,
          avatar: '/avatars/default.png' // You can customize this
        }
        localStorage.setItem('currentUser', JSON.stringify(userData))
        
        setMessage('')
      } else {
        // Authentication failed
        setMessage(result?.message || 'Invalid username or password')
      }
    } catch (error) {
      setMessage('An error occurred during authentication')
      console.error('Authentication error:', error)
    } finally {
      setLoading(false)
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
        showAlert={showLoginDialog}
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

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </div>
  )
}