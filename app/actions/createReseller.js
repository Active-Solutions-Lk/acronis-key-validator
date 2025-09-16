'use server';

export default async function CreateReseller(resellerData) {
  try {
    // console.log('Creating reseller:', resellerData);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/create-reseller`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resellerData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
    }

    const responseData = await response.json();
    
    if (responseData.success) {
      // console.log('Reseller created successfully:', responseData.reseller.customer_id);
      return { 
        success: true, 
        message: responseData.message,
        reseller: responseData.reseller
      };
    } else {
      return { 
        success: false, 
        error: responseData.error 
      };
    }
  } catch (err) {
    console.error('Server action error:', err);
    return { 
      success: false, 
      error: err.message || 'Failed to create reseller.' 
    };
  }
}