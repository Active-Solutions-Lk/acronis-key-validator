'use server';

export async function deletePackage(id) {
  try {
    // Use a default URL if the environment variable is not set
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    const response = await fetch(`${apiUrl}/delete-package`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete package');
    }

    const data = await response.json();
    return { success: true, message: data.message };
  } catch (err) {
    console.error('Server action error:', err);
    return { success: false, error: err.message || 'Failed to delete package.' };
  }
}