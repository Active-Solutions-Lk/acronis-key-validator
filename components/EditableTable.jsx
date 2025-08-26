// components/EditableTable.jsx
import React, { useState, useMemo } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel
} from '@tanstack/react-table'
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react'

// Shadcn Table Components
const Table = ({ children, ...props }) => (
  <table className='w-full caption-bottom text-sm' {...props}>
    {children}
  </table>
)

const TableHeader = ({ children, ...props }) => (
  <thead className='[&_tr]:border-b' {...props}>
    {children}
  </thead>
)

const TableBody = ({ children, ...props }) => (
  <tbody className='[&_tr:last-child]:border-0' {...props}>
    {children}
  </tbody>
)

const TableRow = ({ children, className = '', ...props }) => (
  <tr
    className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}
    {...props}
  >
    {children}
  </tr>
)

const TableHead = ({ children, className = '', ...props }) => (
  <th
    className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  >
    {children}
  </th>
)

const TableCell = ({ children, className = '', ...props }) => (
  <td
    className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  >
    {children}
  </td>
)

// Shadcn Dialog Components
const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null
  return (
    <div className='fixed inset-0 z-50 bg-transparent flex items-center justify-center p-4'>
      <div className='fixed inset-0' onClick={() => onOpenChange(false)} />
      <div className='relative bg-background border rounded-lg shadow-lg max-w-lg w-full'>
        {children}
      </div>
    </div>
  )
}

const DialogContent = ({ children, className = '', ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
)

const DialogHeader = ({ children, ...props }) => (
  <div
    className='flex flex-col space-y-1.5 text-center sm:text-left mb-4'
    {...props}
  >
    {children}
  </div>
)

const DialogTitle = ({ children, ...props }) => (
  <h2 className='text-lg font-semibold leading-none tracking-tight' {...props}>
    {children}
  </h2>
)

const DialogDescription = ({ children, ...props }) => (
  <p className='text-sm text-muted-foreground' {...props}>
    {children}
  </p>
)

// Shadcn Form Components
const Button = ({
  children,
  variant = 'default',
  size = 'default',
  className = '',
  disabled,
  ...props
}) => {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline:
      'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
  }
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3'
  }
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

const Input = ({ className = '', type = 'text', ...props }) => (
  <input
    type={type}
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
)

const Label = ({ children, className = '', ...props }) => (
  <label
    className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
    {...props}
  >
    {children}
  </label>
)

function EditableTable ({ masterDate, columns, onUpdateData, masterLoading }) {
  const [data, setData] = useState(masterDate)
  const [sorting, setSorting] = useState([])
  const [columnFilters, setColumnFilters] = useState([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingRow, setEditingRow] = useState(null)

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
  state: {
    sorting,
    columnFilters,
    globalFilter
  },
  initialState: {
    pagination: {
      pageSize: 3
    },
    sorting: [
      { id: 'id', asc: true }  // 👈 default sort by "id" descending
    ]
  }
})


  const handleRowDoubleClick = row => {
    setEditingRow({ ...row })
    setIsEditDialogOpen(true)
  }

  const handleUpdateData = () => {
    if (!editingRow) return
    // Update local state
    setData(prevData =>
      prevData.map(item =>
        item.id === editingRow.id
          ? { ...editingRow, updated_at: new Date().toISOString() }
          : item
      )
    )
    // Call the parent callback to update masterData in page.jsx
    onUpdateData(editingRow)
    setIsEditDialogOpen(false)
    setEditingRow(null)
  }

  const handleInputChange = (field, value) => {
    if (!editingRow) return
    const fieldMapping = {
      pkg: 'package' // Map "pkg" to "package"
      // Add other mappings if needed
    }
    const actualField = fieldMapping[field] || field

    setEditingRow(prev => ({
      ...prev,
      [actualField]: value
    }))
  }

  return (
    <div className='w-full space-y-4'>
      {/* Search Bar */}
      <div className='flex items-center justify-between space-x-2 pe-2'>
        <div className='relative justify-between items-between ps-3 flex-1 max-w-sm'>
          <Search className='absolute ms-2 mt-3 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search all columns...'
            value={globalFilter ?? ''}
            onChange={event => setGlobalFilter(String(event.target.value))}
            className='pl-8'
          />
        </div>
        <div className='text-sm text-muted-foreground pe-4'>
          {table.getFilteredRowModel().rows.length} of{' '}
          {table.getCoreRowModel().rows.length} row(s)
        </div>
      </div>

      {/* Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    className='font-xs cursor-pointer select-none'
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder ? null : (
                      <div className='flex items-center'>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {/* Sorting indicator */}
                        {{
                          asc: ' 🔼',
                          desc: ' 🔽'
                        }[header.column.getIsSorted()] ?? null}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onDoubleClick={() => handleRowDoubleClick(row.original)}
                  className='cursor-pointer hover:bg-white'
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className='flex items-center justify-between space-x-2 px-1 py-1'>
        <div className='text-sm text-muted-foreground'>
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className='h-4 w-4' />
          </Button>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>Edit Record</DialogTitle>
            <DialogDescription>
              Make changes to the record. Click update when you're done.
            </DialogDescription>
          </DialogHeader>
          {editingRow && (
            <div className='grid gap-4 py-4'>
              <span className='text-xs  text-gray-300'>Seller Details</span>
              <div className='grid grid-cols-2 gap-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='reseller'>Reseller</Label>
                  <Input
                    id='reseller'
                    value={editingRow.reseller || ''}
                    onChange={e =>
                      handleInputChange('reseller', e.target.value)
                    }
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='hoDate'>HO Date</Label>
                  <Input
                    id='hoDate'
                    type='date'
                    value={
                      editingRow.hoDate ? editingRow.hoDate.split('T')[0] : ''
                    }
                    onChange={e => handleInputChange('hoDate', e.target.value)}
                  />
                </div>
              </div>
              <span className='text-xs  text-gray-300'>Customer Details</span>
              <div className='grid grid-cols-2 gap-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='name'>Name</Label>
                  <Input
                    id='name'
                    value={editingRow.name || ''}
                    onChange={e => handleInputChange('name', e.target.value)}
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='customer'>Company</Label>
                  <Input
                    id='customer'
                    value={editingRow.customer || ''}
                    onChange={e =>
                      handleInputChange('customer', e.target.value)
                    }
                  />
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='email'>Email</Label>
                  <Input
                    id='email'
                    type='email'
                    value={editingRow.email || ''}
                    onChange={e => handleInputChange('email', e.target.value)}
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='tel'>Telephone</Label>
                  <Input
                    id='tel'
                    type='number'
                    value={editingRow.tel || ''}
                    onChange={e =>
                      handleInputChange('tel', parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='address'>Address</Label>
                <Input
                  id='address'
                  value={editingRow.address || ''}
                  onChange={e => handleInputChange('address', e.target.value)}
                />
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <div className='grid gap-2'>
                  <Label htmlFor='city'>City</Label>
                  <Input
                    id='city'
                    value={editingRow.city || ''}
                    onChange={e => handleInputChange('city', e.target.value)}
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='date'>Date</Label>
                  <Input
                    id='date'
                    type='date'
                    value={editingRow.date ? editingRow.date.split('T')[0] : ''}
                    onChange={e => handleInputChange('date', e.target.value)}
                  />
                </div>
              </div>
              <div className='flex justify-between items-center '>
                <span className='text-xs  text-gray-300'>Package Details</span>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='pkg'>Package</Label>
                  <Input
                    id='pkg'
                    value={editingRow.package || ''}
                    onChange={e => handleInputChange('package', e.target.value)}
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='code'>QR Code</Label>
                  <Input
                    id='code'
                    value={editingRow.code || ''}
                    onChange={e => handleInputChange('code', e.target.value)}
                  />
                </div>
              </div>
              <div className='grid grid-cols-2 gap-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='accMail'>Account Email</Label>
                  <Input
                    id='accMail'
                    type='email'
                    value={editingRow.accMail || ''}
                    onChange={e => handleInputChange('accMail', e.target.value)}
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='accMail'>Password</Label>
                  <Input
                    id='password'
                    type='text'
                    value={editingRow.password || ''}
                    onChange={e =>
                      handleInputChange('password', e.target.value)
                    }
                  />
                </div>
              </div>
              <div className='grid grid-cols-2 gap-2'>
                <div className='grid gap-2'>
                  <Label htmlFor='actDate'>Activation Date</Label>
                  <Input
                    id='actDate'
                    type='datetime-local'
                    value={
                      editingRow.actDate
                        ? new Date(editingRow.actDate)
                            .toISOString()
                            .slice(0, 16)
                        : ''
                    }
                    onChange={e => handleInputChange('actDate', e.target.value)}
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='endDate'>End Date</Label>
                  <Input
                    id='endDate'
                    type='datetime-local'
                    value={
                      editingRow.endDate
                        ? new Date(editingRow.endDate)
                            .toISOString()
                            .slice(0, 16)
                        : ''
                    }
                    onChange={e => handleInputChange('endDate', e.target.value)}
                  />
                </div>
              </div>
              <div className='flex justify-end space-x-2 pt-4'>
                <Button
                  variant='outline'
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateData}>
                  {masterLoading ? 'Updating...' : ' Update'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default EditableTable
