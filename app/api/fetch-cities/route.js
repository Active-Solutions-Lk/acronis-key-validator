'use server';

import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const cities = await prisma.sri_lanka_districts_cities.findMany({
      select: {
        id: true,
        district: true,
        city: true
      },
      orderBy: [
        { district: 'asc' },
        { city: 'asc' }
      ]
    });

    if (!cities || cities.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No cities found', 
          cities: [] 
        }), 
        { status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        cities: cities,
        total: cities.length
      }), 
      { status: 200 }
    );
  } catch (err) {
    console.error('API error:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Server error occurred while fetching cities' 
      }), 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}