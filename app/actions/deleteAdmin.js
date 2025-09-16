'use server'

import prisma from '@/lib/prisma'

export async function deleteAdmin(adminId) {
  try {
    // Delete the admin
    const admin = await prisma.admin.delete({
      where: { id: parseInt(adminId) }
    })

    return { success: true, data: admin }
  } catch (error) {
    console.error('Error deleting admin:', error)
    
    if (error.code === 'P2025') {
      // Record not found
      return { success: false, error: 'Admin not found' }
    }
    
    return { success: false, error: 'Failed to delete admin' }
  }
}