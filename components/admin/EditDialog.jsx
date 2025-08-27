// components/EditDialog.jsx
import React from 'react'
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

function EditDialog({
  isEditDialogOpen,
  setIsEditDialogOpen,
  editingRow,
  handleInputChange,
  handleUpdateData,
  masterLoading
}) {
  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Record</DialogTitle>
          <DialogDescription>
            Make changes to the record. Click update when you're done.
          </DialogDescription>
        </DialogHeader>
        {editingRow && (
          <div className="grid gap-4 py-4">
            <span className="text-xs text-gray-300">Seller Details</span>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="reseller">Reseller</Label>
                <Input
                  id="reseller"
                  value={editingRow.reseller || ''}
                  onChange={(e) => handleInputChange('reseller', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="hoDate">HO Date</Label>
                <Input
                  id="hoDate"
                  type="date"
                  value={editingRow.hoDate ? editingRow.hoDate.split('T')[0] : ''}
                  onChange={(e) => handleInputChange('hoDate', e.target.value)}
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
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="customer">Company</Label>
                <Input
                  id="customer"
                  value={editingRow.customer || ''}
                  onChange={(e) => handleInputChange('customer', e.target.value)}
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
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tel">Telephone</Label>
                <Input
                  id="tel"
                  type="number"
                  value={editingRow.tel || ''}
                  onChange={(e) => handleInputChange('tel', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={editingRow.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={editingRow.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={editingRow.date ? editingRow.date.split('T')[0] : ''}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-300">Package Details</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="pkg">Package</Label>
                <Input
                  id="pkg"
                  value={editingRow.package || ''}
                  onChange={(e) => handleInputChange('package', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="code">QR Code</Label>
                <Input
                  id="code"
                  value={editingRow.code || ''}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="accMail">Account Email</Label>
                <Input
                  id="accMail"
                  type="email"
                  value={editingRow.accMail || ''}
                  onChange={(e) => handleInputChange('accMail', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="text"
                  value={editingRow.password || ''}
                  onChange={(e) => handleInputChange('password', e.target.value)}
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
                  onChange={(e) => handleInputChange('actDate', e.target.value)}
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
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateData}>
                {masterLoading ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default EditDialog