'use server';

import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { id } = await request.json();
    const code = id;

    if (!code) {
      return new Response(
        JSON.stringify({ message: 'Code is required' }),
        { status: 400 }
      );
    }

    // Find the credential record with the given code
    const credential = await prisma.credentials.findFirst({
      where: { code: code },
      include: {
        pkg: true, // Include package information
        user: true, // Include user information directly (replaces master)
        sales: true // Include sales information to check for reseller association
      }
    });

    if (!credential) {
      return new Response(
        JSON.stringify({ message: 'Invalid code' }),
        { status: 404 }
      );
    }

    // Check if the credential has an associated reseller through sales
    if (!credential.sales || credential.sales.length === 0) {
      return new Response(
        JSON.stringify({ message: 'This code is not associated with any reseller' }),
        { status: 400 }
      );
    }

    // Check if the QR code has already been used (if there's already a user associated)
    if (credential.user) {
      return new Response(
        JSON.stringify({ message: 'This QR code has already been used' }),
        { status: 400 }
      );
    }

    // Return the credential data with related information
    const responseData = {
      id: credential.id,
      code: credential.code,
      email: credential.email,
      quota: credential.quota,
      pkg: credential.pkg,
      created_at: credential.created_at,
      updated_at: credential.updated_at
    };

    return new Response(
      JSON.stringify({ 
        message: 'Code validated successfully', 
        data: responseData, 
        status: 200 
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Validate QR API error:', error);
    return new Response(
      JSON.stringify({ 
        message: 'Server error',
        details: error.message || 'Internal Server Error'
      }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}