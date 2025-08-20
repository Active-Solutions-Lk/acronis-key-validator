'use server';


import prisma from '@/lib/prisma';


export async function POST(request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return new Response(JSON.stringify({ success: false, error: 'Code is required' }), { status: 400 });
    }

    const record = await prisma.master.findFirst({
      where: { code: code }, // Check password field against input code
      select: { package: true },
    });

    if (!record) {
      return new Response(JSON.stringify({ success: false, error: 'No record found for the provided code' }), { status: 404 });
    }

    return new Response(JSON.stringify({ success: true, package: record.package }), { status: 200 });
  } catch (err) {
    console.error('API error:', err);
    return new Response(JSON.stringify({ success: false, error: 'Server error' }), { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}