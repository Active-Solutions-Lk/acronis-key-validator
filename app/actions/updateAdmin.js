'use server'

import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function updateAdmin(adminId, adminData) {
  try {
    // Prepare update data
    const updateData = {
      user_name: adminData.user_name,
      email: adminData.email,
      sync: parseInt(adminData.sync)
    }
    
    // Conditionally add department and privilege if they exist in the data
    if (adminData.department !== undefined) {
      updateData.department = adminData.department;
    }
    
    if (adminData.privilege !== undefined) {
      updateData.privilege = adminData.privilege;
    }
    
    // If password is provided, hash it
    if (adminData.password && adminData.password.length > 0) {
      updateData.password = await bcrypt.hash(adminData.password, 10)
    }
    
    // Update the admin
    const admin = await prisma.admin.update({
      where: { id: parseInt(adminId) },
      data: updateData
    })

    return { success: true, data: admin }
  } catch (error) {
    console.error('Error updating admin:', error)
    
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
    
    if (error.code === 'P2025') {
      // Record not found
      return { success: false, error: 'Admin not found' }
    }
    
    return { success: false, error: 'Failed to update admin' }
  }
}