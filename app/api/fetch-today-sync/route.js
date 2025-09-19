// app/api/fetch-today-sync/route.js
'use server';

import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { startOfDay, endOfDay } = await request.json();

    if (!startOfDay || !endOfDay) {
      return new Response(
        JSON.stringify({ message: 'Date values are empty' }),
        { status: 400 }
      );
    }

    // Fetch sales within the date range with related data
    const sales = await prisma.sales.findMany({
      where: {
        OR: [
          {
            created_at: {
              gte: new Date(startOfDay),
              lte: new Date(endOfDay),
            },
          },
          {
            updated_at: {
              gte: new Date(startOfDay),
              lte: new Date(endOfDay),
            },
          },
        ],
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

    if (sales.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No sales found for the selected period' }),
        { status: 404 }
      );
    }

    // Transform data for spreadsheet
    const transformedSales = sales.map(sale => ({
      id: sale.id,
      reseller_id: sale.reseller_id,
      credentials_id: sale.credentials_id,
      created_at: sale.created_at,
      updated_at: sale.updated_at,
      reseller_company: sale.reseller?.company_name || 'N/A',
      reseller_district: sale.reseller?.sri_lanka_districts_cities?.district || 'N/A',
      reseller_city: sale.reseller?.sri_lanka_districts_cities?.city || 'N/A',
      credential_email: sale.credentials?.email || 'N/A',
      credential_code: sale.credentials?.code || 'N/A',
      credential_quota: sale.credentials?.quota || 'N/A',
      package_name: sale.credentials?.pkg?.name || 'N/A',
      user_name: sale.credentials?.user?.name || 'N/A',
      user_email: sale.credentials?.user?.email || 'N/A',
      user_city: sale.credentials?.user?.sri_lanka_districts_cities?.city || 'N/A'
    }));

    return new Response(
      JSON.stringify({
        message: 'Sales found for the selected period',
        data: transformedSales,
        status: 200,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching sales:', error);
    return new Response(JSON.stringify({ message: 'Server error' }), {
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
}