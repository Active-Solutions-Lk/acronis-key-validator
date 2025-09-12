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
          error: 'Credential ID is required' 
        }), 
        { status: 400 }
      );
    }

    // Fetch detailed credential data with all relationships
    const credential = await prisma.credentials.findUnique({
      where: {
        id: parseInt(id)
      },
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
        pkg: true,
        sales: {
          include: {
            reseller: {
              select: {
                customer_id: true,
                company_name: true
              }
            }
          }
        }
      }
    });

    // Check if credential exists
    if (!credential) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Credential not found' 
        }), 
        { status: 404 }
      );
    }

    // Transform data to match frontend expectations
    const transformedCredential = {
      id: credential.id,
      email: credential.email,
      password: credential.password,
      code: credential.code,
      quota: credential.quota,
      user: credential.user,
      pkg: credential.pkg,
      sales: credential.sales,
      created_at: credential.created_at,
      updated_at: credential.updated_at
    };

    // Return credential details
    return new Response(
      JSON.stringify({ 
        success: true, 
        credential: transformedCredential
      }), 
      { status: 200 }
    );
  } catch (err) {
    console.error('API error:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Server error occurred while fetching credential details' 
      }), 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}