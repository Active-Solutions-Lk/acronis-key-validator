// app/actions/validateUser.js
'use server';

async function ValidateUser(data) {
  if (!data?.user_name || !data?.password) {
    return { message: 'Username and password are required' };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/validate-user`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data), // Fix: Send data directly
      }
    );

    const result = await response.json();
    if (!response.ok) {
        console.error('Validation failed:', result.message);
      throw new Error(result.message || 'Validation failed');
    }
    return result;
  } catch (error) {
    return { message: error.message || 'Error validating credentials' };
  }
}

export default ValidateUser;