'use server';

import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { code } = await request.json();

    // Validate required fields
    if (!code) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Code is required' 
        }), 
        { status: 400 }
      );
    }

    // Fetch credential record that matches the provided code
    // Include sales and reseller information
    const credential = await prisma.credentials.findFirst({
      where: {
        code: code
      },
      select: {
        user_id: true,
        sales: {
          select: {
            reseller_id: true
          },
          take: 1 // Get only the first sale record if multiple exist
        }
      }
    });

    if (!credential) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No credential found with the provided code' 
        }), 
        { status: 404 }
      );
    }

    // Extract reseller_id from the first sale record if it exists
    const reseller_id = credential.sales && credential.sales.length > 0 
      ? credential.sales[0].reseller_id 
      : null;

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: credential.user_id,
        reseller_id: reseller_id,
        message: 'Data fetched successfully'
      }), 
      { status: 200 }
    );
  } catch (err) {
    console.error('API error:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Server error occurred while fetching data' 
      }), 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}