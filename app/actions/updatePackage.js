'use server';

export async function updatePackage(id, formData) {
  try {
    const { name, duration } = formData;
    
    // Use a default URL if the environment variable is not set
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    const response = await fetch(`${apiUrl}/update-package`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name, duration }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update package');
    }

    const data = await response.json();
    return { success: true, package: data.package };
  } catch (err) {
    console.error('Server action error:', err);
    return { success: false, error: err.message || 'Failed to update package.' };
  }
}