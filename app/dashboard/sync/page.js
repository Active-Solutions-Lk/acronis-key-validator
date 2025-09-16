'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Clock, CheckCircle, AlertCircle } from 'lucide-react'

import { syncData } from '../../actions/syncData'

function SyncEmails () {
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState(null)
  const [syncStatus, setSyncStatus] = useState('idle') // idle, success, error
  const [syncMessage, setSyncMessage] = useState('')
  // Calculate next scheduled sync time
  const getNextSyncTime = () => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0) // Set to 12:00 AM
    return tomorrow
  }

  // Format time for display
  const formatTime = date => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Sync function
  const performSync = async () => {
    setIsLoading(true)
    setSyncStatus('idle')
    try {
      const response = await syncData()
    //  console.log('response', response)
      if (response.success) {
      //  console.log(response.data) // Fixed: Use response.data instead of response.responseData.data
        setSyncStatus('success')
        setSyncMessage(response.message || 'Emails synced successfully') // Use actual message from response
        setLastSync(new Date())
      } else {
        setSyncStatus('error')
        setSyncMessage(
          response.error || response.details || 'Failed to sync emails'
        )
      }
    } catch (error) {
      setSyncStatus('error')
      setSyncMessage('Error syncing emails')
    //  console.log('Error fetching master data:', error)
    } finally {
      setIsLoading(false)
    }
  }
  // Manual sync button handler
  const handleManualSync = () => {
    performSync()
    // startCronJob()
  }


  // Trigger server-side cron job (for testing)
  const startCronJob = async () => {
    try {
      const response = await fetch('/api/run-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const result = await response.json();
      setSyncMessage(result.message);
      setSyncStatus(response.ok ? 'success' : 'error');
    } catch (error) {
      setSyncStatus('error');
      setSyncMessage('Failed to start cron job');
      console.error('Error starting cron job:', error);
    }
  };

  // Set up daily sync at 12:00 AM
  useEffect(() => {
    const scheduleNextSync = () => {
      const nextSync = getNextSyncTime()
      const timeUntilSync = nextSync.getTime() - Date.now()
      const timeout = setTimeout(() => {
        performSync()
        // Schedule the next sync
        scheduleNextSync()
      }, timeUntilSync)

      return timeout
    }
    const timeout = scheduleNextSync()

    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className='min-h-screen bg-transparent text-white p-0'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='text-center mb-6'>
          <p className='text-gray-400 text-lg'>
            Automated email synchronization system
          </p>
        </div>

        {/* Main Dashboard Grid */}
        <div className='grid md:grid-cols-2 gap-8 mb-0'>
          {/* Sync Status Card */}
          <div className='bg-gray-900 border border-gray-800 rounded-lg p-6'>
            <div className='flex items-center gap-3 mb-4'>
              <div
                className={`w-3 h-3 rounded-full ${
                  syncStatus === 'success'
                    ? 'bg-green-400'
                    : syncStatus === 'error'
                    ? 'bg-red-400'
                    : 'bg-gray-400'
                }`}
              ></div>
              <h2 className='text-xl font-semibold'>Sync Status</h2>
            </div>

            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                {syncStatus === 'success' && (
                  <CheckCircle className='w-5 h-5 text-green-400' />
                )}
                {syncStatus === 'error' && (
                  <AlertCircle className='w-5 h-5 text-red-400' />
                )}
                {syncStatus === 'idle' && (
                  <Clock className='w-5 h-5 text-gray-400' />
                )}
                <span
                  className={
                    syncStatus === 'success'
                      ? 'text-green-400'
                      : syncStatus === 'error'
                      ? 'text-red-400'
                      : 'text-gray-400'
                  }
                >
                  {syncMessage || 'Ready to sync'}
                </span>
              </div>

              {lastSync && (
                <div className='text-sm text-gray-500'>
                  Last sync: {formatTime(lastSync)}
                </div>
              )}
            </div>
          </div>
          {/* Manual Sync Section */}
          <div className='bg-gray-900 border border-gray-800 rounded-lg p-2 text-center'>
            <h3 className='text-2xl font-semibold mb-4'>Manual Sync</h3>
            <p className='text-gray-400 mb-6'>
              Trigger an immediate email synchronization
            </p>

            <button
              onClick={handleManualSync}
              disabled={isLoading}
              className='bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 transition-all duration-200 flex items-center gap-3 mx-auto'
            >
              <RefreshCw
                className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
              />
              {isLoading ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SyncEmails
