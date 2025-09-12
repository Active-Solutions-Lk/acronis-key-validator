'use server';

export default async function AllCities() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fetch-cities`, {
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
        cities: responseData.cities,
        total: responseData.total
      };
    } else {
      return { success: false, error: responseData.error };
    }
  } catch (err) {
    console.error('Server action error:', err);
    return { success: false, error: 'Failed to fetch cities.' };
  }
}