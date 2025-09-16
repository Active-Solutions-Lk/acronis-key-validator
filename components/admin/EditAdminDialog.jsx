'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Eye, EyeOff } from 'lucide-react'
import { createAdmin } from '@/app/actions/createAdmin'
import { updateAdmin } from '@/app/actions/updateAdmin'

export function EditAdminDialog ({ open, onOpenChange, admin, onSave }) {
  const [formData, setFormData] = useState({
    user_name: '',
    email: '',
    password: '',
    sync: '1',
    department: 'ACCOUNTS',
    privilege: 'admin'
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (admin) {
      setFormData({
        user_name: admin.user_name || '',
        email: admin.email || '',
        password: '',
        sync: admin.sync?.toString() || '1',
        department: admin.department || 'ACCOUNTS',
        privilege: admin.privilege || 'admin'
      })
    } else {
      setFormData({
        user_name: '',
        email: '',
        password: '',
        sync: '1',
        department: 'ACCOUNTS',
        privilege: 'admin'
      })
    }
  }, [admin])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)

    try {
      let result

      if (admin) {
        // Update existing admin
        result = await updateAdmin(admin.id, formData)
      } else {
        // Create new admin
        result = await createAdmin(formData)
      }

      if (result.success) {
        toast.success(`Admin ${admin ? 'updated' : 'created'} successfully`)
        onSave(result.data)
        onOpenChange(false)
      } else {
        toast.error(
          result.error || `Failed to ${admin ? 'update' : 'create'} admin`
        )
      }
    } catch (error) {
      console.error(`Error ${admin ? 'updating' : 'creating'} admin:`, error)
      toast.error(`Failed to ${admin ? 'update' : 'create'} admin`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle>{admin ? 'Edit Admin' : 'Add New Admin'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='user_name'>Username</Label>
            <Input
              id='user_name'
              value={formData.user_name}
              onChange={e => handleChange('user_name', e.target.value)}
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              value={formData.email}
              onChange={e => handleChange('email', e.target.value)}
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='password'>
              {admin ? 'New Password' : 'Password'}
            </Label>
            <div className='relative'>
              <Input
                id='password'
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={e => handleChange('password', e.target.value)}
                {...(!admin && { required: true })}
              />
              <Button
                type='button'
                variant='ghost'
                size='icon'
                className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className='h-4 w-4 text-gray-500' />
                ) : (
                  <Eye className='h-4 w-4 text-gray-500' />
                )}
                <span className='sr-only'>
                  {showPassword ? 'Hide password' : 'Show password'}
                </span>
              </Button>
            </div>
          </div>

          <div className='flex items-start w-full justify-between gap-4'>
            <div className='space-y-2 flex-1 min-w-[120px]'>
              <Label htmlFor='department'>Department</Label>
              <Select
                value={formData.department}
                onValueChange={value => handleChange('department', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Select department' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ACCOUNTS'>ACCOUNTS</SelectItem>
                  <SelectItem value='TECHNICAL'>TECHNICAL</SelectItem>
                  <SelectItem value='MARKETING'>MARKETING</SelectItem>
                  <SelectItem value='ADMIN'>ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2 flex-1 min-w-[120px]'>
              <Label htmlFor='privilege'>Privilege</Label>
              <Select
                value={formData.privilege}
                onValueChange={value => handleChange('privilege', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Admin Level' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='admin'>Admin</SelectItem>
                  <SelectItem value='super_admin'>Super Admin</SelectItem>
                  <SelectItem value='viewer'>Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2 flex-1 min-w-[120px]'>
              <Label htmlFor='sync'>Sync Permission</Label>
              <Select
                value={formData.sync}
                onValueChange={value => handleChange('sync', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='1'>Enabled</SelectItem>
                  <SelectItem value='0'>Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='flex justify-end gap-2 pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
