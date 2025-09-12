import React, { useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Combobox } from '@/components/ui/combobox'

function ResellerEditDialog({ isEditDialogOpen, setIsEditDialogOpen, editingRow, handleInputChange, handleUpdateData, masterLoading, cities = [] }) {
  const handleFieldChange = useCallback((field) => (e) => {
    const value = e.target.value
    handleInputChange(field, value)
  }, [handleInputChange])

  const handleSelectChange = useCallback((field) => (value) => {
    handleInputChange(field, value)
  }, [handleInputChange])

  const handleDialogClose = useCallback(() => {
    setIsEditDialogOpen(false)
  }, [setIsEditDialogOpen])

  if (!editingRow) return null

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Reseller</DialogTitle>
          <DialogDescription>Make changes to the reseller information.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="company_name">Company Name *</Label>
              <Input id="company_name" value={editingRow.company_name || ''} onChange={handleFieldChange('company_name')} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={editingRow.type || ''} onValueChange={handleSelectChange('type')}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Reseller">Reseller</SelectItem>
                  <SelectItem value="Distributor">Distributor</SelectItem>
                  <SelectItem value="Partner">Partner</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Textarea id="address" value={editingRow.address || ''} onChange={handleFieldChange('address')} placeholder="Address" />
          <div className="grid gap-2">
            <Label htmlFor="city">City *</Label>
            <Combobox
              cities={cities || []}
              value={editingRow.city || editingRow.sri_lanka_districts_cities?.id}
              onValueChange={handleSelectChange('city')}
              placeholder="Select city..."
              searchPlaceholder="Search cities..."
              className="w-full"
              disabled={!cities || cities.length === 0}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input id="credit_limit" value={editingRow.credit_limit || ''} onChange={handleFieldChange('credit_limit')} placeholder="Credit Limit" />
            <Input id="payment_terms" value={editingRow.payment_terms || ''} onChange={handleFieldChange('payment_terms')} placeholder="Payment Terms" />
            <Input id="vat" type="text" value={editingRow.vat || ''} onChange={handleFieldChange('vat')} placeholder="VAT Number" />
          </div>
          <Textarea id="note" value={editingRow.note || ''} onChange={handleFieldChange('note')} placeholder="Notes" />
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={handleDialogClose}>Cancel</Button>
            <Button onClick={handleUpdateData} disabled={masterLoading}>{masterLoading ? 'Updating...' : 'Update'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default React.memo(ResellerEditDialog)