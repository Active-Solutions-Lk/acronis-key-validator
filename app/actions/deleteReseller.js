'use server';

export default async function DeleteReseller(id) {
  try {
    // console.log('Deleting reseller:', id);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/delete-reseller`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'API request failed');
    }

    const responseData = await response.json();
    
    if (responseData.success) {
      // console.log('Reseller deleted successfully:', id);
      return { 
        success: true, 
        message: responseData.message
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
      error: err.message || 'Failed to delete reseller.' 
    };
  }
}

export async function BulkDeleteResellers(ids) {
  try {
    // console.log('Bulk deleting resellers:', ids);

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/delete-reseller`, {
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
      // console.log('Resellers bulk deleted successfully:', responseData.deletedCount);
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
      error: err.message || 'Failed to delete resellers.' 
    };
  }
}