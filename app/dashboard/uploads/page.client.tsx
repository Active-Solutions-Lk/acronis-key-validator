'use client'

import { toast } from 'sonner'
import updateCredentials from '../../actions/updateCredentials'
import DataFeed from '@/components/admin/DataFeed'

// Define the structure of the data received from DataFeed
interface CredentialData {
  id: string | null
  mspCreate?: string
  date?: string
  reseller?: string
  hoDate?: string
  package?: string
  pkg?: string
  actDate?: string
  endDate?: string
  customer?: string
  address?: string
  name?: string
  email?: string
  tel?: string
  city?: string
  code?: string
  accMail?: string
  password?: string
  // Instead of using [key: string]: any, we'll allow additional properties to be optional
  [key: string]: string | null | undefined
}

// Define the structure of the response from updateCredentials
interface UpdateResponse {
  success: boolean
  message?: string
  error?: string
}

// Define error type for catch blocks
interface ErrorWithMessage {
  message: string
}

function UploadsPageClient () {
  // Handler to receive and process data from DataFeed
  const handleDataProcessed = async (data: CredentialData[]) => {
    // console.log('Received data from DataFeed:', data)
    if (!Array.isArray(data) || data.length === 0) {
      toast.error('No valid data received from DataFeed')
      return { success: false, error: 'No valid data received' }
    }

    try {
      let hasError = false
      for (const record of data) {
        // Ensure pkg is mapped to package for the API
        const formattedRecord = {
          ...record,
          pkg: record.package, // Map package to pkg to match API
          package: undefined // Remove package to avoid sending it
        }

        const response: UpdateResponse = await updateCredentials(formattedRecord)
        if (response.success) {
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
    } catch (error: unknown) {
      console.error('Error processing data:', error)
      toast.error('Error processing data. Please try again.')
      // Type guard to check if error has message property
      const errorMessage = (error as ErrorWithMessage).message || 'Unknown error occurred'
      return { success: false, error: errorMessage }
    } 
  }

  return (
    <div className='flex-1 p-3 w-full gap-6'>
      <DataFeed onDataProcessed={handleDataProcessed} expectedColumns={[]} />
    </div>
  )
}

export default UploadsPageClient