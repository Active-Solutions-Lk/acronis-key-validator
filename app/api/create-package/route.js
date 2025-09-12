'use server';

import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { name, duration } = await request.json();

    // Validate required fields
    if (!name) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Package name is required' 
        }), 
        { status: 400 }
      );
    }

    // Check if package with same name already exists
    const existingPackage = await prisma.pkg.findFirst({
      where: { 
        name: name 
      }
    });

    if (existingPackage) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Package with this name already exists' 
        }), 
        { status: 400 }
      );
    }

    // Create new package
    const newPackage = await prisma.pkg.create({
      data: {
        name,
        duration: duration || null
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        package: newPackage,
        message: 'Package created successfully'
      }), 
      { status: 201 }
    );
  } catch (err) {
    console.error('API error:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Server error occurred while creating package' 
      }), 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}