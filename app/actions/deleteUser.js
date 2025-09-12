'use server';

export default async function DeleteUser(userId) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/delete-user?id=${userId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await response.json();
    
    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to delete user' };
    }
    
    return { success: true, message: result.message };
  } catch (error) {
    return { success: false, error: 'Error deleting user', details: error.message };
  }
}

export async function BulkDeleteUsers(userIds) {
  try {
    const results = [];
    let successCount = 0;
    
    for (const id of userIds) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/delete-user?id=${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        });
        
        const result = await response.json();
        if (response.ok && result.success) {
          successCount++;
        }
        results.push({ id, success: response.ok && result.success, message: result.message || result.error });
      } catch (error) {
        results.push({ id, success: false, error: error.message });
      }
    }
    
    return { 
      success: true, 
      message: `${successCount} of ${userIds.length} users deleted successfully`,
      deletedCount: successCount,
      results
    };
  } catch (error) {
    return { success: false, error: 'Error deleting users', details: error.message };
  }
}