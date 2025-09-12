'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import updateCredentials from '../../actions/updateCredentials'
import DataFeed from '@/components/admin/DataFeed'

function UploadsPageClient () {
  // Handler to receive and process data from DataFeed
  const handleDataProcessed = async data => {
    // console.log('Received data from DataFeed:', data)
    if (!Array.isArray(data) || data.length === 0) {
      toast.error('No valid data received from DataFeed')
      return { success: false, error: 'No valid data received' }
    }

    try {
      const updatedRecords = []
      let hasError = false
      for (const record of data) {
        // Ensure pkg is mapped to package for the API
        const formattedRecord = {
          ...record,
          pkg: record.package, // Map package to pkg to match API
          package: undefined // Remove package to avoid sending it
        }

        const response = await updateCredentials(formattedRecord)
        if (response.success) {
          updatedRecords.push(response.user) // Collect created/updated record
          toast.success(response.message || 'Record updated successfully')
        } else {
          hasError = true
          toast.error(response.error || 'Failed to update record')
        }
      }

      // Return success status to DataFeed
      return {
        success: !hasError,
        error: hasError ? 'Some records failed to insert' : null
      }
    } catch (error) {
      console.error('Error processing data:', error)
      toast.error('Error processing data. Please try again.')
      return { success: false, error: error.message }
    } 
  }

  return (
    <div className='flex-1 p-3 w-full gap-6'>
      <DataFeed onDataProcessed={handleDataProcessed} />
    </div>
  )
}

export default UploadsPageClient