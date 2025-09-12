'use server';

import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { codes } = await request.json();

    // Validate required fields
    if (!codes || !Array.isArray(codes) || codes.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Codes array is required' 
        }), 
        { status: 400 }
      );
    }

    // Convert codes to integers for ID comparison
    const credentialIds = codes.map(code => {
      const id = parseInt(code, 10);
      return isNaN(id) ? null : id;
    }).filter(id => id !== null);

    // Fetch credentials records that match the provided IDs
    const credentialsRecords = await prisma.credentials.findMany({
      where: {
        id: {
          in: credentialIds
        }
      },
      include: {
        user: true
      }
    });

    // Transform data to match frontend expectations
    const transformedRecords = credentialsRecords.map(record => ({
      id: record.id,
      customer: record.user?.company || record.user?.name || null,
      code: record.code || null
    }));

    return new Response(
      JSON.stringify({ 
        success: true, 
        masterRecords: transformedRecords,
        message: `Found ${transformedRecords.length} matching records`
      }), 
      { status: 200 }
    );
  } catch (err) {
    console.error('API error:', err);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Server error occurred while fetching credentials records' 
      }), 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}