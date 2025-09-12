'use server';

import prisma from '@/lib/prisma';

export async function DELETE(request) {
  try {
    const { id } = await request.json();

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

    // Check if package is being used by credentials
    const credentialsCount = await prisma.credentials.count({
      where: {
        pkg_id: parseInt(id)
      }
    });

    if (credentialsCount > 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Cannot delete package as it is being used by credentials' 
        }), 
        { status: 400 }
      );
    }

    // Delete package
    await prisma.pkg.delete({
      where: {
        id: parseInt(id)
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Package deleted successfully'
      }), 
      { status: 200 }
    );
  } catch (err) {
    console.error('API error:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Server error occurred while deleting package' 
      }), 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}