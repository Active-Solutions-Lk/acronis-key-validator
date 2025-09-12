'use server';

import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch all users with city information
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        company: true,
        tel: true,
        address: true,
        city: true,
        created_at: true,
        updated_at: true,
        sri_lanka_districts_cities: {
          select: {
            id: true,
            district: true,
            city: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Check if any users exist
    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No users found', 
          users: [] 
        }), 
        { status: 200 }
      );
    }

    // Return all user details
    return new Response(
      JSON.stringify({ 
        success: true, 
        users: users,
        total: users.length
      }), 
      { status: 200 }
    );
  } catch (err) {
    console.error('API error:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Server error occurred while fetching users' 
      }), 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}