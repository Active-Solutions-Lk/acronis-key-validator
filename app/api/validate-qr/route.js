'use server';

import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return new Response(
        JSON.stringify({ message: 'Code is required' }),
        { status: 400 }
      );
    }

    const record = await prisma.master.findFirst({
      where: { code: code },
    });

    if (!record) {
      return new Response(
        JSON.stringify({ message: 'Invalid code' }),
        { status: 404 }
      );
    }

    if (record.email && record.email.trim() !== '') {
      return new Response(
        JSON.stringify({ message: 'This QR code has already been used' }),
        { status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Code validated successfully', data: record, status: 200 }),
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