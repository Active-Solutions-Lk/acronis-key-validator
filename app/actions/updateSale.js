'use server';

export default async function UpdateSale(id, saleData) {
  try {
    console.log('Updating sale:', id, saleData);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/update-sale`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...saleData })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
    }

    const responseData = await response.json();
    
    if (responseData.success) {
      console.log('Sale updated successfully:', responseData.sale.id);
      return { 
        success: true, 
        message: responseData.message,
        sale: responseData.sale
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
      error: err.message || 'Failed to update sale.' 
    };
  }
}