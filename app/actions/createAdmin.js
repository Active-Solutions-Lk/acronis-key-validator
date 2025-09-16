'use server'

import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function createAdmin(adminData) {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminData.password, 10)
    
    // Prepare the data object
    const data = {
      user_name: adminData.user_name,
      email: adminData.email,
      password: hashedPassword,
      sync: parseInt(adminData.sync)
    }
    
    // Conditionally add department and privilege if they exist in the data
    if (adminData.department !== undefined) {
      data.department = adminData.department;
    }
    
    if (adminData.privilege !== undefined) {
      data.privilege = adminData.privilege;
    }
    
    // Create the admin
    const admin = await prisma.admin.create({ data })

    return { success: true, data: admin }
  } catch (error) {
    console.error('Error creating admin:', error)
    
    // Handle specific errors
    if (error.code === 'P2002') {
      // Unique constraint violation
      if (error.meta?.target?.includes('user_name')) {
        return { success: false, error: 'Username already exists' }
      }
      if (error.meta?.target?.includes('email')) {
        return { success: false, error: 'Email already exists' }
      }
    }
    
    return { success: false, error: 'Failed to create admin' }
  }
}