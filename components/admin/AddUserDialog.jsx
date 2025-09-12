'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AllCities from '@/app/actions/allCities'

export default function AddUserDialog({ isOpen, onClose, onSubmit, cities: propCities }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    tel: '',
    address: '',
    city: ''
  })
  const [cities, setCities] = useState(propCities || [])
  const [loading, setLoading] = useState(false)

  // Fetch cities if not provided
  useEffect(() => {
    const fetchCities = async () => {
      if (!propCities || propCities.length === 0) {
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
        setCities(propCities)
      }
    }
    
    if (isOpen) {
      fetchCities()
    }
  }, [isOpen, propCities])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(formData)
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = formData.name && formData.email

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter user name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Enter user email"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              placeholder="Enter company name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tel">Phone Number</Label>
            <Input
              id="tel"
              type="number"
              value={formData.tel}
              onChange={(e) => handleChange('tel', e.target.value)}
              placeholder="Enter phone number"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Enter address"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Select onValueChange={(value) => handleChange('city', value)} value={formData.city}>
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isFormValid || loading}>
              {loading ? 'Adding...' : 'Add User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}