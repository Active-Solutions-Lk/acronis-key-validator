'use server';

import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch all credentials with package, user, and reseller relationship for better context
    const credentials = await prisma.credentials.findMany({
      select: {
        id: true,
        email: true,
        password: true,
        code: true,
        quota: true,
        user: {
          select: {
            id: true,
            name: true,
            company: true,
            email: true
          }
        },
        pkg: {
          select: {
            id: true,
            name: true
          }
        },
        sales: {
          select: {
            reseller: {
              select: {
                customer_id: true,
                company_name: true
              }
            }
          }
        },
        created_at: true
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    // Check if any credentials exist
    if (!credentials || credentials.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No credentials found', 
          credentials: [] 
        }), 
        { status: 200 }
      );
    }

    // Return all credentials details
    return new Response(
      JSON.stringify({ 
        success: true, 
        credentials: credentials,
        total: credentials.length
      }), 
      { status: 200 }
    );
  } catch (err) {
    console.error('API error:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Server error occurred while fetching credentials' 
      }), 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}