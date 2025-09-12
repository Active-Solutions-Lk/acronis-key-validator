'use server';

export default async function AllResellers() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fetch-all-resellers`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const responseData = await response.json();
    if (responseData.success) {
      // console.log('All resellers fetched successfully:', responseData.resellers);
      return { 
        success: true, 
        responseData: responseData,
        resellers: responseData.resellers,
        total: responseData.total
      };
    } else {
      return { success: false, error: responseData.error };
    }
  } catch (err) {
    console.error('Server action error:', err);
    return { success: false, error: 'Failed to fetch all resellers.' };
  }
}