'use server';

export default async function FetchCredentialsMaster() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fetch-master`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    // Handle the case when there's no data (404 status)
    if (response.status === 404) {
      // Return empty data instead of throwing an error
      return { success: true, responseData: { success: true, data: [] } };
    }

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const responseData = await response.json();
    if (responseData.success) {
      return { success: true, responseData: responseData };
    } else {
      return { success: false, error: responseData.error };
    }
  } catch (err) {
    console.error('Server action error:', err);
    return { success: false, error: 'Failed to fetch credentials master data.' };
  }
}