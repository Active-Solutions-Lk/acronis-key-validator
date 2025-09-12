'use server';

export default async function FetchResellerDetails(id) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fetch-reseller-details?id=${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const responseData = await response.json();
    if (responseData.success) {
      return { 
        success: true, 
        reseller: responseData.reseller
      };
    } else {
      return { success: false, error: responseData.error };
    }
  } catch (err) {
    console.error('Server action error:', err);
    return { success: false, error: 'Failed to fetch reseller details.' };
  }
}