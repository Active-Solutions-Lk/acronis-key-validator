'use client';

import React, { useState, useEffect } from 'react';
import AllPackages from '@/app/actions/allPackages';
import { AddPackageDialog } from '@/components/admin/AddPackageDialog';
import { PackagesTable } from '@/components/admin/PackagesTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

function PackagesPageClient() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const result = await AllPackages();
      if (result.success) {
        setPackages(result.packages || []);
      } else {
        toast.error(result.error || 'Failed to fetch packages');
        setPackages([]);
      }
    } catch (error) {
      toast.error('Failed to fetch packages');
      console.error(error);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handlePackageUpdate = () => {
    fetchPackages();
  };

  return (
    <div className="container py-1">
      <>
        <div>
          <div className="flex justify-between p-2 items-center">
            <div>
              <h1 className="text-2xl font-bold" >Package Management</h1>
              <div>Manage all available packages</div>
            </div>
            <AddPackageDialog onPackageAdded={handlePackageUpdate} />
          </div>
        </div>
        <>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <PackagesTable packages={packages} onPackageUpdated={handlePackageUpdate} />
          )}
        </>
      </>
    </div>
  );
}

export default PackagesPageClient;