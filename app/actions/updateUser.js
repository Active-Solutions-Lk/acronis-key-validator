'use server';

export default async function UpdateUser(userId, userData) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/update-user`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, ...userData }),
    });

    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to update user' };
    }
    
    return { success: true, message: result.message, user: result.user };
  } catch (error) {
    return { success: false, error: 'Error updating user', details: error.message };
  }
}