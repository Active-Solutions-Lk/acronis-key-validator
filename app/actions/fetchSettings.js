'use server'

import prisma from '@/lib/prisma'

export async function fetchSettings() {
  try {
    // Try to fetch existing settings
    let settings = await prisma.settings.findFirst()
    
    // If no settings exist, create default settings
    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          site_name: "Acronis Key Validator",
          site_description: "License key validation system for Acronis products",
          maintenance_mode: false,
          email_notifications: true,
          sync_notifications: true,
          expiry_notifications: true,
          two_factor_auth: false,
          session_timeout: "30",
          password_min_length: "8"
        }
      })
    }
    
    return { success: true, data: settings }
  } catch (error) {
    console.error('Error fetching settings:', error)
    return { success: false, error: 'Failed to fetch settings' }
  }
}
