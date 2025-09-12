'use server';

import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch all sales with related reseller and credentials data
    const sales = await prisma.sales.findMany({
      orderBy: {
        created_at: 'desc'
      },
      include: {
        reseller: {
          include: {
            sri_lanka_districts_cities: {
              select: {
                id: true,
                district: true,
                city: true
              }
            }
          }
        },
        credentials: {
          include: {
            user: {
              include: {
                sri_lanka_districts_cities: {
                  select: {
                    id: true,
                    district: true,
                    city: true
                  }
                }
              }
            },
            pkg: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    // Check if any sales exist
    if (!sales || sales.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No sales found', 
          sales: [] 
        }), 
        { status: 200 }
      );
    }

    // Transform data to match frontend expectations
    const transformedSales = sales.map(sale => ({
      id: sale.id,
      reseller_id: sale.reseller_id,
      credentials_id: sale.credentials_id,
      created_at: sale.created_at,
      updated_at: sale.updated_at,
      reseller: sale.reseller,
      credentials: {
        id: sale.credentials.id,
        email: sale.credentials.email,
        password: sale.credentials.password,
        code: sale.credentials.code,
        quota: sale.credentials.quota,
        pkg: sale.credentials.pkg,
        user: sale.credentials.user,
        created_at: sale.credentials.created_at
      }
    }));

    // Return all sales details
    return new Response(
      JSON.stringify({ 
        success: true, 
        sales: transformedSales,
        total: transformedSales.length
      }), 
      { status: 200 }
    );
  } catch (err) {
    console.error('API error:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Server error occurred while fetching sales' 
      }), 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}