'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { flexRender, getCoreRowModel, useReactTable, getSortedRowModel, getFilteredRowModel, getPaginationRowModel } from '@tanstack/react-table'
import { Search, MoreHorizontal, Trash2, Edit, Plus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import UserEditDialog from '@/components/admin/UserEditDialog'
import AddUserDialog from '@/components/admin/AddUserDialog'
import Pagination from '@/components/admin/Pagination'
import AllUsers from '../../actions/allUsers'
import AllCities from '../../actions/allCities'
import UpdateUser from '../../actions/updateUser'
import CreateUser from '../../actions/createUser'
import DeleteUser, { BulkDeleteUsers } from '../../actions/deleteUser'

const Table = ({ children, ...props }) => <table className='w-full caption-bottom text-sm' {...props}>{children}</table>
const TableHeader = ({ children, ...props }) => <thead className='[&_tr]:border-b' {...props}>{children}</thead>
const TableBody = ({ children, ...props }) => <tbody className='[&_tr:last-child]:border-0' {...props}>{children}</tbody>
const TableRow = ({ children, className = '', ...props }) => <tr className={`border-b transition-colors hover:bg-muted/50 ${className}`} {...props}>{children}</tr>
const TableHead = ({ children, className = '', ...props }) => <th className={`h-12 px-2 text-left align-middle font-medium text-muted-foreground ${className}`} {...props}>{children}</th>
const TableCell = ({ children, className = '', ...props }) => <td className={`p-2 align-middle ${className}`} {...props}>{children}</td>
const Input = ({ className = '', ...props }) => <input className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${className}`} {...props} />

function UsersPageClient() {
  const [message, setMessage] = useState('')
  const [data, setData] = useState([])
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [sorting, setSorting] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState({})
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)
  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    company: '',
    tel: '',
    address: '',
    city: ''
  })

  // Delete handlers
  const handleDeleteUser = useCallback(async (id) => {
    try {
      const response = await DeleteUser(id)
      if (response.success) {
        toast.success(response.message || 'User deleted successfully')
        setData(prevData => prevData.filter(item => item.id !== id))
      } else {
        toast.error(response.error || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete user. Please try again.')
    }
  }, [])

  // Define columns inside the component so they have access to state and handlers
  const columns = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    { accessorKey: 'id', header: 'ID', cell: ({ row }) => <div className='w-12'>{row.getValue('id')}</div>, enableSorting: true },
    { accessorKey: 'name', header: 'Name', cell: ({ row }) => <div className='min-w-[150px] font-medium'>{row.getValue('name')}</div>, enableSorting: true },
    { accessorKey: 'email', header: 'Email', cell: ({ row }) => <div className='min-w-[150px]'>{row.getValue('email')}</div>, enableSorting: true },
    { accessorKey: 'company', header: 'Company', cell: ({ row }) => <div className='min-w-[120px]'>{row.getValue('company') || '-'}</div> },
    { 
      accessorKey: 'city', 
      header: 'City', 
      cell: ({ row }) => {
        const cityData = row.original.sri_lanka_districts_cities
        return <div className='min-w-[100px]'>{cityData ? `${cityData.city}, ${cityData.district}` : '-'}</div>
      }, 
      enableSorting: true 
    },
    { accessorKey: 'tel', header: 'Phone', cell: ({ row }) => <div className='min-w-[100px]'>{row.getValue('tel') || '-'}</div> },
    // { accessorKey: 'address', header: 'Address', cell: ({ row }) => <div className='min-w-[150px]'>{row.getValue('address') || '-'}</div> },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const user = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setEditingRow({ ...user })
                  setIsEditDialogOpen(true)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteUser(user.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    }
  ]

  const table = useReactTable({
    data, columns, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(), getPaginationRowModel: getPaginationRowModel(), onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString', state: { sorting, globalFilter, rowSelection }, 
    enableRowSelection: true, onRowSelectionChange: setRowSelection,
    initialState: { pagination: { pageSize: 10 }, sorting: [{ id: 'id', asc: true }] }
  })

  useEffect(() => {
    const fetchData = async () => {
      setInitialLoading(true)
      try {
        const [userResponse, citiesResponse] = await Promise.all([
          AllUsers(),
          AllCities()
        ])
        
        if (userResponse.success) {
          setData(userResponse.users)
        } else {
          setMessage(userResponse.error || 'Failed to fetch user data.')
          toast.error(userResponse.error || 'Failed to fetch user data.')
        }
        
        if (citiesResponse.success) {
          // Transform cities data for the combobox component
          const transformedCities = citiesResponse.cities?.map(city => ({
            value: city.id,
            label: `${city.city}`,
            id: city.id,
            name: `${city.city}`
          })) || []
          setCities(transformedCities)
        } else {
          console.error('Failed to fetch cities:', citiesResponse.error)
          toast.error('Failed to fetch cities data.')
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setMessage('Error fetching data. Please try again.')
        toast.error('Error fetching data. Please try again.')
      } finally {
        setInitialLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleRowDoubleClick = (row) => { setEditingRow({ ...row }); setIsEditDialogOpen(true) }
  
  const handleUpdateData = useCallback(async () => {
    if (!editingRow) return
    setLoading(true)
    try {
      const response = await UpdateUser(editingRow.id, editingRow)
      if (response.success) {
        toast.success(response.message || 'User updated successfully')
        setData(prevData => prevData.map(item => item.id === editingRow.id ? { ...item, ...editingRow } : item))
        setIsEditDialogOpen(false)
        setEditingRow(null)
      } else {
        toast.error(response.error || 'Failed to update user')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update user. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [editingRow])

  const handleInputChange = (field, value) => { if (editingRow) setEditingRow(prev => ({ ...prev, [field]: value })) }

  const handleBulkDelete = useCallback(async () => {
    const selectedIds = Object.keys(rowSelection).map(index => data[parseInt(index)].id)
    try {
      const response = await BulkDeleteUsers(selectedIds)
      if (response.success) {
        toast.success(response.message || `${response.deletedCount} user(s) deleted successfully`)
        setData(prevData => prevData.filter(item => !selectedIds.includes(item.id)))
        setRowSelection({})
      } else {
        toast.error(response.error || 'Failed to delete users')
      }
    } catch (error) {
      console.error('Bulk delete error:', error)
      toast.error('Failed to delete users. Please try again.')
    }
  }, [rowSelection, data])

  // Add user handler
  const handleAddUser = useCallback(async () => {
    try {
      if (!addFormData.name || !addFormData.email) {
        toast.error('Please fill in all required fields (Name, Email)')
        return
      }

      const response = await CreateUser(addFormData)
      if (response.success) {
        toast.success(response.message || 'User created successfully')
        setData(prevData => [response.user, ...prevData])
        setIsAddDialogOpen(false)
        setAddFormData({
          name: '',
          email: '',
          company: '',
          tel: '',
          address: '',
          city: ''
        })
      } else {
        toast.error(response.error || 'Failed to create user')
      }
    } catch (error) {
      console.error('Add error:', error)
      toast.error('Failed to create user. Please try again.')
    }
  }, [addFormData])

  if (initialLoading) {
    return (
      <div className='flex-1 p-3 w-full'>
        <Card className='bg-gray-100'>
          <CardContent className='p-4'>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full max-w-sm" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className='flex-1 p-3 w-full gap-6'>
      <Card className='bg-gray-100'>
        <CardContent className='p-4'>
          <div className="w-full">
            <div className="flex items-center justify-between mb-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search users..." value={globalFilter ?? ''} onChange={(e) => setGlobalFilter(String(e.target.value))} className="pl-8" />
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
                {Object.keys(rowSelection).length > 0 && (
                  <Button variant="destructive" onClick={handleBulkDelete}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected ({Object.keys(rowSelection).length})
                  </Button>
                )}
                <div className="text-sm text-muted-foreground">{table.getFilteredRowModel().rows.length} of {table.getCoreRowModel().rows.length} row(s)</div>
              </div>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="cursor-pointer select-none" onClick={header.column.getToggleSortingHandler()}>
                          {header.isPlaceholder ? null : (
                            <div className="flex items-center">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {{ asc: ' 🔼', desc: ' 🔽' }[header.column.getIsSorted()] ?? null}
                            </div>
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} className="cursor-pointer hover:bg-white" onDoubleClick={() => handleRowDoubleClick(row.original)}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No results found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-4">
              <Pagination table={table} />
            </div>
          </div>
        </CardContent>
      </Card>

      {message && !initialLoading && (
        <Card className='mt-4 border-red-200 bg-red-50'>
          <CardContent className='p-4'>
            <p className='text-red-700 text-sm'>{message}</p>
          </CardContent>
        </Card>
      )}

      <UserEditDialog
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        editingRow={editingRow}
        handleInputChange={handleInputChange}
        handleUpdateData={handleUpdateData}
        masterLoading={loading}
        cities={cities}
      />

      <AddUserDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSubmit={handleAddUser}
        cities={cities}
      />
    </div>
  )
}

export default UsersPageClient