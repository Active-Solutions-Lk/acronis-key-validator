'use server';

import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const records = await prisma.admin.findMany({
      where: {
        sync : 1,
      },
      select: {
        email: true,
      },
      distinct: ['email'], // Ensure unique emails
    });

    if (!records || records.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No email records found in the database',
        }),
        { status: 404 }
      );
    }

    // console.log('Emails fetched successfully:', records);

    return new Response(
      JSON.stringify({
        success: true,
        data: records,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('API error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Server error',
        message: error.message,
      }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}