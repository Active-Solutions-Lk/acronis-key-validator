'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Textarea } from '@/components/ui/textarea'
// import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
// import {
//   IconSettings,
//   IconUser,
//   IconMail,
//   IconBell,
//   IconShield,
//   IconDatabase
// } from '@tabler/icons-react'
import { toast } from 'sonner'
// import { fetchSettings } from '@/app/actions/fetchSettings'
// import { updateSettings } from '@/app/actions/updateSettings'
import { EditAdminDialog } from '@/components/admin/EditAdminDialog'
import AllAdmins from '@/app/actions/allAdmins'
import { deleteAdmin } from '@/app/actions/deleteAdmin'
import { usePermissions } from '@/hooks/usePermissions'
import LogsTable from '@/components/admin/LogsTable'

// Define the Admin type
type Admin = {
  id: number
  user_name: string
  email: string
  department: string
  privilege: string
  sync: number
  created_at: Date
  updated_at: Date
}

export function SettingsPageClient () {
  // const [_activeTab, _setActiveTab] = useState('general')
  const [loading, setLoading] = useState(true)

  // Permission hooks
  const { 
    user, canView, canEdit
   } = usePermissions()

  // General settings state
  // const [siteName, setSiteName] = useState('Acronis Key Validator')
  // const [siteDescription, setSiteDescription] = useState(
  //   'License key validation system for Acronis products'
  // )
  // const [maintenanceMode, setMaintenanceMode] = useState(false)

  // Email settings state
  // const [smtpHost, setSmtpHost] = useState('smtp.example.com')
  // const [smtpPort, setSmtpPort] = useState('587')
  // const [smtpUser, setSmtpUser] = useState('')
  // const [smtpPassword, setSmtpPassword] = useState('')
  // const [fromEmail, setFromEmail] = useState('noreply@acronis.com')

  // Notification settings state
  // const [emailNotifications, setEmailNotifications] = useState(true)
  // const [syncNotifications, setSyncNotifications] = useState(true)
  // const [expiryNotifications, setExpiryNotifications] = useState(true)

  // Security settings state
  // const [twoFactorAuth, setTwoFactorAuth] = useState(false)
  // const [sessionTimeout, setSessionTimeout] = useState('30')
  // const [passwordMinLength, setPasswordMinLength] = useState('8')

  // Admin management state
  const [admins, setAdmins] = useState<Admin[]>([])
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [adminsLoading, setAdminsLoading] = useState(false)

  // Check if user can access settings
  const canViewSettings = canView('settings')
  const canEditSettings = canEdit('settings')

  // Debugging: Log user and permission information
  useEffect(() => {
   // console.log('SettingsClient - User:', user)
  //  console.log('SettingsClient - Can view settings:', canViewSettings)
  //  console.log('SettingsClient - Can edit settings:', canEditSettings)
  }, [user, canViewSettings, canEditSettings])

  // Load settings on component mount
  useEffect(() => {
    // If user can't view settings, don't load data
    if (!canViewSettings) {
      setLoading(false)
      return
    }

    loadSettings()
    loadAdmins()
  }, [canViewSettings])

  const loadSettings = async () => {
    try {
      // setLoading(true)
      // const result = await fetchSettings()

      // if (result.success && result.data) {
      //   // const settings = result.data
      //   // setSiteName(settings.site_name)
      //   // setSiteDescription(settings.site_description)
      //   // setMaintenanceMode(settings.maintenance_mode)
      //   // setSmtpHost(settings.smtp_host || 'smtp.example.com')
      //   // setSmtpPort(settings.smtp_port || '587')
      //   // setSmtpUser(settings.smtp_user || '')
      //   // setSmtpPassword(settings.smtp_password || '')
      //   // setFromEmail(settings.from_email || 'noreply@acronis.com')
      //   // setEmailNotifications(settings.email_notifications)
      //   // setSyncNotifications(settings.sync_notifications)
      //   // setExpiryNotifications(settings.expiry_notifications)
      //   // setTwoFactorAuth(settings.two_factor_auth)
      //   // setSessionTimeout(settings.session_timeout)
      //   // setPasswordMinLength(settings.password_min_length)
      // }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const loadAdmins = async () => {
    try {
      setAdminsLoading(true)
      const result = await AllAdmins()

      if (result.success) {
        setAdmins(result.admins || [])
      } else {
        toast.error(result.error || 'Failed to load admins')
      }
    } catch (error) {
      console.error('Error loading admins:', error)
      toast.error('Failed to load admins')
    } finally {
      setAdminsLoading(false)
    }
  }

  // const _handleSaveGeneral = async () => {
  //   // Check if user has permission to edit settings
  //   if (!canEditSettings) {
  //     toast.error('You do not have permission to edit settings')
  //     return
  //   }

  //   try {
  //     const settingsData = {
  //       siteName,
  //       siteDescription,
  //       maintenanceMode
  //     }

  //     const result = await updateSettings(settingsData)

  //     if (result.success) {
  //       toast.success('General settings saved successfully')
  //     } else {
  //       toast.error(result.error || 'Failed to save general settings')
  //     }
  //   } catch (error) {
  //     console.error('Error saving general settings:', error)
  //     toast.error('Failed to save general settings')
  //   }
  // }

  // const _handleSaveEmail = async () => {
  //   // Check if user has permission to edit settings
  //   if (!canEditSettings) {
  //     toast.error('You do not have permission to edit settings')
  //     return
  //   }

  //   try {
  //     const settingsData = {
  //       smtpHost,
  //       smtpPort,
  //       smtpUser,
  //       smtpPassword,
  //       fromEmail
  //     }

  //     const result = await updateSettings(settingsData)

  //     if (result.success) {
  //       toast.success('Email settings saved successfully')
  //     } else {
  //       toast.error(result.error || 'Failed to save email settings')
  //     }
  //   } catch (error) {
  //     console.error('Error saving email settings:', error)
  //     toast.error('Failed to save email settings')
  //   }
  // }

  // const _handleSaveNotifications = async () => {
  //   // Check if user has permission to edit settings
  //   if (!canEditSettings) {
  //     toast.error('You do not have permission to edit settings')
  //     return
  //   }

  //   try {
  //     const settingsData = {
  //       emailNotifications,
  //       syncNotifications,
  //       expiryNotifications
  //     }

  //     const result = await updateSettings(settingsData)

  //     if (result.success) {
  //       toast.success('Notification settings saved successfully')
  //     } else {
  //       toast.error(result.error || 'Failed to save notification settings')
  //     }
  //   } catch (error) {
  //     console.error('Error saving notification settings:', error)
  //     toast.error('Failed to save notification settings')
  //   }
  // }

  // const _handleSaveSecurity = async () => {
  //   // Check if user has permission to edit settings
  //   if (!canEditSettings) {
  //     toast.error('You do not have permission to edit settings')
  //     return
  //   }

  //   try {
  //     const settingsData = {
  //       twoFactorAuth,
  //       sessionTimeout,
  //       passwordMinLength
  //     }

  //     const result = await updateSettings(settingsData)

  //     if (result.success) {
  //       toast.success('Security settings saved successfully')
  //     } else {
  //       toast.error(result.error || 'Failed to save security settings')
  //     }
  //   } catch (error) {
  //     console.error('Error saving security settings:', error)
  //     toast.error('Failed to save security settings')
  //   }
  // }

  // const _handleSaveAdmin = async () => {
  //   // Check if user has permission to edit settings
  //   if (!canEditSettings) {
  //     toast.error('You do not have permission to edit settings')
  //     return
  //   }

  //   try {
  //     // This would be implemented with actual admin management logic
  //     toast.success('Admin settings saved successfully')
  //   } catch (error) {
  //     console.error('Error saving admin settings:', error)
  //     toast.error('Failed to save admin settings')
  //   }
  // }

  const handleAddAdmin = () => {
    // Check if user has permission to edit settings
    if (!canEditSettings) {
      toast.error('You do not have permission to add admins')
      return
    }

    setEditingAdmin(null)
    setIsEditDialogOpen(true)
  }

  const handleEditAdmin = (admin: Admin) => {
    // Check if user has permission to edit settings
    if (!canEditSettings) {
      toast.error('You do not have permission to edit admins')
      return
    }

    setEditingAdmin(admin)
    setIsEditDialogOpen(true)
  }

  const handleDeleteAdmin = async (adminId: number) => {
    // Check if user has permission to edit settings
    if (!canEditSettings) {
      toast.error('You do not have permission to delete admins')
      return
    }

    if (!confirm('Are you sure you want to delete this admin?')) {
      return
    }

    try {
      const result = await deleteAdmin(adminId)

      if (result.success) {
        toast.success('Admin deleted successfully')
        // Reload the admins list
        loadAdmins()
      } else {
        toast.error(result.error || 'Failed to delete admin')
      }
    } catch (error) {
      console.error('Error deleting admin:', error)
      toast.error('Failed to delete admin')
    }
  }

  const _handleSaveAdminDialog = async (_adminData: Admin) => {
    // Check if user has permission to edit settings
    if (!canEditSettings) {
      toast.error('You do not have permission to save admins')
      return
    }

    try {
      // Reload the admins list
      loadAdmins()
    } catch (error) {
      console.error('Error saving admin:', error)
      toast.error('Failed to save admin')
    }
  }

  // If user can't view settings, show access denied message
  if (!canViewSettings) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold mb-2'>Access Denied</h2>
          <p>You don&apos;t have permission to view this page.</p>
          {/* Debug information */}
          <div className='mt-4 p-4 bg-gray-100 rounded'>
            <p className='text-sm text-gray-600'>Debug Info:</p>
            <p className='text-sm text-gray-600'>
              User:{' '}
              {user
                ? `${user.user_name} (${user.privilege} in ${user.department})`
                : 'No user data'}
            </p>
            <p className='text-sm text-gray-600'>
              Can view settings: {canViewSettings ? 'Yes' : 'No'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center h-full'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl ps-2 font-bold'>Settings</h1>
          {/* <p className='text-muted-foreground'>
            Manage system configuration and preferences
          </p> */}
        </div>
      </div>

      <Tabs defaultValue='admins' className='space-y-2 ps-2'>
        <TabsList>
          <TabsTrigger value='admins'>Admin Management</TabsTrigger>
          <TabsTrigger value='logs'>System Logs</TabsTrigger>
          {/* <TabsTrigger value="settings">Settings</TabsTrigger> */}
        </TabsList>

        <TabsContent value='admins' className='space-y-2'>
          <Card className='p-1 pb-4 m-0 border-0 shadow-0 ' >
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>Admin Management</CardTitle>
                  <CardDescription>
                    Manage administrator accounts and permissions
                  </CardDescription>
                </div>
                <div className='pt-4'>
                  <Button onClick={handleAddAdmin} disabled={!canEditSettings}>
                    {canEditSettings
                      ? 'Add New Admin'
                      : 'No Permission to Add Admin'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='rounded-md border'>
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead className='bg-muted'>
                      <tr>
                        <th className='px-4 py-2 text-left text-sm font-medium'>
                          Username
                        </th>
                        <th className='px-4 py-2 text-left text-sm font-medium'>
                          Email
                        </th>
                        <th className='px-4 py-2 text-left text-sm font-medium'>
                          Department
                        </th>
                        <th className='px-4 py-2 text-left text-sm font-medium'>
                          Privilege
                        </th>
                        <th className='px-4 py-2 text-left text-sm font-medium'>
                          Sync
                        </th>
                        <th className='px-4 py-2 text-left text-sm font-medium'>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {adminsLoading ? (
                        <tr>
                          <td colSpan={6} className='px-4 py-2 text-center'>
                            <div className='flex items-center justify-center'>
                              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2'></div>
                              Loading admins...
                            </div>
                          </td>
                        </tr>
                      ) : admins.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className='px-4 py-2 text-center text-muted-foreground'
                          >
                            No admins found
                          </td>
                        </tr>
                      ) : (
                        admins.map(admin => (
                          <tr key={admin.id} className='border-b'>
                            <td className='px-4 py-2 text-sm'>
                              {admin.user_name}
                            </td>
                            <td className='px-4 py-2 text-sm'>{admin.email}</td>
                            <td className='px-4 py-2 text-sm'>
                              {admin.department || '-'}
                            </td>
                            <td className='px-4 py-2 text-sm'>
                              <span className='inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800'>
                                {admin.privilege}
                              </span>
                            </td>
                            <td className='px-4 py-2 text-sm'>
                              {admin.sync ? (
                                <span className='inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800'>
                                  Enabled
                                </span>
                              ) : (
                                <span className='inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800'>
                                  Disabled
                                </span>
                              )}
                            </td>
                            <td className='px-4 py-2 text-sm'>
                              <Button
                                variant='outline'
                                size='sm'
                                className='mr-2'
                                onClick={() => handleEditAdmin(admin)}
                                disabled={!canEditSettings}
                              >
                                Edit
                              </Button>
                              <Button
                                variant='destructive'
                                size='sm'
                                onClick={() => handleDeleteAdmin(admin.id)}
                                disabled={!canEditSettings}
                              >
                                Remove
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='logs' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>
                View system activity and audit logs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LogsTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EditAdminDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        admin={editingAdmin}
        onSave={_handleSaveAdminDialog}
      />
    </div>
  )
}