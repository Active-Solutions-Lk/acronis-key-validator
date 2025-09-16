'use server';

export default async function UpdateCredential(id, credentialData) {
  try {
    // console.log('Updating credential:', id, { ...credentialData, password: '***' });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/update-credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...credentialData })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
    }

    const responseData = await response.json();
    
    if (responseData.success) {
      // console.log('Credential updated successfully:', responseData.user.id);
      return { 
        success: true, 
        message: responseData.message,
        credential: responseData.user
      };
    } else {
      return { 
        success: false, 
        error: responseData.error 
      };
    }
  } catch (err) {
    console.error('Server action error:', err);
    return { 
      success: false, 
      error: err.message || 'Failed to update credential.' 
    };
  }
}