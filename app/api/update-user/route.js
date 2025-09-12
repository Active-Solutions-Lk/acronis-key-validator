'use server';

import prisma from '@/lib/prisma';

export async function PUT(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.id) {
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
      where: { id: parseInt(body.id) }
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

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(body.id) },
      data: {
        name: body.name || existingUser.name,
        email: body.email || existingUser.email,
        company: body.company !== undefined ? body.company : existingUser.company,
        tel: body.tel !== undefined ? parseInt(body.tel) : existingUser.tel,
        address: body.address !== undefined ? body.address : existingUser.address,
        city: body.city !== undefined ? (body.city ? parseInt(body.city) : null) : existingUser.city,
        updated_at: new Date()
      },
      include: {
        sri_lanka_districts_cities: {
          select: {
            id: true,
            district: true,
            city: true
          }
        }
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User updated successfully',
        user: updatedUser
      }), 
      { status: 200 }
    );
  } catch (err) {
    console.error('API error:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Server error occurred while updating user' 
      }), 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}