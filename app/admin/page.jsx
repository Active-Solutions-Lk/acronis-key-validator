'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import ValidateUser from '../actions/validateUser'
import EditableTable from '@/components/admin/EditableTable'
import FetchMaster from '../actions/fetchMaster'
import expireList from '../actions/expireList'
import updatedMaster from '../actions/updateMaster'
import LoginDialog from '@/components/admin/LoginDialog'
import DataFeed from '@/components/admin/DataFeed'

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
    accessorKey: 'date',
    header: 'Date',
    cell: ({ row }) => (
      <div className='min-w-[80px]'>
        {new Date(row.getValue('date')).toLocaleDateString()}
      </div>
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
    accessorKey: 'code',
    header: 'Code',
    cell: ({ row }) => (
      <div className='min-w-[80px]'>{row.getValue('code') || '-'}</div>
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
  },
  {
    accessorKey: 'password',
    header: 'Password',
    cell: ({ row }) => (
      <div className='min-w-[50px]'>{row.getValue('password') || '-'}</div>
    )
  }
]

export default function Admin() {
  const [showAlert, setShowAlert] = useState(true)
  const [alertName, setAlertName] = useState('')
  const [alertPassword, setAlertPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [masterData, setMasterData] = useState([])
  const [expList, setExpList] = useState([])
  const [masterLoading, setMasterLoading] = useState(false)

  // Handler to receive and process data from DataFeed
  const handleDataProcessed = async (data) => {
    console.log('Received data from DataFeed:', data);
    if (!Array.isArray(data) || data.length === 0) {
      toast.error('No valid data received from DataFeed');
      return { success: false, error: 'No valid data received' };
    }

    setMasterLoading(true);
    try {
      const updatedRecords = [];
      let hasError = false;
      for (const record of data) {
        // Ensure pkg is mapped to package for the API
        const formattedRecord = {
          ...record,
          pkg: record.package, // Map package to pkg to match API
          package: undefined // Remove package to avoid sending it
        };
        
        const response = await updatedMaster(formattedRecord);
        if (response.success) {
          updatedRecords.push(response.user); // Collect created/updated record
          toast.success(response.message || 'Record updated successfully');
        } else {
          hasError = true;
          toast.error(response.error || 'Failed to update record');
        }
      }

      // Update masterData state with new records
      setMasterData(prevData => [...prevData, ...updatedRecords]);
      
      // Return success status to DataFeed
      return { success: !hasError, error: hasError ? 'Some records failed to insert' : null };
    } catch (error) {
      console.error('Error processing data:', error);
      toast.error('Error processing data. Please try again.');
      return { success: false, error: error.message };
    } finally {
      setMasterLoading(false);
    }
  };

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const response = await FetchMaster()
        if (response.success) {
          setMasterData(response.responseData.data)
        } else {
          setMessage(response.error || 'Failed to fetch master data.')
        }
      } catch (error) {
        console.error('Error fetching master data:', error)
        setMessage('Error fetching master data.')
      }
    }
    const fetchExpireData = async () => {
      try {
        const response = await expireList()
        if (response.success) {
          setExpList(response.responseData.data)
        } else {
          setMessage(response.error || 'Failed to fetch Expire data.')
        }
      } catch (error) {
        console.error('Error fetching expire data:', error)
        setMessage('Error fetching expire data.')
      }
    }

    fetchExpireData()
    fetchMasterData()
  }, [])

  // Callback to handle updated data from EditableTable
  const handleUpdateData = async (updatedRow) => {
    setMasterLoading(true)
    const response = await updatedMaster(updatedRow)
    if (response.success) {
      toast.success(response.message || 'Updated Success')
      setMasterLoading(false)
    } else {
      toast.error(
        response.error || 'The data is not updated. Please contact admin'
      )
      setMasterLoading(false)
    }

    setMasterData(prevData =>
      prevData.map(item =>
        item.id === updatedRow.id ? { ...item, ...updatedRow } : item
      )
    )
  }

  // Function to determine row highlight class based on endDate
  const getRowHighlightClass = row => {
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
  }

  const handleOkClick = async e => {
    e.preventDefault()
    if (!alertName || !alertPassword) {
      setMessage('Username and password are required')
      return
    }
    try {
      setMessage('')
      setLoading(true)
      const data = { user_name: alertName, password: alertPassword }
      const response = await ValidateUser(data)
      if (response.status === 200) {
        setMessage('User validated successfully')
        setLoading(false)
        setShowAlert(false) // Only close dialog on successful validation
      } else {
        setLoading(false)
        setMessage(response.message || 'Validation failed')
      }
    } catch (error) {
      console.log('Error validating user:', error)
      setLoading(false)
      setMessage(error.message || 'Error validating credentials')
    }
  }

  return (
    <div className='flex-1 p-3 w-full gap-6'>
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
      {!showAlert && (
        <Tabs defaultValue='mtable'>
          <TabsList>
            <TabsTrigger value='mtable'>Master Table</TabsTrigger>
            <TabsTrigger value='expList'>Expiry List</TabsTrigger>
            <TabsTrigger value='feed'>Data Feed</TabsTrigger>
          </TabsList>
          <TabsContent value='mtable'>
            <Card className='bg-gray-100'>
              <CardContent className='grid gap-4 p-0 m-0'>
                <EditableTable
                  masterDate={masterData}
                  columns={columns}
                  onUpdateData={handleUpdateData}
                  masterLoading={masterLoading}
                  getRowHighlightClass={getRowHighlightClass}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value='expList'>
            <Card className='bg-gray-100'>
              <CardContent className='grid gap-4 p-0 m-0'>
                <EditableTable
                  masterDate={expList}
                  columns={columns}
                  onUpdateData={handleUpdateData}
                  masterLoading={masterLoading}
                  getRowHighlightClass={getRowHighlightClass}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value='feed'>
            <Card className='bg-gray-100'>
              <CardContent className='grid gap-4 p-0 m-0'>
                <DataFeed
                  masterDate={expList}
                  columns={columns}
                  onUpdateData={handleUpdateData}
                  masterLoading={masterLoading}
                  getRowHighlightClass={getRowHighlightClass}
                  onDataProcessed={handleDataProcessed}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}