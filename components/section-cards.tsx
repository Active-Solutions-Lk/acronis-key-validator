import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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

interface SectionCardsProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export function SectionCards({ stats, loading }: SectionCardsProps) {
  // Default values for loading state
  const defaultStats: DashboardStats = {
    totalCredentials: 0,
    totalUsers: 0,
    totalPackages: 0,
    totalResellers: 0,
    soldCredentials: 0,
    recentCredentials: 0,
    credentialsGrowthPercentage: 0,
    usersGrowthPercentage: 0,
    packagesGrowthPercentage: 0,
    resellersGrowthPercentage: 0
  };

  const displayStats = stats || defaultStats;
  const isLoading = loading && !stats;

  // Helper function to safely format numbers
  const formatNumber = (num: number | undefined): string => {
    if (num === undefined || num === null) return '0';
    return num.toLocaleString();
  };

  // Determine if growth is positive or negative for each metric
  const isCredentialsGrowthPositive = displayStats.credentialsGrowthPercentage >= 0;
  const credentialsGrowthIcon = isCredentialsGrowthPositive ? <IconTrendingUp /> : <IconTrendingDown />;
  const credentialsGrowthValue = Math.abs(displayStats.credentialsGrowthPercentage);

  const isUsersGrowthPositive = displayStats.usersGrowthPercentage >= 0;
  const usersGrowthIcon = isUsersGrowthPositive ? <IconTrendingUp /> : <IconTrendingDown />;
  const usersGrowthValue = Math.abs(displayStats.usersGrowthPercentage);

  const isPackagesGrowthPositive = displayStats.packagesGrowthPercentage >= 0;
  const packagesGrowthIcon = isPackagesGrowthPositive ? <IconTrendingUp /> : <IconTrendingDown />;
  const packagesGrowthValue = Math.abs(displayStats.packagesGrowthPercentage);

  const isResellersGrowthPositive = displayStats.resellersGrowthPercentage >= 0;
  const resellersGrowthIcon = isResellersGrowthPositive ? <IconTrendingUp /> : <IconTrendingDown />;
  const resellersGrowthValue = Math.abs(displayStats.resellersGrowthPercentage);

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Credentials</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? 'Loading...' : formatNumber(displayStats.totalCredentials)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {credentialsGrowthIcon}
              {isLoading ? '0%' : `${isCredentialsGrowthPositive ? '+' : '-'}${credentialsGrowthValue.toFixed(1)}%`}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {isLoading ? 'Calculating...' : `${isCredentialsGrowthPositive ? 'Trending up' : 'Trending down'} this month`} {credentialsGrowthIcon}
          </div>
          <div className="text-muted-foreground">
            {isLoading ? 'Loading...' : 'Credentials created in the last 30 days'}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Sold Credentials</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? 'Loading...' : formatNumber(displayStats.soldCredentials)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {usersGrowthIcon}
              {isLoading ? '0%' : `${isUsersGrowthPositive ? '+' : '-'}${usersGrowthValue.toFixed(1)}%`}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {isLoading ? 'Calculating...' : `${isUsersGrowthPositive ? 'Strong user growth' : 'User growth slowing'} `} {usersGrowthIcon}
          </div>
          <div className="text-muted-foreground">
            {isLoading ? 'Loading...' : 'Credentials assigned to users'}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Packages</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? 'Loading...' : formatNumber(displayStats.totalPackages)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {packagesGrowthIcon}
              {isLoading ? '0%' : `${isPackagesGrowthPositive ? '+' : '-'}${packagesGrowthValue.toFixed(1)}%`}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {isLoading ? 'Calculating...' : `${isPackagesGrowthPositive ? 'Growing package adoption' : 'Package adoption slowing'} `} {packagesGrowthIcon}
          </div>
          <div className="text-muted-foreground">
            {isLoading ? 'Loading...' : 'Active software packages'}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Reseller Network</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isLoading ? 'Loading...' : formatNumber(displayStats.totalResellers)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {resellersGrowthIcon}
              {isLoading ? '0%' : `${isResellersGrowthPositive ? '+' : '-'}${resellersGrowthValue.toFixed(1)}%`}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {isLoading ? 'Calculating...' : `${isResellersGrowthPositive ? 'Expanding reseller network' : 'Reseller network stable'} `} {resellersGrowthIcon}
          </div>
          <div className="text-muted-foreground">
            {isLoading ? 'Loading...' : 'Active reseller partnerships'}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}