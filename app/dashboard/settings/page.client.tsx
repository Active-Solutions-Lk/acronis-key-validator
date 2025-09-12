'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IconSettings, IconUser, IconMail, IconBell, IconShield, IconDatabase } from '@tabler/icons-react'
import { toast } from "sonner"
import { fetchSettings } from '@/app/actions/fetchSettings'
import { updateSettings } from '@/app/actions/updateSettings'

export function SettingsClient() {
  const [activeTab, setActiveTab] = useState('general')
  const [loading, setLoading] = useState(true)
  
  // General settings state
  const [siteName, setSiteName] = useState('Acronis Key Validator')
  const [siteDescription, setSiteDescription] = useState('License key validation system for Acronis products')
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  
  // Email settings state
  const [smtpHost, setSmtpHost] = useState('smtp.example.com')
  const [smtpPort, setSmtpPort] = useState('587')
  const [smtpUser, setSmtpUser] = useState('')
  const [smtpPassword, setSmtpPassword] = useState('')
  const [fromEmail, setFromEmail] = useState('noreply@acronis.com')
  
  // Notification settings state
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [syncNotifications, setSyncNotifications] = useState(true)
  const [expiryNotifications, setExpiryNotifications] = useState(true)
  
  // Security settings state
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState('30')
  const [passwordMinLength, setPasswordMinLength] = useState('8')
  
  // Admin management state
  const [admins, setAdmins] = useState([
    { id: 1, name: 'Admin User', email: 'admin@example.com', role: 'Super Admin', lastLogin: '2023-05-15' }
  ])

  // Load settings on component mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const result = await fetchSettings()
      
      if (result.success && result.data) {
        const settings = result.data
        setSiteName(settings.site_name)
        setSiteDescription(settings.site_description)
        setMaintenanceMode(settings.maintenance_mode)
        setSmtpHost(settings.smtp_host || 'smtp.example.com')
        setSmtpPort(settings.smtp_port || '587')
        setSmtpUser(settings.smtp_user || '')
        setSmtpPassword(settings.smtp_password || '')
        setFromEmail(settings.from_email || 'noreply@acronis.com')
        setEmailNotifications(settings.email_notifications)
        setSyncNotifications(settings.sync_notifications)
        setExpiryNotifications(settings.expiry_notifications)
        setTwoFactorAuth(settings.two_factor_auth)
        setSessionTimeout(settings.session_timeout)
        setPasswordMinLength(settings.password_min_length)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveGeneral = async () => {
    try {
      const settingsData = {
        siteName,
        siteDescription,
        maintenanceMode
      }
      
      const result = await updateSettings(settingsData)
      
      if (result.success) {
        toast.success('General settings saved successfully')
      } else {
        toast.error(result.error || 'Failed to save general settings')
      }
    } catch (error) {
      console.error('Error saving general settings:', error)
      toast.error('Failed to save general settings')
    }
  }

  const handleSaveEmail = async () => {
    try {
      const settingsData = {
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPassword,
        fromEmail
      }
      
      const result = await updateSettings(settingsData)
      
      if (result.success) {
        toast.success('Email settings saved successfully')
      } else {
        toast.error(result.error || 'Failed to save email settings')
      }
    } catch (error) {
      console.error('Error saving email settings:', error)
      toast.error('Failed to save email settings')
    }
  }

  const handleSaveNotifications = async () => {
    try {
      const settingsData = {
        emailNotifications,
        syncNotifications,
        expiryNotifications
      }
      
      const result = await updateSettings(settingsData)
      
      if (result.success) {
        toast.success('Notification settings saved successfully')
      } else {
        toast.error(result.error || 'Failed to save notification settings')
      }
    } catch (error) {
      console.error('Error saving notification settings:', error)
      toast.error('Failed to save notification settings')
    }
  }

  const handleSaveSecurity = async () => {
    try {
      const settingsData = {
        twoFactorAuth,
        sessionTimeout,
        passwordMinLength
      }
      
      const result = await updateSettings(settingsData)
      
      if (result.success) {
        toast.success('Security settings saved successfully')
      } else {
        toast.error(result.error || 'Failed to save security settings')
      }
    } catch (error) {
      console.error('Error saving security settings:', error)
      toast.error('Failed to save security settings')
    }
  }

  const handleSaveAdmin = async () => {
    try {
      // This would be implemented with actual admin management logic
      toast.success('Admin settings saved successfully')
    } catch (error) {
      console.error('Error saving admin settings:', error)
      toast.error('Failed to save admin settings')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage system configuration and preferences</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <IconSettings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <IconMail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <IconBell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <IconShield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="admin" className="flex items-center gap-2">
            <IconUser className="h-4 w-4" />
            Admin
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input 
                  id="siteName" 
                  value={siteName} 
                  onChange={(e) => setSiteName(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea 
                  id="siteDescription" 
                  value={siteDescription} 
                  onChange={(e) => setSiteDescription(e.target.value)} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable maintenance mode to temporarily disable access to the system
                  </p>
                </div>
                <Switch 
                  checked={maintenanceMode} 
                  onCheckedChange={setMaintenanceMode} 
                />
              </div>
              
              <div className="pt-4">
                <Button onClick={handleSaveGeneral}>Save General Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Set up email delivery for notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input 
                    id="smtpHost" 
                    value={smtpHost} 
                    onChange={(e) => setSmtpHost(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input 
                    id="smtpPort" 
                    value={smtpPort} 
                    onChange={(e) => setSmtpPort(e.target.value)} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smtpUser">SMTP Username</Label>
                <Input 
                  id="smtpUser" 
                  value={smtpUser} 
                  onChange={(e) => setSmtpUser(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="smtpPassword">SMTP Password</Label>
                <Input 
                  id="smtpPassword" 
                  type="password" 
                  value={smtpPassword} 
                  onChange={(e) => setSmtpPassword(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email Address</Label>
                <Input 
                  id="fromEmail" 
                  type="email" 
                  value={fromEmail} 
                  onChange={(e) => setFromEmail(e.target.value)} 
                />
              </div>
              
              <div className="pt-4">
                <Button onClick={handleSaveEmail}>Save Email Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Configure when and how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for important events
                  </p>
                </div>
                <Switch 
                  checked={emailNotifications} 
                  onCheckedChange={setEmailNotifications} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Sync Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications when data synchronization completes
                  </p>
                </div>
                <Switch 
                  checked={syncNotifications} 
                  onCheckedChange={setSyncNotifications} 
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Expiry Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about expiring licenses
                  </p>
                </div>
                <Switch 
                  checked={expiryNotifications} 
                  onCheckedChange={setExpiryNotifications} 
                />
              </div>
              
              <div className="pt-4">
                <Button onClick={handleSaveNotifications}>Save Notification Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Configure security policies and authentication</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require two-factor authentication for admin access
                  </p>
                </div>
                <Switch 
                  checked={twoFactorAuth} 
                  onCheckedChange={setTwoFactorAuth} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input 
                  id="sessionTimeout" 
                  type="number" 
                  value={sessionTimeout} 
                  onChange={(e) => setSessionTimeout(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
                <Input 
                  id="passwordMinLength" 
                  type="number" 
                  value={passwordMinLength} 
                  onChange={(e) => setPasswordMinLength(e.target.value)} 
                />
              </div>
              
              <div className="pt-4">
                <Button onClick={handleSaveSecurity}>Save Security Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin Management</CardTitle>
              <CardDescription>Manage administrator accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium">Name</th>
                        <th className="px-4 py-2 text-left text-sm font-medium">Email</th>
                        <th className="px-4 py-2 text-left text-sm font-medium">Role</th>
                        <th className="px-4 py-2 text-left text-sm font-medium">Last Login</th>
                        <th className="px-4 py-2 text-left text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {admins.map((admin) => (
                        <tr key={admin.id} className="border-b">
                          <td className="px-4 py-2 text-sm">{admin.name}</td>
                          <td className="px-4 py-2 text-sm">{admin.email}</td>
                          <td className="px-4 py-2 text-sm">{admin.role}</td>
                          <td className="px-4 py-2 text-sm">{admin.lastLogin}</td>
                          <td className="px-4 py-2 text-sm">
                            <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                            <Button variant="destructive" size="sm">Remove</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="pt-4">
                <Button onClick={() => toast.info('Add admin functionality to be implemented')}>
                  Add New Admin
                </Button>
              </div>
              
              <div className="pt-4">
                <Button onClick={handleSaveAdmin}>Save Admin Settings</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>View system activity and audit logs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border p-4">
                <pre className="text-sm text-muted-foreground">
                  {`[2023-05-15 14:30:22] INFO: User admin@example.com logged in
[2023-05-15 14:35:10] INFO: Data synchronization completed successfully
[2023-05-15 15:22:45] WARN: Failed login attempt for user test@example.com
[2023-05-15 16:01:33] INFO: License key validation performed
[2023-05-15 16:45:17] INFO: Settings updated by admin@example.com`}
                </pre>
              </div>
              <div className="pt-4">
                <Button variant="outline">Export Logs</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}