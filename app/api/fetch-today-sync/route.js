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

    const records = await prisma.master.findMany({
      where: {
        OR: [
          {
            created_at: {
              gte: new Date(startOfDay),
              lte: new Date(endOfDay), // Use lte instead of lt to include end of day
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
    });

    if (records.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No records found for today' }),
        { status: 404 }
      );
    }

    // console.log('syncData', records);

    return new Response(
      JSON.stringify({
        message: 'Records found for today',
        data: records,
        status: 200,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching today’s records:', error);
    return new Response(JSON.stringify({ message: 'Server error' }), {
      status: 500,
    });
  } finally {
    await prisma.$disconnect();
  }
}