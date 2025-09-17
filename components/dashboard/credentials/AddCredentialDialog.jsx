"use client"
import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { GenericCombobox } from '@/components/ui/generic-combobox';

export default function AddCredentialDialog({
  isOpen,
  onClose,
  formData,
  setFormData,
  packages,
  resellers,
  users,
  onSubmit
}) {
  // Transform resellers data for Combobox
  const resellerOptions = React.useMemo(() => 
    resellers?.map(reseller => ({
      value: reseller.customer_id.toString(),
      label: reseller.company_name
    })) || [], [resellers]
  )

  // Transform users data for Combobox
  const userOptions = React.useMemo(() => 
    users?.map(user => ({
      value: user.id.toString(),
      label: `${user.name} (${user.email})`
    })) || [], [users]
  )

  // Transform packages data for Combobox
  const packageOptions = React.useMemo(() => 
    packages?.map(pkg => ({
      value: pkg.id.toString(),
      label: pkg.name
    })) || [], [packages]
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Credential</DialogTitle>
          <DialogDescription>
            Create a new user credential entry.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              placeholder="Enter password"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Package</label>
            <GenericCombobox
              options={packageOptions}
              value={formData.pkg_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, pkg_id: value }))}
              placeholder="Select package"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Reseller</label>
            <GenericCombobox
              options={resellerOptions}
              value={formData.reseller_id || ""}
              onValueChange={(value) => setFormData(prev => ({ ...prev, reseller_id: value }))}
              placeholder="Select reseller"
            />
          </div>
          <div>
            <label className="text-sm font-medium">User</label>
            <GenericCombobox
              options={userOptions}
              value={formData.user_id || ""}
              onValueChange={(value) => setFormData(prev => ({ ...prev, user_id: value }))}
              placeholder="Select user"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Quota (optional)</label>
            <Input
              type="number"
              value={formData.quota}
              onChange={(e) => setFormData(prev => ({ ...prev, quota: e.target.value }))}
              placeholder="Enter quota limit"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Code (optional)</label>
            <Input
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              placeholder="Enter code"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            Add Credential
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}