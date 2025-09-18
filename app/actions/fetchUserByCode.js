'use server';

export async function fetchUserByCode(code) {
  try {
    // Use a default URL if the environment variable is not set
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    const response = await fetch(`${apiUrl}/fetch-user-by-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch data');
    }

    const data = await response.json();
    return { success: true, user_id: data.user_id, reseller_id: data.reseller_id };
  } catch (err) {
    console.error('Server action error:', err);
    return { success: false, error: err.message || 'Failed to fetch data.' };
  }
}