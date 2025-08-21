// app/actions/validateUser.js

'use server';

 async function ValidateUser(data) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/validate-user`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      }
    );

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || 'Validation failed');
    }
    return result;
  } catch (error) {
    return { message: error.message || 'Error validating credentials' };
  }
}

export default ValidateUser;