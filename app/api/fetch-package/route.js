'use server';

import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { code } = await request.json();

    if (!code) {
      return new Response(JSON.stringify({ success: false, error: 'Code is required' }), { status: 400 });
    }

    // Find the credential record with the given code and include package information
    const record = await prisma.credentials.findFirst({
      where: { code: code },
      include: {
        pkg: true // Include package information from the related pkg table
      }
    });

    if (!record) {
      return new Response(JSON.stringify({ success: false, error: 'No record found for the provided code' }), { status: 404 });
    }

    // Return the package name as a string to match the expected frontend format
    return new Response(JSON.stringify({ success: true, package: record.pkg?.name || null }), { status: 200 });
  } catch (err) {
    console.error('API error:', err);
    return new Response(JSON.stringify({ success: false, error: 'Server error' }), { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}