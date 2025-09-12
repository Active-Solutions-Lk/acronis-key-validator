'use server';

export default async function CheckCredentialSale(credentials_id) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fetch-all-sales`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const responseData = await response.json();
    if (responseData.success) {
      // Check if any sale already uses this credentials_id
      const existingSale = responseData.sales.find(sale => 
        sale.credentials_id === parseInt(credentials_id)
      );
      
      if (existingSale) {
        return { 
          success: true, 
          isAssigned: true,
          sale: existingSale
        };
      } else {
        return { 
          success: true, 
          isAssigned: false
        };
      }
    } else {
      return { success: false, error: responseData.error };
    }
  } catch (err) {
    console.error('Server action error:', err);
    return { success: false, error: 'Failed to check credential sale status.' };
  }
}