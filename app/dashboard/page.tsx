'use client'

import { useEffect, useState } from 'react';
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
// import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
// import data from "./data.json"
import fetchDashboardStats from '@/app/actions/fetchDashboardStats';

// Define the type for dashboard stats
interface DashboardStats {
  totalCredentials: number;
  totalUsers: number;
  totalPackages: number;
  totalResellers: number;
  soldCredentials: number;
  recentCredentials: number;
  credentialsGrowthPercentage: number;
  usersGrowthPercentage: number;
  packagesGrowthPercentage: number;
  resellersGrowthPercentage: number;
}

export default function Page() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const result = await fetchDashboardStats();
        if (result.success && result.stats) {
          setDashboardStats(result.stats);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards stats={dashboardStats} loading={loading} />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      {/* <DataTable data={data} /> */}
    </div>
  )
}