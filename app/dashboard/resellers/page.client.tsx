'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { flexRender, getCoreRowModel, useReactTable, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, ColumnDef, SortingState } from '@tanstack/react-table'
import { Search, MoreHorizontal, Trash2, Edit, Plus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Checkbox } from '@/components/ui/checkbox'
import ResellerEditDialog from '@/components/admin/ResellerEditDialog'
import AddResellerDialog from '@/components/admin/AddResellerDialog'
import Pagination from '@/components/admin/Pagination'
import AllResellers from '../../actions/allResellers'
import AllCities from '../../actions/allCities'
import UpdateReseller from '../../actions/updateReseller'
import CreateReseller from '../../actions/createReseller'
import DeleteReseller, { BulkDeleteResellers } from '../../actions/deleteReseller'

// Define TypeScript interfaces
interface City {
  id: number
  district: string
  city: string
}

interface Reseller {
  customer_id: number
  company_name: string
  address: string | null
  type: string
  credit_limit: string | null
  payment_terms: string | null
  note: string | null
  vat: string | null
  city: number | null
  sri_lanka_districts_cities?: City | null
  created_at: string
  updated_at: string
}

interface CityOption {
  value: number
  label: string
  id?: number
  name?: string
}

interface AddFormData {
  company_name: string
  address: string
  type: string
  credit_limit: string
  payment_terms: string
  note: string
  vat: string
  city: string
}

const Table = ({ children, ...props }: { children: React.ReactNode } & React.HTMLAttributes<HTMLTableElement>) => <table className='w-full caption-bottom text-sm' {...props}>{children}</table>
const TableHeader = ({ children, ...props }: { children: React.ReactNode } & React.HTMLAttributes<HTMLTableSectionElement>) => <thead className='[&_tr]:border-b' {...props}>{children}</thead>
const TableBody = ({ children, ...props }: { children: React.ReactNode } & React.HTMLAttributes<HTMLTableSectionElement>) => <tbody className='[&_tr:last-child]:border-0' {...props}>{children}</tbody>
const TableRow = ({ children, className = '', ...props }: { children: React.ReactNode; className?: string } & React.HTMLAttributes<HTMLTableRowElement>) => <tr className={`border-b transition-colors hover:bg-muted/50 ${className}`} {...props}>{children}</tr>
const TableHead = ({ children, className = '', ...props }: { children: React.ReactNode; className?: string } & React.ThHTMLAttributes<HTMLTableCellElement>) => <th className={`h-12 px-2 text-left align-middle font-medium text-muted-foreground ${className}`} {...props}>{children}</th>
const TableCell = ({ children, className = '', ...props }: { children: React.ReactNode; className?: string } & React.TdHTMLAttributes<HTMLTableCellElement>) => <td className={`p-2 align-middle ${className}`} {...props}>{children}</td>
const Input = ({ className = '', ...props }: { className?: string } & React.InputHTMLAttributes<HTMLInputElement>) => <input className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${className}`} {...props} />

function ResellersPageClient() {
  const [message, setMessage] = useState<string>('')
  const [data, setData] = useState<Reseller[]>([])
  const [cities, setCities] = useState<CityOption[]>([])
  console.log('cities', cities)
  const [loading, setLoading] = useState<boolean>(false)
  const [initialLoading, setInitialLoading] = useState<boolean>(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState<string>('')
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({})
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false)
  const [editingRow, setEditingRow] = useState<Reseller | null>(null)
  const [addFormData, setAddFormData] = useState<AddFormData>({
    company_name: '',
    address: '',
    type: '',
    credit_limit: '',
    payment_terms: '',
    note: '',
    vat: '',
    city: ''
  })

  // Delete handlers
  const handleDeleteReseller = useCallback(async (id: number) => {
    try {
      const response = await DeleteReseller(id)
      if (response.success) {
        toast.success(response.message || 'Reseller deleted successfully')
        setData(prevData => prevData.filter(item => item.customer_id !== id))
      } else {
        toast.error(response.error || 'Failed to delete reseller')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete reseller. Please try again.')
    }
  }, [])

  // Define columns inside the component so they have access to state and handlers
  const columns: ColumnDef<Reseller>[] = [
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
    { accessorKey: 'customer_id', header: 'ID', cell: ({ row }) => <div className='w-12'>{row.getValue('customer_id')}</div>, enableSorting: true },
    { accessorKey: 'company_name', header: 'Company Name', cell: ({ row }) => <div className='min-w-[150px] font-medium'>{row.getValue('company_name')}</div>, enableSorting: true },
    { accessorKey: 'type', header: 'Type', cell: ({ row }) => <div className='min-w-[100px]'>{row.getValue('type')}</div>, enableSorting: true },
    { 
      accessorKey: 'city', 
      header: 'City', 
      cell: ({ row }) => {
        const cityData = row.original.sri_lanka_districts_cities
        return <div className='min-w-[100px]'>{cityData ? `${cityData.city}, ${cityData.district}` : '-'}</div>
      }, 
      enableSorting: true 
    },
    { accessorKey: 'address', header: 'Address', cell: ({ row }) => <div className='min-w-[120px]'>{row.getValue('address') || '-'}</div> },
    { accessorKey: 'credit_limit', header: 'Credit Limit', cell: ({ row }) => <div className='min-w-[100px]'>{row.getValue('credit_limit') || '-'}</div> },
    { accessorKey: 'vat', header: 'VAT Number', cell: ({ row }) => <div className='min-w-[80px]'>{row.getValue('vat') || '-'}</div> },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const reseller = row.original
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
                  setEditingRow({ ...reseller })
                  setIsEditDialogOpen(true)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteReseller(reseller.customer_id)}
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
    data, 
    columns, 
    onSortingChange: setSorting, 
    getCoreRowModel: getCoreRowModel(), 
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(), 
    getPaginationRowModel: getPaginationRowModel(), 
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString', 
    state: { sorting, globalFilter, rowSelection }, 
    enableRowSelection: true, 
    onRowSelectionChange: setRowSelection,
    initialState: { 
      pagination: { pageSize: 10 }, 
      sorting: [{ id: 'customer_id', desc: false }] 
    }
  })

  useEffect(() => {
    const fetchData = async () => {
      setInitialLoading(true)
      try {
        const [resellerResponse, citiesResponse] = await Promise.all([
          AllResellers(),
          AllCities()
        ])
        
        if (resellerResponse.success) {
          setData(resellerResponse.resellers)
        } else {
          setMessage(resellerResponse.error || 'Failed to fetch reseller data.')
          toast.error(resellerResponse.error || 'Failed to fetch reseller data.')
        }
        
        if (citiesResponse.success) {
          // Transform cities data for the combobox component
          const transformedCities: CityOption[] = citiesResponse.cities?.map((city: City) => ({
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

  const handleRowDoubleClick = (row: Reseller) => { setEditingRow({ ...row }); setIsEditDialogOpen(true) }
  
  const handleUpdateData = useCallback(async () => {
    if (!editingRow) return
    setLoading(true)
    try {
      const response = await UpdateReseller(editingRow.customer_id, editingRow)
      if (response.success) {
        toast.success(response.message || 'Reseller updated successfully')
        setData(prevData => prevData.map(item => item.customer_id === editingRow.customer_id ? { ...item, ...editingRow } : item))
        setIsEditDialogOpen(false)
        setEditingRow(null)
      } else {
        toast.error(response.error || 'Failed to update reseller')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update reseller. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [editingRow])

  const handleInputChange = (field: string, value: string) => { if (editingRow) setEditingRow(prev => ({ ...prev, [field]: value }) as Reseller) }

  const handleBulkDelete = useCallback(async () => {
    const selectedIds = Object.keys(rowSelection).map(index => data[parseInt(index)].customer_id)
    try {
      const response = await BulkDeleteResellers(selectedIds)
      if (response.success) {
        toast.success(response.message || `${response.deletedCount} reseller(s) deleted successfully`)
        setData(prevData => prevData.filter(item => !selectedIds.includes(item.customer_id)))
        setRowSelection({})
      } else {
        toast.error(response.error || 'Failed to delete resellers')
      }
    } catch (error) {
      console.error('Bulk delete error:', error)
      toast.error('Failed to delete resellers. Please try again.')
    }
  }, [rowSelection, data])

  // Add reseller handler
  const handleAddReseller = useCallback(async () => {
    try {
      if (!addFormData.company_name || !addFormData.type || !addFormData.city) {
        toast.error('Please fill in all required fields (Company Name, Type, City)')
        return
      }

      const response = await CreateReseller(addFormData)
      if (response.success) {
        toast.success(response.message || 'Reseller created successfully')
        setData(prevData => [response.reseller, ...prevData])
        setIsAddDialogOpen(false)
        setAddFormData({
          company_name: '',
          address: '',
          type: '',
          credit_limit: '',
          payment_terms: '',
          note: '',
          vat: '',
          city: ''
        })
      } else {
        toast.error(response.error || 'Failed to create reseller')
      }
    } catch (error) {
      console.error('Add error:', error)
      toast.error('Failed to create reseller. Please try again.')
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
                <Input placeholder="Search resellers..." value={globalFilter ?? ''} onChange={(e) => setGlobalFilter(String(e.target.value))} className="pl-8" />
              </div>
              <div className="flex items-center space-x-2">
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Reseller
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
                              {{ asc: ' 🔼', desc: ' 🔽' }[header.column.getIsSorted() as string] ?? null}
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

      <ResellerEditDialog
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        editingRow={editingRow}
        handleInputChange={handleInputChange}
        handleUpdateData={handleUpdateData}
        masterLoading={loading}
        cities={[]}
      />

      <AddResellerDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        formData={addFormData}
        setFormData={setAddFormData}
        onSubmit={handleAddReseller}
        cities={[]}
      />
    </div>
  )
}

export default ResellersPageClient