'use server';

export default async function AllPackages() {
  try {
    // Use a default URL if the environment variable is not set
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    
    const response = await fetch(`${apiUrl}/fetch-all-packages`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const responseData = await response.json();
    if (responseData.success) {
      // console.log('All packages fetched successfully:', responseData.packages);
      return { 
        success: true, 
        responseData: responseData,
        packages: responseData.packages,
        total: responseData.total
      };
    } else {
      return { success: false, error: responseData.error };
    }
  } catch (err) {
    console.error('Server action error:', err);
    return { success: false, error: 'Failed to fetch all packages.' };
  }
}