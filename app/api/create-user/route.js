'use server';

import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.email) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Name and email are required fields' 
        }), 
        { status: 400 }
      );
    }

    // Check if user with same email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email }
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'User with this email already exists' 
        }), 
        { status: 400 }
      );
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        company: body.company || null,
        tel: body.tel || 0,
        address: body.address || null,
        city: body.city ? parseInt(body.city) : null
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
        message: 'User created successfully',
        user: newUser
      }), 
      { status: 201 }
    );
  } catch (err) {
    console.error('API error:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Server error occurred while creating user' 
      }), 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}