'use server';

export default async function CreateCredential(credentialData) {
  try {
    console.log('Creating credential:', { ...credentialData, password: '***' });

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/create-credential`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentialData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
    }

    const responseData = await response.json();
    
    if (responseData.success) {
      console.log('Credential created successfully:', responseData.credential.id);
      return { 
        success: true, 
        message: responseData.message,
        credential: responseData.credential
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
      error: err.message || 'Failed to create credential.' 
    };
  }
}