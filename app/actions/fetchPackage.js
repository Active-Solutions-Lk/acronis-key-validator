'use server';

export async function fetchPackage(code) {
  try {
    // Use a default URL if the environment variable is not set
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    
    const response = await fetch(`${apiUrl}/fetch-package`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    if (data.success) {
      return { success: true, packageName: data.package };
    } else {
      return { success: false, error: data.error };
    }
  } catch (err) {
    console.error('Server action error:', err);
    return { success: false, error: 'Failed to fetch package.' };
  }
}