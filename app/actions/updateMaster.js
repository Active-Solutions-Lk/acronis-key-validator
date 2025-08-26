'use server';

export default async function updatedMaster(formData) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/update-master`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to update master table' };
    }
    return { success: true, message: result.message };
  } catch (error) {
    return { success: false, error: 'Error updating master file', details: error.message};
  }
}