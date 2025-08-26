// app/admin/page.jsx
'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { toast } from "sonner"
import ValidateUser from '../actions/validateUser'
import EditableTable from '@/components/EditableTable'
import { FetchMaster } from '../actions/fetchMaster'
import updatedMaster from '../actions/updateMaster'

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
      <div className='min-w-80px]'>{row.getValue('endDate') || '-'}</div>
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
export default function Admin () {
  const [showAlert, setShowAlert] = useState(true)
  const [alertName, setAlertName] = useState('')
  const [alertPassword, setAlertPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [masterData, setMasterData] = useState([''])
  const [masterResponse, setmasterResponse] = useState([''])
  const [masterLoading,setMasterLoading] = useState('')

  useEffect(() => {
    const fetchData = async () => {
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
    fetchData()
  }, [])

  // Callback to handle updated data
  const handleUpdateData = async updatedRow => {
    // console.log('updatedRow', updatedRow);
    setMasterLoading(true);
    const response = await updatedMaster(updatedRow)
    if (response.success) {
      setmasterResponse(response.message || 'Updated Success');
      toast.success(response.message || 'Updated Success') ;
      setMasterLoading(false);
    } else {
      toast.error(response.error || 'The data is not updated. Please contact admin');
     setMasterLoading(false);

    }

    setMasterData(prevData =>
      prevData.map(item =>
        item.id === updatedRow.id ? { ...item, ...updatedRow } : item
      )
    )
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
        setShowAlert(false)
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
      <Dialog open={showAlert}>
        <form>
          <DialogContent className='sm:max-w-[425px]'>
            <DialogHeader>
              <DialogTitle>Login Admin</DialogTitle>
              <DialogDescription>
                Enter your credentials to access the admin panel.
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4'>
              <div className='grid gap-3'>
                <Label htmlFor='name-1'>User Name</Label>
                <Input
                  id='name-1'
                  name='name'
                  type='text'
                  onChange={e => setAlertName(e.target.value)}
                  value={alertName}
                />
              </div>
              <div className='grid gap-3'>
                <Label htmlFor='username-1'>Password</Label>
                <Input
                  id='username-1'
                  value={alertPassword}
                  name='username'
                  type='password'
                  onChange={e => setAlertPassword(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              {message && <p className='text-red-500'>{message}</p>}
              <Button onClick={handleOkClick} type='submit'>
                {loading ? 'Validating...' : 'Login'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </form>
      </Dialog>
      {!showAlert && (
        <Tabs defaultValue='mtable'>
          <TabsList>
            <TabsTrigger value='mtable'>Master Table</TabsTrigger>
            <TabsTrigger value='expireList'>Expire List</TabsTrigger>
            <TabsTrigger value='profile'>Profile</TabsTrigger>
          </TabsList>
          <TabsContent value='mtable'>
            <Card className='bg-gray-100'>
              <CardContent className='grid gap-4 p-0 m-0'>
                <EditableTable
                  masterDate={masterData}
                  columns={columns}
                  onUpdateData={handleUpdateData} // Pass the callback
                  masterLoading = {masterLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>
            <TabsContent value='expireList'>
            <Card className='bg-gray-100'>
              <CardContent className='grid gap-4 p-0 m-0'>
                <EditableTable
                  masterDate={masterData}
                  columns={columns}
                  onUpdateData={handleUpdateData} // Pass the callback
                  masterLoading = {masterLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value='profile'>
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  Update your profile information and password.
                </CardDescription>
              </CardHeader>
              <CardContent className='grid gap-6'>
                <div className='grid gap-3'>
                  <Label htmlFor='tabs-demo-username'>Username</Label>
                  <Input id='tabs-demo-username' defaultValue='@peduarte' />
                </div>
                <div className='grid gap-3'>
                  <Label htmlFor='tabs-demo-current'>Current password</Label>
                  <Input id='tabs-demo-current' type='password' />
                </div>
                <div className='grid gap-3'>
                  <Label htmlFor='tabs-demo-new'>New password</Label>
                  <Input id='tabs-demo-new' type='password' />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Save password</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
