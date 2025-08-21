// app/api/validate-user/route.js

'use server';

import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { userName, password } = await request.json();

    if (!userName || !password) {
      return new Response(
        JSON.stringify({ message: ' Required data one or two is empty' }),
        { status: 400 }
      );
    }

    const record = await prisma.master.findUnique({
      where: { userName, password },
    });

    if (!record) {
      return new Response(
        JSON.stringify({ message: 'Invalid User Name or Password' }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ message: 'User validated successfully', data: record, status: 200 }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'Server error' }),
      { status: 500 },
      { details: error.message || 'Internal Server Error' }
    );
  } finally {
    await prisma.$disconnect();
  }
}