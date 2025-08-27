import React, { useState, useMemo } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel
} from '@tanstack/react-table'

import { Search } from 'lucide-react'
import EditDialog from './EditDialog'
import Pagination from './Pagination'

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

const TableRow = ({
  children,
  className = '',
  row,
  getRowHighlightClass = () => '',
  ...props
}) => (
  <tr
    className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${getRowHighlightClass(
      row?.original || {}
    )} ${className}`}
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
const Input = ({ className = '', type = 'text', ...props }) => (
  <input
    type={type}
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
)

function EditableTable({
  masterDate,
  columns,
  onUpdateData,
  masterLoading,
  getRowHighlightClass
}) {
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
        pageSize: 4
      },
      sorting: [{ id: 'id', asc: true }]
    }
  })

  const handleRowDoubleClick = (row) => {
    setEditingRow({ ...row })
    setIsEditDialogOpen(true)
  }

  const handleUpdateData = () => {
    if (!editingRow) return
    setData((prevData) =>
      prevData.map((item) =>
        item.id === editingRow.id
          ? { ...editingRow, updated_at: new Date().toISOString() }
          : item
      )
    )
    onUpdateData(editingRow)
    setIsEditDialogOpen(false)
    setEditingRow(null)
  }

  const handleInputChange = (field, value) => {
    if (!editingRow) return
    const fieldMapping = {
      pkg: 'package'
    }
    const actualField = fieldMapping[field] || field
    setEditingRow((prev) => ({
      ...prev,
      [actualField]: value
    }))
  }

  return (
    <div className="w-full space-y-1">
      {/* Search Bar */}
      <div className="flex items-center justify-between space-x-2 pe-2">
        <div className="relative justify-between items-between ps-3 flex-1 max-w-sm">
          <Search className="absolute ms-2 mt-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search all columns..."
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="pl-8"
          />
        </div>
        <div className="text-sm text-muted-foreground pe-4">
          {table.getFilteredRowModel().rows.length} of{' '}
          {table.getCoreRowModel().rows.length} row(s)
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="font-xs cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center">
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
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  onDoubleClick={() => handleRowDoubleClick(row.original)}
                  className="cursor-pointer hover:bg-white"
                  row={row}
                  getRowHighlightClass={getRowHighlightClass}
                >
                  {row.getVisibleCells().map((cell) => (
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
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <Pagination table={table} />
      
      {/* Edit Dialog */}
      <EditDialog
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        editingRow={editingRow}
        handleInputChange={handleInputChange}
        handleUpdateData={handleUpdateData}
        masterLoading={masterLoading}
      />
    </div>
  )
}

export default EditableTable