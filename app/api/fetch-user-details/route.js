'use server';

import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'User ID is required' 
        }), 
        { status: 400 }
      );
    }

    // Fetch detailed user data with all relationships
    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        sri_lanka_districts_cities: true,
        credentials: {
          include: {
            pkg: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    // Check if user exists
    if (!user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'User not found' 
        }), 
        { status: 404 }
      );
    }

    // Transform data to match frontend expectations
    const transformedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      company: user.company,
      tel: user.tel,
      address: user.address,
      city: user.city,
      sri_lanka_districts_cities: user.sri_lanka_districts_cities,
      credentials: user.credentials,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    // Return user details
    return new Response(
      JSON.stringify({ 
        success: true, 
        user: transformedUser
      }), 
      { status: 200 }
    );
  } catch (err) {
    console.error('API error:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Server error occurred while fetching user details' 
      }), 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}