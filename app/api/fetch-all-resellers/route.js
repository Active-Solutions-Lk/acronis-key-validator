'use server';

import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch only essential reseller data for better performance
    const resellers = await prisma.reseller.findMany({
      select: {
        customer_id: true,
        company_name: true,
        address: true,
        type: true,
        credit_limit: true,
        payment_terms: true,
        note: true,
        vat: true,
        city: true,
        created_at: true,
        sri_lanka_districts_cities: {
          select: {
            id: true,
            district: true,
            city: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Check if any resellers exist
    if (!resellers || resellers.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No resellers found', 
          resellers: [] 
        }), 
        { status: 200 }
      );
    }

    // Return all reseller details
    return new Response(
      JSON.stringify({ 
        success: true, 
        resellers: resellers,
        total: resellers.length
      }), 
      { status: 200 }
    );
  } catch (err) {
    console.error('API error:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Server error occurred while fetching resellers' 
      }), 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}