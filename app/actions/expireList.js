'use server';

export default async function expireList() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/fetch-master`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const responseData = await response.json();

    if (responseData.success) {
      // Current date
      const now = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(now.getDate() + 30);

      // Filter only expired or expiring within 30 days
      const filteredData = responseData.data.filter((item) => {
        if (!item.endDate) return false; // ignore if no endDate
        const endDate = new Date(item.endDate);
        return endDate <= thirtyDaysLater; // expired or within next 30 days
      });

      return { success: true, responseData: { ...responseData, data: filteredData } };
    } else {
      return { success: false, error: responseData.error };
    }
  } catch (err) {
    console.error('Server action error:', err);
    return { success: false, error: 'Failed to fetch master data.' };
  }
}
