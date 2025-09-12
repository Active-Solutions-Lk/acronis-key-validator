'use server';

export default async function updateCredentials(formData) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/update-credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to update credentials table' };
    }
    return { success: true, message: result.message };
  } catch (error) {
    return { success: false, error: 'Error updating credentials file', details: error.message};
  }
}