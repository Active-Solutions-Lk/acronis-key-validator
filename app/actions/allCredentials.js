'use server';

export default async function AllCredentials() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fetch-all-credentials`, {
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
        responseData: responseData,
        credentials: responseData.credentials,
        total: responseData.total
      };
    } else {
      return { success: false, error: responseData.error };
    }
  } catch (err) {
    console.error('Server action error:', err);
    return { success: false, error: 'Failed to fetch all credentials.' };
  }
}