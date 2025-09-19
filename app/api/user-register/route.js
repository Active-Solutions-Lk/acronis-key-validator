import prisma from '@/lib/prisma';

// Function to parse duration string and calculate end date
function calculateEndDate(startDate, duration) {
  // Create a new date object to avoid modifying the original
  const endDate = new Date(startDate);
  
  // If duration is not provided, default to 1 year
  if (!duration) {
    endDate.setFullYear(endDate.getFullYear() + 1);
    return endDate;
  }
  
  // Handle numeric values directly (e.g., 1, 2, 0.5)
  if (!isNaN(parseFloat(duration))) {
    const years = parseFloat(duration);
    // For fractional years, convert to months for more accurate calculation
    if (years % 1 !== 0) {
      // Convert fractional years to months
      const months = Math.round(years * 12);
      endDate.setMonth(endDate.getMonth() + months);
    } else {
      // Whole years
      endDate.setFullYear(endDate.getFullYear() + years);
    }
    return endDate;
  }
  
  // Parse duration string (e.g., "1 year", "6 months", "30 days")
  const durationLower = duration.toLowerCase().trim();
  
  // Handle different duration formats
  if (durationLower.includes('year') || durationLower.includes('years')) {
    const years = parseFloat(durationLower) || 1;
    endDate.setFullYear(endDate.getFullYear() + years);
  } else if (durationLower.includes('month') || durationLower.includes('months')) {
    const months = parseFloat(durationLower) || 1;
    endDate.setMonth(endDate.getMonth() + months);
  } else if (durationLower.includes('day') || durationLower.includes('days')) {
    const days = parseFloat(durationLower) || 30;
    endDate.setDate(endDate.getDate() + days);
  } else {
    // Default to 1 year if format is not recognized
    endDate.setFullYear(endDate.getFullYear() + 1);
  }
  
  return endDate;
}

export async function POST(request) {
  try {
    // Note: We're not using actDate and endDate from the request anymore
    // They will be calculated based on package duration
    const { customer, address, name, email, tel, city, code } = await request.json();

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

    // First, find the credential record with the given code
    // Include the package information to get duration
    const credential = await prisma.credentials.findFirst({
      where: { code: code },
      include: {
        pkg: true // Include package information
      }
    });

    if (!credential) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid code provided' }),
        { status: 404 }
      );
    }

    // Get the package information
    const pkg = credential.pkg;
    
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

    // Calculate activation date (current date)
    const actDate = new Date();
    
    // Calculate end date based on package duration
    const endDate = calculateEndDate(actDate, pkg?.duration);

    // Update the credential record to link it to the user and set dates
    const updatedCredential = await prisma.credentials.update({
      where: { id: credential.id },
      data: {
        user_id: user.id,
        actDate: actDate,
        endDate: endDate,
        updated_at: new Date(),
      },
    });

    return new Response(
      JSON.stringify({ success: true, message: 'User data updated successfully', user: user, credential: updatedCredential }),
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