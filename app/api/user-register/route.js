import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const { customer, address, name, email, tel, city, code, actDate, endDate } = await request.json();

    if (!name || !email) {
      return new Response(
        JSON.stringify({ success: false, error: 'Name and email are required' }),
        { status: 400 }
      );
    }

    if (!code) {
      return new Response(
        JSON.stringify({ success: false, error: 'Code is required' }),
        { status: 400 }
      );
    }

    const record = await prisma.master.update({
      where: { password: code },
      data: {
        customer: customer || null,
        address: address || null,
        name: name || null,
        email: email || null,
        tel: tel ? parseInt(tel, 10) : null,
        city: city || null,
        actDate: actDate ? new Date(actDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        updated_at: new Date(),
      },
    });

    if (!record) {
      return new Response(
        JSON.stringify({ success: false, error: 'No record found for the provided code' }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'User data updated successfully' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('API error:', {
      error: error.message,
      stack: error.stack,
      requestData: await request.json().catch(() => ({})),
      timestamp: new Date().toISOString(),
    });
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Server error' }),
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}