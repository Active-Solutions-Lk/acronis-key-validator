'use server';

export async function validateQRCode(code) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/validate-qr`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      }
    );

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Validation failed');
    }
    return result;
  } catch (error) {
    return { message: error.message || 'Error validating code' };
  }
}