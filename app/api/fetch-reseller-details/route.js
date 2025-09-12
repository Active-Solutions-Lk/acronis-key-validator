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
          error: 'Reseller ID is required' 
        }), 
        { status: 400 }
      );
    }

    // Fetch detailed reseller data with all relationships
    const reseller = await prisma.reseller.findUnique({
      where: {
        customer_id: parseInt(id)
      },
      include: {
        sri_lanka_districts_cities: true,
        sales: {
          include: {
            credentials: {
              select: {
                id: true,
                email: true,
                code: true
              }
            }
          }
        }
      }
    });

    // Check if reseller exists
    if (!reseller) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Reseller not found' 
        }), 
        { status: 404 }
      );
    }

    // Transform data to match frontend expectations
    const transformedReseller = {
      customer_id: reseller.customer_id,
      company_name: reseller.company_name,
      address: reseller.address,
      type: reseller.type,
      credit_limit: reseller.credit_limit,
      payment_terms: reseller.payment_terms,
      note: reseller.note,
      vat: reseller.vat,
      city: reseller.city,
      sri_lanka_districts_cities: reseller.sri_lanka_districts_cities,
      sales: reseller.sales,
      created_at: reseller.created_at,
      updated_at: reseller.updated_at
    };

    // Return reseller details
    return new Response(
      JSON.stringify({ 
        success: true, 
        reseller: transformedReseller
      }), 
      { status: 200 }
    );
  } catch (err) {
    console.error('API error:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Server error occurred while fetching reseller details' 
      }), 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}