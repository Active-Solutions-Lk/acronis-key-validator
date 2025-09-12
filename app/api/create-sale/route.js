'use server';

import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { reseller_id, credentials_id } = await request.json();

    // Validate required fields
    if (!reseller_id || !credentials_id) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Reseller ID and Credentials ID are required' 
        }), 
        { status: 400 }
      );
    }

    // Check if reseller exists
    const reseller = await prisma.reseller.findUnique({
      where: { 
        customer_id: parseInt(reseller_id) 
      }
    });

    if (!reseller) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Reseller not found' 
        }), 
        { status: 404 }
      );
    }

    // Check if credentials record exists
    const credentials = await prisma.credentials.findUnique({
      where: { 
        id: parseInt(credentials_id) 
      },
      include: {
        user: true
      }
    });

    if (!credentials) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Credentials record not found' 
        }), 
        { status: 404 }
      );
    }

    // Check if sale already exists
    const existingSale = await prisma.sales.findFirst({
      where: {
        reseller_id: parseInt(reseller_id),
        credentials_id: parseInt(credentials_id)
      }
    });

    if (existingSale) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Sale already exists for this reseller and credentials combination' 
        }), 
        { status: 400 }
      );
    }

    // Create new sale
    const newSale = await prisma.sales.create({
      data: {
        reseller_id: parseInt(reseller_id),
        credentials_id: parseInt(credentials_id)
      },
      include: {
        reseller: {
          select: {
            customer_id: true,
            company_name: true
          }
        },
        credentials: {
          include: {
            user: true
          }
        }
      }
    });

    // Transform data to match frontend expectations
    const transformedSale = {
      id: newSale.id,
      reseller_id: newSale.reseller_id,
      credentials_id: newSale.credentials_id,
      created_at: newSale.created_at,
      updated_at: newSale.updated_at,
      reseller: newSale.reseller,
      credentials: {
        id: newSale.credentials.id,
        customer: newSale.credentials.user?.company || newSale.credentials.user?.name || null,
        code: newSale.credentials.code || null
      }
    };

    return new Response(
      JSON.stringify({ 
        success: true, 
        sale: transformedSale,
        message: 'Sale created successfully'
      }), 
      { status: 201 }
    );
  } catch (err) {
    console.error('API error:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Server error occurred while creating sale' 
      }), 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}