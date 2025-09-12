'use client'
import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { toast } from 'sonner'

import DataFeed from '@/components/admin/DataFeed'

export default function FileUploadDialog ({
  isOpen,
  onClose,
  uploadCredentials,
  expectedColumns
}) {
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
        // Ensure pkg_id is mapped from package for the API
        const formattedRecord = {
          ...record,
          pkg_id: record.package, // Map package to pkg_id to match API
          package: undefined // Remove package to avoid sending it
        }

        const response = await uploadCredentials(formattedRecord)
        if (response && response.success) {
          updatedRecords.push(response.credential || response.user) // Collect created/updated record
          toast.success(response.message || 'Record updated successfully')
        } else {
          hasError = true
          const errorMessage = response?.error || 'Failed to update record'
          toast.error(errorMessage)
          console.error('Upload error:', response)
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle></DialogTitle>
      <DialogContent>
        <div className='space-y-4'>
          <DataFeed onDataProcessed={handleDataProcessed} expectedColumns = {expectedColumns} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
