'use server';

import prisma from '@/lib/prisma';

export default async function fetchDashboardStats() {
  try {
    // Calculate date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    
    // Fetch counts for various entities
    const [
      totalCredentials,
      totalUsers,
      totalPackages,
      totalResellers,
      // Count credentials created in the last 30 days
      recentCredentials,
      // Count credentials created between 30-60 days ago
      previousPeriodCredentials,
      // Count credentials with userId (sold credentials)
      soldCredentials
    ] = await Promise.all([
      prisma.credentials.count(),
      prisma.user.count(),
      prisma.pkg.count(),
      prisma.reseller.count(),
      prisma.credentials.count({
        where: {
          created_at: {
            gte: thirtyDaysAgo
          }
        }
      }),
      prisma.credentials.count({
        where: {
          created_at: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo
          }
        }
      }),
      prisma.credentials.count({
        where: {
          user_id: {
            not: null
          }
        }
      })
    ]);

    // Calculate growth percentage for credentials
    let credentialsGrowthPercentage = 0;
    if (previousPeriodCredentials > 0) {
      credentialsGrowthPercentage = ((recentCredentials - previousPeriodCredentials) / previousPeriodCredentials) * 100;
    } else if (recentCredentials > 0) {
      // If no credentials in previous period but some in current period, show 100% growth
      credentialsGrowthPercentage = 100;
    }

    // For other entities, we'll calculate growth based on the last 30 days vs previous 30 days
    const [
      recentUsers,
      previousUsers,
      recentPackages,
      previousPackages,
      recentResellers,
      previousResellers
    ] = await Promise.all([
      prisma.user.count({
        where: {
          created_at: {
            gte: thirtyDaysAgo
          }
        }
      }),
      prisma.user.count({
        where: {
          created_at: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo
          }
        }
      }),
      prisma.pkg.count({
        where: {
          created_at: {
            gte: thirtyDaysAgo
          }
        }
      }),
      prisma.pkg.count({
        where: {
          created_at: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo
          }
        }
      }),
      prisma.reseller.count({
        where: {
          created_at: {
            gte: thirtyDaysAgo
          }
        }
      }),
      prisma.reseller.count({
        where: {
          created_at: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo
          }
        }
      })
    ]);

    // Calculate growth percentages
    const usersGrowthPercentage = previousUsers > 0 
      ? ((recentUsers - previousUsers) / previousUsers) * 100 
      : (recentUsers > 0 ? 100 : 0);
      
    const packagesGrowthPercentage = previousPackages > 0 
      ? ((recentPackages - previousPackages) / previousPackages) * 100 
      : (recentPackages > 0 ? 100 : 0);
      
    const resellersGrowthPercentage = previousResellers > 0 
      ? ((recentResellers - previousResellers) / previousResellers) * 100 
      : (recentResellers > 0 ? 100 : 0);

    return {
      success: true,
      stats: {
        totalCredentials,
        totalUsers,
        totalPackages,
        totalResellers,
        soldCredentials,
        recentCredentials,
        credentialsGrowthPercentage: parseFloat(credentialsGrowthPercentage.toFixed(1)),
        usersGrowthPercentage: parseFloat(usersGrowthPercentage.toFixed(1)),
        packagesGrowthPercentage: parseFloat(packagesGrowthPercentage.toFixed(1)),
        resellersGrowthPercentage: parseFloat(resellersGrowthPercentage.toFixed(1))
      }
    };
  } catch (err) {
    console.error('Server action error:', err);
    return { success: false, error: 'Failed to fetch dashboard statistics.' };
  } finally {
    await prisma.$disconnect();
  }
}