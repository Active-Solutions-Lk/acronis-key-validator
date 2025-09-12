"use client"
import * as React from "react"
import { 
  Plus, 
  Search, 
  Filter,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  ChevronDown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import DataFeed from '@/components/admin/DataFeed'

export default function CredentialsHeader({
  data,
  loading,
  error,
  refreshData,
  setIsAddDialogOpen,
  setIsFileUploadDialogOpen,
  globalFilter,
  setGlobalFilter,
  table,
  rowSelection,
  handleBulkDelete
  
}) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Credentials Management</h1>
          {loading && <p className="text-sm text-gray-500 mt-1">Loading credentials...</p>}
          {error && <p className="text-sm text-red-500 mt-1">Error: {error}</p>}
          {/* {!loading && !error && <p className="text-sm text-gray-500 mt-1">{data.length} credentials found</p>} */}
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={refreshData} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsFileUploadDialogOpen(true)} variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Credential
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between space-x-4">
        <div className="flex flex-1 items-center space-x-2">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search credentials..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(String(event.target.value))}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Filter className="mr-2 h-4 w-4" />
                View <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {Object.keys(rowSelection).length > 0 && (
          <Button variant="destructive" onClick={handleBulkDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Selected ({Object.keys(rowSelection).length})
          </Button>
        )}
      </div>
    </div>
  )
}