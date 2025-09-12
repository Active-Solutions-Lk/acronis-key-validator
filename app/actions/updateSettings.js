'use server'

import prisma from '@/lib/prisma'

export async function updateSettings(settingsData) {
  try {
    // Check if settings exist
    const existingSettings = await prisma.settings.findFirst()
    
    let updatedSettings
    
    if (existingSettings) {
      // Update existing settings
      updatedSettings = await prisma.settings.update({
        where: { id: existingSettings.id },
        data: {
          site_name: settingsData.siteName,
          site_description: settingsData.siteDescription,
          maintenance_mode: settingsData.maintenanceMode,
          smtp_host: settingsData.smtpHost,
          smtp_port: settingsData.smtpPort,
          smtp_user: settingsData.smtpUser,
          smtp_password: settingsData.smtpPassword,
          from_email: settingsData.fromEmail,
          email_notifications: settingsData.emailNotifications,
          sync_notifications: settingsData.syncNotifications,
          expiry_notifications: settingsData.expiryNotifications,
          two_factor_auth: settingsData.twoFactorAuth,
          session_timeout: settingsData.sessionTimeout,
          password_min_length: settingsData.passwordMinLength,
          updated_at: new Date()
        }
      })
    } else {
      // Create new settings
      updatedSettings = await prisma.settings.create({
        data: {
          site_name: settingsData.siteName,
          site_description: settingsData.siteDescription,
          maintenance_mode: settingsData.maintenanceMode,
          smtp_host: settingsData.smtpHost,
          smtp_port: settingsData.smtpPort,
          smtp_user: settingsData.smtpUser,
          smtp_password: settingsData.smtpPassword,
          from_email: settingsData.fromEmail,
          email_notifications: settingsData.emailNotifications,
          sync_notifications: settingsData.syncNotifications,
          expiry_notifications: settingsData.expiryNotifications,
          two_factor_auth: settingsData.twoFactorAuth,
          session_timeout: settingsData.sessionTimeout,
          password_min_length: settingsData.passwordMinLength
        }
      })
    }
    
    return { success: true, data: updatedSettings }
  } catch (error) {
    console.error('Error updating settings:', error)
    return { success: false, error: 'Failed to update settings' }
  }
}
