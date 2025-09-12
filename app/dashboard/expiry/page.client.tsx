'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import EditableTable from '@/components/admin/EditableTable'
import FetchCredentialsMaster from '../../actions/fetchCredentialsMaster'
import expireList from '../../actions/expireList'
import updateCredentials from '../../actions/updateCredentials'
import AllPackages from '../../actions/allPackages'
import AllResellers from '../../actions/allResellers'
import AllCredentials from '../../actions/allCredentials'

const columns = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => <div className='w-12'>{row.getValue('id')}</div>,
    enableSorting: true
  },
  {
    accessorKey: 'reseller',
    header: 'Reseller',
    cell: ({ row }) => (
      <div className='min-w-[120px]'>{row.getValue('reseller')}</div>
    ),
    enableSorting: true
  },
  {
    accessorKey: 'customer',
    header: 'Customer',
    cell: ({ row }) => (
      <div className='min-w-[120px]'>{row.getValue('customer') || '-'}</div>
    ),
    enableSorting: true
  },
  {
    accessorKey: 'actDate',
    header: 'Activated Date',
    cell: ({ row }) => (
      <div className='min-w-[80px]'>{row.getValue('actDate') || '-'}</div>
    )
  },
  {
    accessorKey: 'endDate',
    header: 'End Date',
    cell: ({ row }) => (
      <div className='min-w-[80px]'>{row.getValue('endDate') || '-'}</div>
    )
  },
  {
    accessorKey: 'accMail',
    header: 'Acc Mail',
    cell: ({ row }) => (
      <div className='min-w-[120px] font-mono'>
        {row.getValue('accMail') || '-'}
      </div>
    )
  }
]

function ExpiryPageClient () {
  const [message, setMessage] = useState('')
  const [credentialsData, setCredentialsData] = useState([])
  const [expList, setExpList] = useState([])
  const [packages, setPackages] = useState([])
  const [resellers, setResellers] = useState([])
  const [credentials, setCredentials] = useState([])
  const [credentialsLoading, setCredentialsLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // Memoized data for performance
  const memoizedPackages = useMemo(() => 
    packages?.map(pkg => ({
      value: pkg.name || '',
      label: pkg.name || 'Unknown Package'
    })) || [], [packages]
  )

  const memoizedResellers = useMemo(() => 
    resellers?.map(rsl => ({
      value: rsl.company_name || '',
      label: rsl.company_name || 'Unknown Reseller'
    })) || [], [resellers]
  )

  // Memoized credentials for performance
  const memoizedAccountEmails = useMemo(() => 
    credentials?.map(cred => ({
      value: cred.email || '',
      label: cred.email || 'Unknown Email'
    })) || [], [credentials]
  )

  const memoizedPasswords = useMemo(() => 
    credentials?.map(cred => ({
      value: cred.password || '',
      label: cred.password || 'Unknown Password'
    })) || [], [credentials]
  )

  const memoizedQRCodes = useMemo(() => 
    credentials?.map(cred => ({
      value: cred.code || '',
      label: cred.code || 'Unknown Code'
    })) || [], [credentials]
  )

  useEffect(() => {
    const fetchInitialData = async () => {
      setInitialLoading(true)
      try {
        // Fetch all data in parallel for better performance
        const [credentialsResponse, expireResponse, packagesResponse, resellersResponse, allCredentialsResponse] = await Promise.all([
          FetchCredentialsMaster(),
          expireList(),
          AllPackages(),
          AllResellers(),
          AllCredentials()
        ])

        if (credentialsResponse.success) {
          setCredentialsData(credentialsResponse.responseData.data)
        } else {
          setMessage(credentialsResponse.error || 'Failed to fetch credentials data.')
          toast.error(credentialsResponse.error || 'Failed to fetch credentials data.')
        }

        if (expireResponse.success) {
          setExpList(expireResponse.responseData.data)
        } else {
          setMessage(expireResponse.error || 'Failed to fetch expire data.')
          toast.error(expireResponse.error || 'Failed to fetch expire data.')
        }

        if (packagesResponse.success) {
          setPackages(packagesResponse.packages)
        } else {
          toast.error(packagesResponse.error || 'Failed to fetch packages')
        }

        if (resellersResponse.success) {
          setResellers(resellersResponse.resellers)
        } else {
          toast.error(resellersResponse.error || 'Failed to fetch resellers')
        }

        if (allCredentialsResponse.success) {
          setCredentials(allCredentialsResponse.credentials)
        } else {
          toast.error(allCredentialsResponse.error || 'Failed to fetch credentials')
        }
      } catch (error) {
        console.error('Error fetching initial data:', error)
        setMessage('Error fetching data. Please try again.')
        toast.error('Error fetching data. Please try again.')
      } finally {
        setInitialLoading(false)
      }
    }

    fetchInitialData()
  }, [])

  // Optimized callback with useCallback to prevent unnecessary re-renders
  const handleUpdateData = useCallback(async (updatedRow) => {
    setCredentialsLoading(true)
    try {
      const response = await updateCredentials(updatedRow)
      if (response.success) {
        toast.success(response.message || 'Updated Success')
        setExpList(prevData =>
          prevData.map(item =>
            item.id === updatedRow.id ? { ...item, ...updatedRow } : item
          )
        )
      } else {
        toast.error(
          response.error || 'The data is not updated. Please contact admin'
        )
      }
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update data. Please try again.')
    } finally {
      setCredentialsLoading(false)
    }
  }, [])

  // Memoized function to prevent unnecessary re-computations
  const getRowHighlightClass = useCallback((row) => {
    if (row && row.endDate) {
      const endDate = new Date(row.endDate)
      const today = new Date()
      const diffInDays = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24))

      if (diffInDays <= 0) {
        return 'bg-red-300' // Expired: Red background
      } else if (diffInDays <= 30) {
        return 'bg-yellow-100' // Near expiration (within 30 days): Yellow background
      }
    }
    return 'bg-transparent' // No highlight
  }, [])

  return (
    <div className='flex-1 p-3 w-full gap-6'>
      <Card className='bg-gray-100'>
        <CardContent className='grid gap-4 p-0 m-0'>
          <EditableTable
            masterDate={expList}
            columns={columns}
            onUpdateData={handleUpdateData}
            masterLoading={credentialsLoading}
            getRowHighlightClass={getRowHighlightClass}
            isLoading={initialLoading}
            packages={memoizedPackages}
            resellers={memoizedResellers}
            credentials={{
              accountEmails: memoizedAccountEmails,
              passwords: memoizedPasswords,
              qrCodes: memoizedQRCodes
            }}
          />
        </CardContent>
      </Card>

      {/* Error message display */}
      {message && !initialLoading && (
        <Card className='mt-4 border-red-200 bg-red-50'>
          <CardContent className='p-4'>
            <p className='text-red-700 text-sm'>{message}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ExpiryPageClient