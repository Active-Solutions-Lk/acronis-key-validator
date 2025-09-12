'use server';

export async function fetchCredentialsByCodes(codes) {
  try {
    // Use a default URL if the environment variable is not set
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    const response = await fetch(`${apiUrl}/fetch-master-by-codes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codes }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch credentials records');
    }

    const data = await response.json();
    return { success: true, credentialsRecords: data.masterRecords };
  } catch (err) {
    console.error('Server action error:', err);
    return { success: false, error: err.message || 'Failed to fetch credentials records.' };
  }
}