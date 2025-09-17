// components/EditDialog.jsx
import React, { useMemo, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GenericCombobox } from '@/components/ui/generic-combobox';

function EditDialog({
  isEditDialogOpen,
  setIsEditDialogOpen,
  editingRow,
  handleInputChange,
  handleUpdateData,
  masterLoading,
  packages,
  resellers,
  credentials
}) {

  // console.log('fetched credentials', credentials)
  // Optimize data transformation with proper memoization
  const packageOptions = useMemo(() => {
    if (!packages || !Array.isArray(packages)) return []
    
    // Transform data only once and cache the result
    return packages.map(pkg => ({
      value: pkg.value || pkg.id || pkg,
      label: pkg.label || pkg.name || pkg
    }))
  }, [packages])
  
  const resellerOptions = useMemo(() => {
    if (!resellers || !Array.isArray(resellers)) return []
    
    // Transform data only once and cache the result
    return resellers.map(reseller => ({
      value: reseller.value || reseller.id || reseller,
      label: reseller.label || reseller.name || reseller
    }))
  }, [resellers])

  // Memoize credentials options for performance
  const accountEmailOptions = useMemo(() => {
    if (!credentials?.accountEmails || !Array.isArray(credentials.accountEmails)) return []
    return credentials.accountEmails
  }, [credentials?.accountEmails])
  
  const passwordOptions = useMemo(() => {
    if (!credentials?.passwords || !Array.isArray(credentials.passwords)) return []
    return credentials.passwords
  }, [credentials?.passwords])
  
  const qrCodeOptions = useMemo(() => {
    if (!credentials?.qrCodes || !Array.isArray(credentials.qrCodes)) return []
    return credentials.qrCodes
  }, [credentials?.qrCodes])

  // Memoize callback functions to prevent unnecessary re-renders
  const handleResellerChange = useCallback((value) => {
    handleInputChange('reseller', value)
  }, [handleInputChange])

  const handlePackageChange = useCallback((value) => {
    handleInputChange('package', value)
  }, [handleInputChange])

  const handleAccountEmailChange = useCallback((value) => {
    handleInputChange('accMail', value)
  }, [handleInputChange])
  
  const handlePasswordChange = useCallback((value) => {
    handleInputChange('password', value)
  }, [handleInputChange])
  
  const handleQRCodeChange = useCallback((value) => {
    handleInputChange('code', value)
  }, [handleInputChange])

  // Memoize input change handlers
  const handleFieldChange = useCallback((field) => (e) => {
    const value = field === 'tel' ? parseInt(e.target.value) || 0 : e.target.value
    handleInputChange(field, value)
  }, [handleInputChange])

  const handleDateChange = useCallback((field) => (e) => {
    handleInputChange(field, e.target.value)
  }, [handleInputChange])

  // Memoize dialog close handler
  const handleDialogClose = useCallback(() => {
    setIsEditDialogOpen(false)
  }, [setIsEditDialogOpen])

  // Don't render if no editing row
  if (!editingRow) {
    return null
  }

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Record</DialogTitle>
          <DialogDescription>
            Make changes to the record. Click update when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <span className="text-xs text-gray-300">Seller Details</span>
          <div className="grid grid-cols-2 gap-6">
            <div className="grid gap-2">
              <Label htmlFor="reseller">Reseller</Label>
              <GenericCombobox
                title="reseller"
                options={resellerOptions}
                value={editingRow.reseller || ''}
                onValueChange={handleResellerChange}
                placeholder="Select reseller..."
                searchPlaceholder="Search resellers..."
                // Add virtualization for large lists
                virtualizeOptions={resellerOptions.length > 100}
                // Add debounced search
                searchDebounceMs={300}
                className="w-2/3 min-w-full text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hoDate">HO Date</Label>
              <Input
                id="hoDate"
                type="date"
                value={editingRow.hoDate ? editingRow.hoDate.split('T')[0] : ''}
                onChange={handleDateChange('hoDate')}
              />
            </div>
          </div>
          
          <span className="text-xs text-gray-300">Customer Details</span>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editingRow.name || ''}
                onChange={handleFieldChange('name')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="customer">Company</Label>
              <Input
                id="customer"
                value={editingRow.customer || ''}
                onChange={handleFieldChange('customer')}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editingRow.email || ''}
                onChange={handleFieldChange('email')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tel">Telephone</Label>
              <Input
                id="tel"
                type="number"
                value={editingRow.tel || ''}
                onChange={handleFieldChange('tel')}
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={editingRow.address || ''}
              onChange={handleFieldChange('address')}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={editingRow.city || ''}
                onChange={handleFieldChange('city')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={editingRow.date ? editingRow.date.split('T')[0] : ''}
                onChange={handleDateChange('date')}
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-300">Package Details</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="pkg">Package</Label>
              <GenericCombobox
                title="package"
                options={packageOptions}
                value={editingRow.package || ''}
                onValueChange={handlePackageChange}
                placeholder="Select package..."
                searchPlaceholder="Search packages..."
                // Add virtualization for large lists
                virtualizeOptions={packageOptions.length > 100}
                // Add debounced search
                searchDebounceMs={300}
                className="w-2/3 min-w-full text-sm"

              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="code">QR Code</Label>
              <GenericCombobox
                title="qr code"
                options={qrCodeOptions}
                value={editingRow.code || ''}
                onValueChange={handleQRCodeChange}
                placeholder="Select QR code..."
                searchPlaceholder="Search QR codes..."
                virtualizeOptions={qrCodeOptions.length > 100}
                searchDebounceMs={300}
                className="w-2/3 min-w-full text-sm"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="accMail">Account Email</Label>
              <GenericCombobox
                title="account email"
                options={accountEmailOptions}
                value={editingRow.accMail || ''}
                onValueChange={handleAccountEmailChange}
                placeholder="Select account email..."
                searchPlaceholder="Search emails..."
                virtualizeOptions={accountEmailOptions.length > 100}
                searchDebounceMs={300}
                className="w-2/3 min-w-full text-sm"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <GenericCombobox
                title="password"
                options={passwordOptions}
                value={editingRow.password || ''}
                onValueChange={handlePasswordChange}
                placeholder="Select password..."
                searchPlaceholder="Search passwords..."
                virtualizeOptions={passwordOptions.length > 100}
                searchDebounceMs={300}
                className="w-2/3 min-w-full text-sm"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="grid gap-2">
              <Label htmlFor="actDate">Activation Date</Label>
              <Input
                id="actDate"
                type="datetime-local"
                value={
                  editingRow.actDate
                    ? new Date(editingRow.actDate).toISOString().slice(0, 16)
                    : ''
                }
                onChange={handleDateChange('actDate')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={
                  editingRow.endDate
                    ? new Date(editingRow.endDate).toISOString().slice(0, 16)
                    : ''
                }
                onChange={handleDateChange('endDate')}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={handleDialogClose}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateData} disabled={masterLoading}>
              {masterLoading ? 'Updating...' : 'Update'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Use React.memo to prevent unnecessary re-renders
export default React.memo(EditDialog)