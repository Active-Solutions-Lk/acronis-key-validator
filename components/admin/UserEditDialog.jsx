'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AllCities from '@/app/actions/allCities'

export default function UserEditDialog({ 
  isEditDialogOpen, 
  setIsEditDialogOpen, 
  editingRow, 
  handleInputChange, 
  handleUpdateData, 
  masterLoading,
  cities: propCities 
}) {
  const [cities, setCities] = useState(propCities || [])
  const [localEditingRow, setLocalEditingRow] = useState(editingRow)

  // Update local editing row when editingRow prop changes
  useEffect(() => {
    setLocalEditingRow(editingRow)
  }, [editingRow])

  // Fetch cities if not provided
  useEffect(() => {
    const fetchCities = async () => {
      if ((!propCities || propCities.length === 0) && isEditDialogOpen) {
        try {
          const response = await AllCities()
          if (response.success) {
            const transformedCities = response.cities?.map(city => ({
              value: city.id,
              label: `${city.city}, ${city.district}`,
              id: city.id,
              name: `${city.city}, ${city.district}`
            })) || []
            setCities(transformedCities)
          }
        } catch (error) {
          console.error('Error fetching cities:', error)
        }
      } else {
        setCities(propCities || [])
      }
    }
    
    if (isEditDialogOpen) {
      fetchCities()
    }
  }, [isEditDialogOpen, propCities])

  const handleChange = (field, value) => {
    setLocalEditingRow(prev => ({ ...prev, [field]: value }))
    if (handleInputChange) {
      handleInputChange(field, value)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleUpdateData()
  }

  return (
    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        {localEditingRow && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={localEditingRow.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Enter user name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={localEditingRow.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="Enter user email"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-company">Company</Label>
              <Input
                id="edit-company"
                value={localEditingRow.company || ''}
                onChange={(e) => handleChange('company', e.target.value)}
                placeholder="Enter company name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-tel">Phone Number</Label>
              <Input
                id="edit-tel"
                type="number"
                value={localEditingRow.tel || ''}
                onChange={(e) => handleChange('tel', e.target.value)}
                placeholder="Enter phone number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-address">Address</Label>
              <Textarea
                id="edit-address"
                value={localEditingRow.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Enter address"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-city">City</Label>
              <Select 
                onValueChange={(value) => handleChange('city', value)} 
                value={localEditingRow.city ? String(localEditingRow.city) : ''}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={String(city.id)}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={masterLoading}>
                {masterLoading ? 'Updating...' : 'Update User'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}