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

    // // Convert code to integer since it's actually the ID
    // const credentialId = parseInt(code);
    
    // // Check if conversion was successful
    // if (isNaN(credentialId)) {
    //   return new Response(
    //     JSON.stringify({ success: false, error: 'Invalid code format. Code must be a number.' }),
    //     { status: 400 }
    //   );
    // }

    // First, find the credential record with the given id (not code)
    const credential = await prisma.credentials.findFirst({
      where: { code: code },
    });

    if (!credential) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid code provided' }),
        { status: 404 }
      );
    }

    // Create or update the user record
    // First try to find existing user by email
    let user = await prisma.user.findFirst({
      where: { email: email },
    });

    // Convert city to integer if provided
    let cityId = null;
    if (city) {
      cityId = parseInt(city);
      if (isNaN(cityId)) {
        cityId = null; // Reset to null if invalid
      }
    }

    // Convert tel to integer, making it required as per schema
    let telNumber = null;
    if (tel) {
      telNumber = parseInt(tel, 10);
      if (isNaN(telNumber)) {
        telNumber = 0; // Default to 0 if invalid, as tel is required in the schema
      }
    } else {
      telNumber = 0; // Default to 0 if not provided, as tel is required in the schema
    }

    if (user) {
      // Update existing user
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: name,
          company: customer || null,
          tel: telNumber, // Use the converted tel number
          address: address || null,
          city: cityId, // Use the converted city ID
          updated_at: new Date(),
        },
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          name: name,
          email: email,
          company: customer || null,
          tel: telNumber, // Use the converted tel number
          address: address || null,
          city: cityId, // Use the converted city ID
        },
      });
    }

    // Update the credential record to link it to the user
    const updatedCredential = await prisma.credentials.update({
      where: { id: credential.id },
      data: {
        user_id: user.id,
        actDate: actDate ? new Date(actDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        updated_at: new Date(),
      },
    });

    return new Response(
      JSON.stringify({ success: true, message: 'User data updated successfully' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('API error:', {
      error: error.message,
      stack: error.stack,
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