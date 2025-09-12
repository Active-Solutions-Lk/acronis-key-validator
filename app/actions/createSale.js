'use server';

export async function createSale(formData) {
  try {
    const { reseller_id, credentials_id } = formData;
    
    // Use a default URL if the environment variable is not set
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

    const response = await fetch(`${apiUrl}/create-sale`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reseller_id, credentials_id }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create sale');
    }

    const data = await response.json();
    return { success: true, sale: data.sale };
  } catch (err) {
    console.error('Server action error:', err);
    return { success: false, error: err.message || 'Failed to create sale.' };
  }
}