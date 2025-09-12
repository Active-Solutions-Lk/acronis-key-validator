'use server';

export default async function CreateUser(userData) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/create-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to create user' };
    }
    
    return { success: true, message: result.message, user: result.user };
  } catch (error) {
    return { success: false, error: 'Error creating user', details: error.message };
  }
}