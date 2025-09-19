"use client"
import * as React from "react"
import { 
  ArrowUpDown, 
  MoreHorizontal, 
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Check,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { usePermissions } from '@/hooks/usePermissions'

export function useCredentialsColumns({
  showPasswords,
  togglePasswordVisibility,
  editingCell,
  tempValue,
  setTempValue,
  saveInlineEdit,
  cancelInlineEdit,
  startInlineEdit,
  handleDeleteCredential,
  setEditingRow,
  setFormData,
  setIsEditDialogOpen
}) {
  const { canEdit, canDelete, canView } = usePermissions()
  
  const canEditCredentials = canEdit('credentials')
  const canDeleteCredentials = canDelete('credentials')

  return React.useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
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
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Serial
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("id")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Email
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const email = row.getValue("email")
        const isEditing = editingCell === `${row.original.id}-email`
        
        if (isEditing) {
          return (
            <div className="flex items-center space-x-2">
              <Input
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="h-8"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => saveInlineEdit(row.original.id, "email")}
                className="h-6 w-6 p-0"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={cancelInlineEdit}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )
        }
        
        return (
          <div 
            className="cursor-pointer hover:bg-gray-50 p-1 rounded truncate max-w-xs"
            onClick={() => canEditCredentials && startInlineEdit(row.original.id, "email", email)}
            title={email}
          >
            {email}
          </div>
        )
      },
    },
    {
      accessorKey: "password",
      header: "Password",
      cell: ({ row }) => {
        const password = row.getValue("password")
        const isVisible = showPasswords[row.original.id]
        const isEditing = editingCell === `${row.original.id}-password`
        
        if (isEditing) {
          return (
            <div className="flex items-center space-x-2">
              <Input
                type="password"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="h-8"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => saveInlineEdit(row.original.id, "password")}
                className="h-6 w-6 p-0"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={cancelInlineEdit}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )
        }
        
        return (
          <div className="flex items-center space-x-2">
            <div 
              className="cursor-pointer hover:bg-gray-50 p-1 rounded flex-1 truncate max-w-xs"
              onClick={() => canEditCredentials && startInlineEdit(row.original.id, "password", password)}
              title={password}
            >
              {isVisible ? password : "••••••••"}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => togglePasswordVisibility(row.original.id)}
              className="h-6 w-6 p-0"
            >
              {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        )
      },
    },
    {
      accessorKey: "pkg.name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Package
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const packageName = row.original.pkg?.name || "Unknown"
        return (
          <Badge variant="secondary" className="font-medium truncate max-w-xs" title={packageName}>
            {packageName}
          </Badge>
        )
      },
    },
    {
      accessorKey: "quota",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Quota
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const quota = row.getValue("quota")
        const isEditing = editingCell === `${row.original.id}-quota`
        
        if (isEditing) {
          return (
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="h-8 w-20"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => saveInlineEdit(row.original.id, "quota")}
                className="h-6 w-6 p-0"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={cancelInlineEdit}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )
        }
        
        return (
          <div 
            className="cursor-pointer hover:bg-gray-50 p-1 rounded text-right truncate max-w-xs"
            onClick={() => canEditCredentials && startInlineEdit(row.original.id, "quota", quota)}
            title={quota && typeof quota === 'number' ? quota.toLocaleString() : "—"}
          >
            {quota && typeof quota === 'number' ? quota.toLocaleString() : "—"}
          </div>
        )
      },
    },
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => {
        const code = row.getValue("code")
        const isEditing = editingCell === `${row.original.id}-code`
        
        if (isEditing) {
          return (
            <div className="flex items-center space-x-2">
              <Input
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="h-8 px-2"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={() => saveInlineEdit(row.original.id, "code")}
                className="h-6 w-6 p-0"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={cancelInlineEdit}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )
        }
        
        return (
          <div 
            className="cursor-pointer hover:bg-gray-50 p-1 rounded truncate max-w-xs"
            onClick={() => canEditCredentials && startInlineEdit(row.original.id, "code", code)}
            title={code}
          >
            {code ? (
              <Badge variant="outline">{code}</Badge>
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 px-2"
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const dateValue = row.getValue("created_at")
        if (!dateValue) {
          return <div className="text-sm text-gray-600">—</div>
        }
        const date = new Date(dateValue)
        return (
          <div className="text-sm text-gray-600">
            {date.toLocaleDateString()}
          </div>
        )
      },
    },
    {
      accessorKey: "user_id",
      header: "User",
      cell: ({ row }) => {
        const user = row.original.user;
        if (!user) {
          return <div className="text-gray-400">—</div>;
        }
        
        const userDisplay = user.name || user.email || user.id;
        
        return (
          <a 
            href={`/dashboard/users#${user.id}`} 
            className="text-gray-900 hover:underline truncate max-w-xs block"
            title={userDisplay}
          >
            {userDisplay}
          </a>
        );
      },
    },
    {
      accessorKey: "reseller_id",
      header: "Reseller",
      cell: ({ row }) => {
        const reseller = row.original.reseller;
        if (!reseller) {
          return <div className="text-gray-400">—</div>;
        }
        
        const resellerDisplay = reseller.company_name || reseller.customer_id;
        
        return (
          <a 
            href={`/dashboard/resellers#${reseller.customer_id}`} 
            className="text-gray-900 hover:underline truncate max-w-xs block"
            title={resellerDisplay}
          >
            {resellerDisplay}
          </a>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const credential = row.original

        // console.log("credential: ", credential)

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(credential.email)}
              >
                Copy email
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(credential.password)}
              >
                Copy password
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {canEditCredentials && (
                <DropdownMenuItem
                  onClick={() => {
                    setEditingRow(credential)
                    setFormData({
                      email: credential.email,
                      password: credential.password,
                      pkg_id: credential.pkg_id?.toString() || "",
                      quota: credential.quota?.toString() || "",
                      code: credential.code || "",
                      user_id: credential.user_id?.toString() || "",
                    })
                    setIsEditDialogOpen(true)
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edits
                </DropdownMenuItem>
              )}
              {canDeleteCredentials && (
                <DropdownMenuItem
                  onClick={() => handleDeleteCredential(credential.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [
    showPasswords,
    editingCell,
    tempValue,
    setTempValue,
    saveInlineEdit,
    cancelInlineEdit,
    startInlineEdit,
    togglePasswordVisibility,
    handleDeleteCredential,
    setEditingRow,
    setFormData,
    setIsEditDialogOpen,
    canEditCredentials,
    canDeleteCredentials
  ])
}