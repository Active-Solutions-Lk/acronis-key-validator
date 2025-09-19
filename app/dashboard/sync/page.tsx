'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react'

import { syncData } from '../../actions/syncData'

// Type definition for syncData function to properly handle string parameters
interface SyncDataFunction {
  (fromDate?: string | null, toDate?: string | null): ReturnType<typeof syncData>;
}

// Cast syncData to the proper type
const typedSyncData = syncData as unknown as SyncDataFunction;

function SyncPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [syncStatus, setSyncStatus] = useState('idle') // idle, success, error
  const [syncMessage, setSyncMessage] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  
  // Calculate next scheduled sync time
  const getNextSyncTime = () => {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0) // Set to 12:00 AM
    return tomorrow
  }

  // Format time for display
  const formatTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Sync function
  const performSync = async (from?: string | null, to?: string | null) => {
    setIsLoading(true)
    setSyncStatus('idle')
    try {
      // Use the properly typed function
      const response = await typedSyncData(from, to)
      if (response.success) {
        setSyncStatus('success')
        setSyncMessage(response.message || 'Sales synced successfully')
        setLastSync(new Date())
      } else {
        setSyncStatus('error')
        setSyncMessage(
          response.error || response.details || 'Failed to sync sales'
        )
      }
    } catch (_error) {
      setSyncStatus('error')
      setSyncMessage('Error syncing sales')
      console.log('Error syncing sales:', _error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Manual sync button handler
  const handleManualSync = () => {
    // If dates are provided, use them; otherwise sync for today
    if (fromDate && toDate) {
      performSync(fromDate, toDate)
    } else {
      // Sync for today if no dates selected
      performSync()
    }
  }

  // Set up daily sync at 12:00 AM
  useEffect(() => {
    const scheduleNextSync = () => {
      const nextSync = getNextSyncTime()
      const timeUntilSync = nextSync.getTime() - Date.now()
      const timeout = setTimeout(() => {
        performSync() // Daily sync for today
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
            Automated sales synchronization system
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
          <div className='bg-gray-900 border border-gray-800 rounded-lg p-6'>
            <h3 className='text-xl font-semibold mb-4 flex items-center gap-2'>
              <Calendar className='w-5 h-5' />
              Manual Sync
            </h3>
            <p className='text-gray-400 mb-4'>
              Select date range and trigger sales synchronization
            </p>

            {/* Date Range Selection */}
            <div className='space-y-4 mb-6'>
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-1'>
                  From Date
                </label>
                <input
                  type='date'
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className='w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-300 mb-1'>
                  To Date
                </label>
                <input
                  type='date'
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className='w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white'
                />
              </div>
            </div>

            <button
              onClick={handleManualSync}
              disabled={isLoading}
              className='w-full bg-white text-black px-4 py-3 rounded-lg font-semibold hover:bg-gray-200 disabled:bg-gray-600 disabled:text-gray-400 transition-all duration-200 flex items-center justify-center gap-3'
            >
              <RefreshCw
                className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
              />
              {isLoading ? 'Syncing...' : 'Sync Sales Data'}
            </button>
            
            {(fromDate || toDate) && (
              <p className='text-xs text-gray-500 mt-2 text-center'>
                {fromDate && toDate 
                  ? `Syncing data from ${fromDate} to ${toDate}` 
                  : 'Please select both from and to dates'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SyncPage