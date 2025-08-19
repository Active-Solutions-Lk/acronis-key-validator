'use server';

export async function userRegister(formData) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user-register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to register user' };
    }
    return { success: true, message: result.message };
  } catch (error) {
    return { success: false, error: 'Error registering user', details: error.message};
  }
}