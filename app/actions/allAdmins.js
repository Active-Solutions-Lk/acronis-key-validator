'use server'

import prisma from '@/lib/prisma'

export default async function AllAdmins() {
  try {
    // First, let's check if the admin table has department and privilege columns
    // We'll try to select all fields and catch any errors
    let admins;
    
    try {
      admins = await prisma.admin.findMany({
        select: {
          id: true,
          user_name: true,
          email: true,
          department: true,
          privilege: true,
          sync: true,
          created_at: true,
          updated_at: true
        },
        orderBy: {
          created_at: 'desc'
        }
      });
    } catch {
      // If the above fails, it's likely because department/privilege don't exist
      // Fall back to selecting only the fields we know exist
      // console.log('Department/privilege fields not found, using fallback query');
      admins = await prisma.admin.findMany({
        select: {
          id: true,
          user_name: true,
          email: true,
          sync: true,
          created_at: true,
          updated_at: true
        },
        orderBy: {
          created_at: 'desc'
        }
      });
      
      // Add default values for missing fields
      admins = admins.map(admin => ({
        ...admin,
        department: '',
        privilege: 'admin'
      }));
    }

    if (!admins || admins.length === 0) {
      return { 
        success: true, 
        message: 'No admins found', 
        admins: [] 
      }
    }

    return { 
      success: true, 
      admins: admins,
      total: admins.length
    }
  } catch (err) {
    console.error('Server action error:', err)
    return { success: false, error: 'Failed to fetch all admins.' }
  }
}