'use server';

export async function userRegister(formData) {
  try {
    // Ensure tel is a string before calling parseInt
    const tel = formData.tel ? parseInt(formData.tel, 10) : 0;
    
    // Ensure city is a string before calling parseInt
    const city = formData.city ? parseInt(formData.city, 10) : null;
    
    // Prepare the data with proper types
    const submitData = {
      ...formData,
      tel: isNaN(tel) ? 0 : tel, // tel is required in the schema, default to 0 if invalid
      city: isNaN(city) ? null : city,
    };

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submitData),
    });

    const result = await response.json();
    
    // Log the full response for debugging
    // console.log('User register API response:', response.status, result);
    
    if (!response.ok) {
      return { 
        success: false, 
        error: result.error || result.message || 'Failed to register user',
        status: response.status
      };
    }
    return { success: true, message: result.message };
  } catch (error) {
    console.error('Error in userRegister action:', error);
    return { success: false, error: 'Error registering user', details: error.message };
  }
}