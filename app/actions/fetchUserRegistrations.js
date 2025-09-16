'use server';

import prisma from '@/lib/prisma';

export default async function fetchUserRegistrations() {
  try {
    // Get user registrations grouped by date for the last 90 days
    const now = new Date();
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Fetch all users created in the last 90 days
    const users = await prisma.user.findMany({
      where: {
        created_at: {
          gte: ninetyDaysAgo
        }
      },
      select: {
        id: true,
        created_at: true
      },
      orderBy: {
        created_at: 'asc'
      }
    });

    // Group users by date
    const registrationsByDate = {};
    
    // Initialize all dates in the range with 0 registrations
    for (let d = new Date(ninetyDaysAgo); d <= now; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      registrationsByDate[dateStr] = 0;
    }

    // Count registrations per date
    users.forEach(user => {
      const dateStr = user.created_at.toISOString().split('T')[0];
      registrationsByDate[dateStr] = (registrationsByDate[dateStr] || 0) + 1;
    });

    // Convert to array format for the chart
    const chartData = Object.entries(registrationsByDate).map(([date, count]) => ({
      date,
      registrations: count
    }));

    return {
      success: true,
      data: chartData
    };
  } catch (err) {
    console.error('Server action error:', err);
    return { success: false, error: 'Failed to fetch user registration data.' };
  } finally {
    await prisma.$disconnect();
  }
}