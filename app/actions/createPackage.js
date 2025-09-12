'use server';

export async function createPackage(formData) {
  try {
    const { name, duration } = formData;
    
    // Use a default URL if the environment variable is not set
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    const response = await fetch(`${apiUrl}/create-package`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, duration }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create package');
    }

    const data = await response.json();
    return { success: true, package: data.package };
  } catch (err) {
    console.error('Server action error:', err);
    return { success: false, error: err.message || 'Failed to create package.' };
  }
}