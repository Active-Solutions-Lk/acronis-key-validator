"use client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Combobox } from "@/components/ui/combobox"

export default function AddResellerDialog({
  isOpen,
  onClose,
  formData,
  setFormData,
  onSubmit,
  cities = []
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Reseller</DialogTitle>
          <DialogDescription>
            Create a new reseller entry.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Company Name *</label>
              <Input
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                placeholder="Enter company name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Type *</label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Reseller">Reseller</SelectItem>
                  <SelectItem value="Distributor">Distributor</SelectItem>
                  <SelectItem value="Partner">Partner</SelectItem>
                  <SelectItem value="Agent">Agent</SelectItem>
                  <SelectItem value="Dealer">Dealer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Address</label>
            <Textarea
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Enter company address"
              rows={3}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">City *</label>
            <Combobox
              cities={cities || []}
              value={formData.city}
              onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
              placeholder="Select city..."
              searchPlaceholder="Search cities..."
              className="w-full"
              disabled={!cities || cities.length === 0}
            />
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Credit Limit</label>
              <Input
                value={formData.credit_limit}
                onChange={(e) => setFormData(prev => ({ ...prev, credit_limit: e.target.value }))}
                placeholder="Enter credit limit"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Payment Terms</label>
              <Input
                value={formData.payment_terms}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))}
                placeholder="Enter payment terms"
              />
            </div>
            <div>
              <label className="text-sm font-medium">VAT Number</label>
              <Input
                type="text"
                value={formData.vat}
                onChange={(e) => setFormData(prev => ({ ...prev, vat: e.target.value }))}
                placeholder="Enter VAT Number"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              value={formData.note}
              onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
              placeholder="Enter any additional notes"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            Add Reseller
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}