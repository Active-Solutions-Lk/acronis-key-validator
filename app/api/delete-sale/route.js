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
          error: 'Sale ID is required' 
        }), 
        { status: 400 }
      );
    }

    // Check if sale exists
    const existingSale = await prisma.sales.findUnique({
      where: { 
        id: parseInt(id) 
      }
    });

    if (!existingSale) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Sale not found' 
        }), 
        { status: 404 }
      );
    }

    // Delete sale
    await prisma.sales.delete({
      where: {
        id: parseInt(id)
      }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Sale deleted successfully'
      }), 
      { status: 200 }
    );
  } catch (err) {
    console.error('API error:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Server error occurred while deleting sale' 
      }), 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}