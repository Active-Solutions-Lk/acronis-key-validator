'use client';

import React, { useState, useEffect } from 'react';
import { AddSaleDialog } from '@/components/admin/AddSaleDialog';
import { SalesTable } from '@/components/admin/SalesTable';
import EditSaleDialog from '@/components/admin/EditSaleDialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import AllSales from '@/app/actions/allSales';
import UpdateSale from '@/app/actions/updateSale';

// Define the types based on the database schema and API response
interface City {
  id: number;
  district: string;
  city: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  company: string;
  tel: number;
  address: string;
  city: number;
  created_at: string;
  updated_at: string;
  sri_lanka_districts_cities?: City;
}

interface Package {
  id: number;
  name: string;
}

interface Credential {
  id: number;
  email: string;
  password: string;
  code: string;
  quota: number;
  pkg: Package;
  user: User;
  created_at: string;
}

interface Reseller {
  customer_id: number;
  company_name: string;
  address: string;
  type: string;
  credit_limit: string;
  payment_terms: string;
  note: string;
  vat: string;
  city: number;
  created_at: string;
  updated_at: string;
  sri_lanka_districts_cities?: City;
}

interface Sale {
  id: number;
  reseller_id: number;
  credentials_id: number;
  created_at: string;
  updated_at: string;
  reseller: Reseller;
  credentials: Credential;
}

function SalesPageClient() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const result = await AllSales();
      if (result.success) {
        setSales(result.sales || []);
      } else {
        toast.error(result.error || 'Failed to fetch sales');
        setSales([]);
      }
    } catch (error) {
      toast.error('Failed to fetch sales');
      console.error(error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const result = await AllSales();
      if (result.success) {
        setSales(result.sales || []);
        toast.success('Data refreshed successfully');
      } else {
        toast.error(result.error || 'Failed to refresh data');
      }
    } catch (error) {
      toast.error('Failed to refresh data');
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleDataChange = () => {
    fetchSales();
  };

  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale);
    setIsEditDialogOpen(true);
  };

  const handleUpdateSale = async (id: number, saleData: { reseller_id: string; credentials_id: string }) => {
    try {
      const result = await UpdateSale(id, saleData);
      if (result.success) {
        toast.success(result.message || 'Sale updated successfully');
        handleDataChange();
        return { success: true };
      } else {
        toast.error(result.error || 'Failed to update sale');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update sale. Please try again.');
      return { success: false, error: 'Failed to update sale.' };
    }
  };

  return (
    <div className="container ">
      <Card className="my-0 py-2 h-screen overflow-y-hidden border-0 ">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-bold" >Sales Management</CardTitle>
              <CardDescription>Manage reseller sales records</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleRefresh}
                disabled={isRefreshing || loading}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="ml-2">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </Button>
              <AddSaleDialog onSaleAdded={handleDataChange} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <SalesTable 
              sales={sales} 
              onSaleDeleted={handleDataChange} 
              onSaleEdit={handleEditSale}
            />
          )}
        </CardContent>
      </Card>

      <EditSaleDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingSale(null);
        }}
        saleData={editingSale}
        onUpdateSale={handleUpdateSale}
      />
    </div>
  );
}

export default SalesPageClient;