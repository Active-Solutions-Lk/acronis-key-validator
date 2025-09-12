'use server';

import prisma from '@/lib/prisma';

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate required fields
    if (!id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'User ID is required' 
        }), 
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingUser) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'User not found' 
        }), 
        { status: 404 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id: parseInt(id) }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User deleted successfully'
      }), 
      { status: 200 }
    );
  } catch (err) {
    console.error('API error:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Server error occurred while deleting user' 
      }), 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}