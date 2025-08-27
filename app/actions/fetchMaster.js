'use server';

export default async function FetchMaster() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fetch-master`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const responseData = await response.json();
    if (responseData.success) {
        // console.log('Master data fetched successfull:', responseData.data);
      return { success: true, responseData: responseData };
    } else {
      return { success: false, error: responseData.error };
    }
  } catch (err) {
    console.error('Server action error:', err);
    return { success: false, error: 'Failed to fetch master data.' };
  }
}