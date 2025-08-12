'use server';

export async function fetchPackage(code) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fetch-package`, {
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