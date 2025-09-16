'use server';

export default async function DeleteCredential(id) {
  try {
    // console.log('Deleting credential:', id);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/delete-credential?id=${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
    }

    const responseData = await response.json();
    
    if (responseData.success) {
      // console.log('Credential deleted successfully:', responseData.deletedId);
      return { 
        success: true, 
        message: responseData.message,
        deletedId: responseData.deletedId
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
      error: err.message || 'Failed to delete credential.' 
    };
  }
}

export async function BulkDeleteCredentials(ids) {
  try {
    // console.log('Bulk deleting credentials:', ids);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/delete-credential`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
    }

    const responseData = await response.json();
    
    if (responseData.success) {
      // console.log('Credentials bulk deleted successfully:', responseData.deletedCount);
      return { 
        success: true, 
        message: responseData.message,
        deletedCount: responseData.deletedCount,
        deletedIds: responseData.deletedIds
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
      error: err.message || 'Failed to delete credentials.' 
    };
  }
}