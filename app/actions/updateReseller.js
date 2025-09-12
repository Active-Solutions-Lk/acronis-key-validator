'use server';

export default async function UpdateReseller(id, resellerData) {
  try {
    console.log('Updating reseller:', id, resellerData);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/update-reseller`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...resellerData })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
    }

    const responseData = await response.json();
    
    if (responseData.success) {
      console.log('Reseller updated successfully:', responseData.reseller.customer_id);
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
      error: err.message || 'Failed to update reseller.' 
    };
  }
}