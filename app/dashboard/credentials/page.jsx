'use client'
import * as React from 'react'
import { Toaster } from '@/components/ui/sonner'
import AllCredentials from '../../actions/allCredentials'
import AllPackages from '../../actions/allPackages'
import CreateCredential from '../../actions/createCredential'
import UpdateCredential from '../../actions/updateCredential'
import { toast } from 'sonner'
import { usePermissions } from '@/hooks/usePermissions'

// Import new components
import CredentialsHeader from '../../../components/dashboard/credentials/CredentialsHeader'
import CredentialsTable from '../../../components/dashboard/credentials/CredentialsTable'
import { useCredentialsColumns } from '../../../components/dashboard/credentials/CredentialsColumns'
import AddCredentialDialog from '../../../components/dashboard/credentials/AddCredentialDialog'
import EditCredentialDialog from '../../../components/dashboard/credentials/EditCredentialDialog'
import { useCredentialsActions } from '../../../components/dashboard/credentials/useCredentialsActions'
import FileUploadDialog from '../../../components/dashboard/credentials/FileUpload'
import AllResellers from '../../actions/allResellers'
import AllUsers from '../../actions/allUsers'
import expireList from '../../actions/expireList'
import updateCredentials from '../../actions/updateCredentials'
import FetchCredentialsMaster from '../../actions/fetchCredentialsMaster'

function CredentialsPage () {
  // State management
  const [data, setData] = React.useState([])
  const [packages, setPackages] = React.useState([])
  const [users, setUsers] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)
  const [sorting, setSorting] = React.useState([])
  const [columnFilters, setColumnFilters] = React.useState([])
  const [columnVisibility, setColumnVisibility] = React.useState({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [globalFilter, setGlobalFilter] = React.useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)
  const [isFileUploadDialogOpen, setIsFileUploadDialogOpen] =
    React.useState(false)

  const [editingRow, setEditingRow] = React.useState(null)
  const [showPasswords, setShowPasswords] = React.useState({})
  const [editingCell, setEditingCell] = React.useState(null)
  const [tempValue, setTempValue] = React.useState('')

  // Get permissions hook
  const { canEdit, canDelete, canView, user } = usePermissions()

  // Check if user can access credentials
  const canAccessCredentials = canView('credentials')
  const canEditCredentials = canEdit('credentials')
  const canDeleteCredentials = canDelete('credentials')

  // If user can't view credentials, show access denied message
  if (!canAccessCredentials) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p>You don't have permission to view this page.</p>
        </div>
      </div>
    )
  }

  const expectedColumns = ['email', 'password', 'package', 'quota', 'code']

  // Form state
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    pkg_id: '',
    quota: '',
    code: '',
    reseller_id: '',
    user_id: ''
  })

  // Custom hooks for actions
  const {
    togglePasswordVisibility,
    handleInlineEdit,
    handleDeleteCredential,
    handleBulkDelete
  } = useCredentialsActions(data, setData, setRowSelection)

  // Inline editing functions
  const saveInlineEdit = React.useCallback(
    (rowId, field) => {
      // Check if user has permission to edit
      if (!canEditCredentials) {
        toast.error('You do not have permission to edit credentials')
        return
      }
      handleInlineEdit(rowId, field, tempValue)
      setEditingCell(null)
      setTempValue('')
    },
    [handleInlineEdit, tempValue, canEditCredentials]
  )

  const startInlineEdit = React.useCallback((rowId, field, currentValue) => {
    // Check if user has permission to edit
    if (!canEditCredentials) {
      toast.error('You do not have permission to edit credentials')
      return
    }
    setEditingCell(`${rowId}-${field}`)
    setTempValue(currentValue || '')
  }, [canEditCredentials])

  const cancelInlineEdit = React.useCallback(() => {
    setEditingCell(null)
    setTempValue('')
  }, [])

  // Table columns
  const columns = useCredentialsColumns({
    showPasswords,
    togglePasswordVisibility: id =>
      togglePasswordVisibility(id, showPasswords, setShowPasswords),
    editingCell,
    tempValue,
    setTempValue,
    saveInlineEdit,
    cancelInlineEdit,
    startInlineEdit,
    handleDeleteCredential: (id) => {
      // Check if user has permission to delete
      if (!canDeleteCredentials) {
        toast.error('You do not have permission to delete credentials')
        return
      }
      handleDeleteCredential(id)
    },
    setEditingRow,
    setFormData,
    setIsEditDialogOpen
  })

  const [expList, setExpList] = React.useState([])
  const [resellers, setResellers] = React.useState([])

  // Memoized data for performance
  const memoizedPackages = React.useMemo(() => 
    packages?.map(pkg => ({
      value: pkg.name || '',
      label: pkg.name || 'Unknown Package'
    })) || [], [packages]
  )

  const memoizedResellers = React.useMemo(() => 
    resellers?.map(rsl => ({
      value: rsl.company_name || '',
      label: rsl.company_name || 'Unknown Reseller'
    })) || [], [resellers]
  )

  const memoizedUsers = React.useMemo(() => 
    users?.map(user => ({
      value: user.id || '',
      label: `${user.name || 'Unknown User'} (${user.email || 'No Email'})`
    })) || [], [users]
  )

  const memoizedAccountEmails = React.useMemo(() => 
    data?.map(cred => ({
      value: cred.email || '',
      label: cred.email || 'Unknown Email'
    })) || [], [data]
  )

  const memoizedPasswords = React.useMemo(() => 
    data?.map(cred => ({
      value: cred.password || '',
      label: cred.password || 'Unknown Password'
    })) || [], [data]
  )

  const memoizedQRCodes = React.useMemo(() => 
    data?.map(cred => ({
      value: cred.code || '',
      label: cred.code || 'Unknown Code'
    })) || [], [data]
  )

  // Fetch data on component mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [credentialsResult, packagesResult, expireResponse, resellersResponse, usersResponse, masterResponse] = await Promise.all([
          AllCredentials(),
          AllPackages(),
          expireList(),
          AllResellers(),
          AllUsers(),
          FetchCredentialsMaster()
        ])

        if (credentialsResult.success) {
          const transformedData = credentialsResult.credentials.map(
            credential => ({
              id: credential.id,
              email: credential.email,
              password: credential.password,
              code: credential.code,
              quota: credential.quota,
              pkg_id: credential.pkg?.id,
              user_id: credential.user_id,
              created_at: credential.created_at,
              updated_at: credential.created_at,
              pkg: {
                name: credential.pkg?.name || 'Unknown'
              },
              // Add fields for master page compatibility
              reseller: null, // Will be populated from sales data
              customer: credential.user?.company || credential.user?.name || null,
              accMail: credential.email,
              actDate: credential.actDate,
              endDate: credential.endDate
            })
          )
          setData(transformedData)
        } else {
          setError(credentialsResult.error || 'Failed to fetch credentials')
        }

        if (packagesResult.success) {
          setPackages(packagesResult.packages || [])
        } else {
          console.error('Failed to fetch packages:', packagesResult.error)
        }

        if (expireResponse.success) {
          setExpList(expireResponse.responseData.data)
        } else {
          console.error('Failed to fetch expire data:', expireResponse.error)
        }

        if (resellersResponse.success) {
          setResellers(resellersResponse.resellers)
        } else {
          console.error('Failed to fetch resellers:', resellersResponse.error)
        }

        if (usersResponse.success) {
          setUsers(usersResponse.users)
        } else {
          console.error('Failed to fetch users:', usersResponse.error)
        }

        // Handle master data (for backward compatibility)
        if (masterResponse.success) {
          // We can use this data if needed for any master page functionality
         // console.log('Master data fetched:', masterResponse.responseData.data)
        } else {
          console.error('Failed to fetch master data:', masterResponse.error)
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Optimized callback with useCallback to prevent unnecessary re-renders
  const handleUpdateData = React.useCallback(async (updatedRow) => {
    setLoading(true)
    try {
      const response = await updateCredentials(updatedRow)
      if (response.success) {
        toast.success(response.message || 'Updated Success')
        setData(prevData =>
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
      setLoading(false)
    }
  }, [])

  // Memoized function to prevent unnecessary re-computations
  const getRowHighlightClass = React.useCallback((row) => {
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

  // CRUD handlers
  const handleAddCredential = React.useCallback(async () => {
    // Check if user has permission to create
    if (!canEditCredentials) {
      toast.error('You do not have permission to add credentials')
      return
    }
    
    try {
      if (!formData.email || !formData.password || !formData.pkg_id) {
        toast.error('Please fill in all required fields')
        return
      }

      const result = await CreateCredential({
        email: formData.email,
        password: formData.password,
        pkg_id: formData.pkg_id,
        quota: formData.quota || null,
        code: formData.code || null,
        reseller_id: formData.reseller_id || null,
        user_id: formData.user_id || null
      })

      if (result.success) {
        const newCredential = {
          id: result.credential.id,
          email: result.credential.accMail || result.credential.email || result.credential.user?.email,
          password: result.credential.password,
          code: result.credential.code,
          quota: result.credential.quota,
          pkg_id: result.credential.pkg_id,
          user_id: result.credential.user_id,
          created_at: result.credential.created_at,
          updated_at: result.credential.updated_at,
          pkg: {
            name: result.credential.package || result.credential.pkg?.name || 'Unknown'
          }
        }

        setData(prev => [newCredential, ...prev])
        setIsAddDialogOpen(false)
        setFormData({
          email: '',
          password: '',
          pkg_id: '',
          quota: '',
          code: '',
          reseller_id: '',
          user_id: ''
        })
        toast.success(result.message || 'Credential created successfully')
       // console.log('Adding credential:', newCredential)
      } else {
        toast.error(result.error || 'Failed to create credential')
      }
    } catch (error) {
      console.error('Error adding credential:', error)
      toast.error('An unexpected error occurred')
    }
  }, [formData, canEditCredentials])

  const handleEditCredential = React.useCallback(async () => {
    // Check if user has permission to edit
    if (!canEditCredentials) {
      toast.error('You do not have permission to edit credentials')
      return
    }
    
    // Check if editingRow is valid
    if (!editingRow || !editingRow.id) {
      toast.error('No credential selected for editing')
      return
    }
    
    try {
      if (!formData.email || !formData.password || !formData.pkg_id) {
        toast.error('Please fill in all required fields')
        return
      }

      const result = await UpdateCredential(editingRow.id, {
        email: formData.email,
        password: formData.password,
        pkg_id: formData.pkg_id,
        quota: formData.quota || null,
        code: formData.code || null,
        reseller_id: formData.reseller_id || null,
        user_id: formData.user_id || null
      })

      if (result.success) {
        const updatedCredential = {
          id: result.credential.id,
          email: result.credential.accMail || result.credential.email,
          password: result.credential.password,
          code: result.credential.code,
          quota: result.credential.quota,
          pkg_id: result.credential.pkg_id,
          user_id: result.credential.user_id,
          created_at: result.credential.created_at,
          updated_at: result.credential.updated_at,
          pkg: {
            name: result.credential.package || result.credential.pkg?.name || 'Unknown'
          }
        }

        const updatedData = data.map(item =>
          item.id === editingRow?.id ? updatedCredential : item
        )

        setData(updatedData)
        setIsEditDialogOpen(false)
        setEditingRow(null)
        toast.success(result.message || 'Credential updated successfully')
        //('Editing credential:', updatedCredential)
      } else {
        toast.error(result.error || 'Failed to update credential')
      }
    } catch (error) {
      console.error('Error updating credential:', error)
      toast.error('An unexpected error occurred')
    }
  }, [formData, editingRow, data, canEditCredentials])

  const handleUploadCredential = React.useCallback(async (credentialData) => {
    // Check if user has permission to create
    if (!canEditCredentials) {
      toast.error('You do not have permission to upload credentials')
      return { 
        success: false, 
        error: 'You do not have permission to upload credentials'
      }
    }
    
    try {
      const result = await CreateCredential({
        email: credentialData.email,
        password: credentialData.password,
        pkg_id: credentialData.pkg_id || credentialData.pkg,
        quota: credentialData.quota || null,
        code: credentialData.code || null
      })

      if (result.success) {
        const newCredential = {
          id: result.credential.id,
          email: result.credential.accMail || result.credential.email || result.credential.user?.email,
          password: result.credential.password,
          code: result.credential.code,
          quota: result.credential.quota,
          pkg_id: result.credential.pkg_id,
          created_at: result.credential.created_at,
          updated_at: result.credential.updated_at,
          pkg: {
            name: result.credential.package || result.credential.pkg?.name || 'Unknown'
          }
        }

        setData(prev => [newCredential, ...prev])
        return { 
          success: true, 
          message: result.message || 'Credential created successfully',
          credential: newCredential
        }
      } else {
        return { 
          success: false, 
          error: result.error || 'Failed to create credential'
        }
      }
    } catch (error) {
      console.error('Error uploading credential:', error)
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred'
      }
    }
  }, [canEditCredentials])

  const refreshData = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await AllCredentials()

      if (result.success) {
        const transformedData = result.credentials.map(credential => ({
          id: credential.id,
          email: credential.email,
          password: credential.password,
          code: credential.code,
          quota: credential.quota,
          pkg_id: credential.pkg?.id,
          created_at: credential.created_at,
          updated_at: credential.created_at,
          pkg: {
            name: credential.pkg?.name || 'Unknown'
          }
        }))
        setData(transformedData)
        toast.success('Data refreshed successfully')
      } else {
        setError(result.error || 'Failed to refresh credentials')
        toast.error('Failed to refresh data')
      }
    } catch (err) {
      console.error('Error refreshing data:', err)
      setError('Failed to refresh data')
      toast.error('Failed to refresh data')
    } finally {
      setLoading(false)
    }
  }, [])

  // Mock table object for header component compatibility
  const mockTable = React.useMemo(
    () => ({
      getAllColumns: () =>
        columns
          .filter(col => col.id !== 'select' && col.id !== 'actions')
          .map(col => ({
            id: col.accessorKey || col.id,
            getCanHide: () => true,
            getIsVisible: () =>
              columnVisibility[col.accessorKey || col.id] !== false,
            toggleVisibility: visible => {
              const key = col.accessorKey || col.id
              setColumnVisibility(prev => ({ ...prev, [key]: visible }))
            }
          }))
    }),
    [columns, columnVisibility]
  )

  return (
    <div className='space-y-2 p-2'>
      <CredentialsHeader
        data={data}
        loading={loading}
        error={error}
        refreshData={refreshData}
        setIsAddDialogOpen={setIsAddDialogOpen}
        setIsFileUploadDialogOpen={setIsFileUploadDialogOpen}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        table={mockTable}
        rowSelection={rowSelection}
        handleBulkDelete={() => {
          // Check if user has permission to delete
          if (!canDeleteCredentials) {
            toast.error('You do not have permission to delete credentials')
            return
          }
          handleBulkDelete(rowSelection)
        }}
      />

      {/* Add EditableTable for master page functionality */}
     

      <CredentialsTable
        data={data}
        columns={columns}
        sorting={sorting}
        setSorting={setSorting}
        columnFilters={columnFilters}
        setColumnFilters={setColumnFilters}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        globalFilter={globalFilter}
        setGlobalFilter={setGlobalFilter}
        loading={loading}
        error={error}
        getRowHighlightClass={getRowHighlightClass}
      />

      {/* Only show add dialog if user has edit permissions */}
      {canEditCredentials && (
        <AddCredentialDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          formData={formData}
          setFormData={setFormData}
          packages={packages}
          resellers={resellers}
          users={users}
          onSubmit={handleAddCredential}
        />
      )}

      {/* Only show edit dialog if user has edit permissions */}
      {canEditCredentials && (
        <EditCredentialDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          formData={formData}
          setFormData={setFormData}
          packages={packages}
          resellers={resellers}
          users={users}
          onSubmit={handleEditCredential}
        />
      )}

      {/* Only show file upload dialog if user has edit permissions */}
      {canEditCredentials && (
        <FileUploadDialog
          isOpen={isFileUploadDialogOpen}
          onClose={() => setIsFileUploadDialogOpen(false)}
          packages={packages}
          uploadCredentials={handleUploadCredential}
          expectedColumns = {expectedColumns}
        />
      )}
      <Toaster />
    </div>
  )
}

export default CredentialsPage