'use server';

import prisma from '@/lib/prisma';

export async function PUT(request) {
  try {
    const { id, name, duration } = await request.json();

    // Validate required fields
    if (!id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Package ID is required' 
        }), 
        { status: 400 }
      );
    }

    // Check if package exists
    const existingPackage = await prisma.pkg.findUnique({
      where: { 
        id: parseInt(id) 
      }
    });

    if (!existingPackage) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Package not found' 
        }), 
        { status: 404 }
      );
    }

    // Check if another package with same name already exists
    if (name) {
      const duplicatePackage = await prisma.pkg.findFirst({
        where: { 
          name: name,
          NOT: {
            id: parseInt(id)
          }
        }
      });

      if (duplicatePackage) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Package with this name already exists' 
          }), 
          { status: 400 }
        );
      }
    }

    // Update package
    const updatedPackage = await prisma.pkg.update({
      where: {
        id: parseInt(id)
      },
      data: {
        name: name || existingPackage.name,
        duration: duration !== undefined ? duration : existingPackage.duration
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        package: updatedPackage,
        message: 'Package updated successfully'
      }), 
      { status: 200 }
    );
  } catch (err) {
    console.error('API error:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Server error occurred while updating package' 
      }), 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}