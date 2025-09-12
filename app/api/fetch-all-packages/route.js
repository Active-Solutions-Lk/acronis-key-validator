'use server';

import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch all packages with their details, ordered by creation date (newest first)
    const packages = await prisma.pkg.findMany({
      orderBy: {
        created_at: 'desc'
      },
      include: {
        credentials: {
          select: {
            id: true,
            email: true,
            quota: true,
            code: true
          }
        }
      }
    });

    // Check if any packages exist
    if (!packages || packages.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No packages found', 
          packages: [] 
        }), 
        { status: 200 }
      );
    }

    // Return all package details
    return new Response(
      JSON.stringify({ 
        success: true, 
        packages: packages,
        total: packages.length
      }), 
      { status: 200 }
    );
  } catch (err) {
    console.error('API error:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Server error occurred while fetching packages' 
      }), 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}