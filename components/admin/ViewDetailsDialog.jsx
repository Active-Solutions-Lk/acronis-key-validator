'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import FetchCredentialDetails from '@/app/actions/fetchCredentialDetails';
import FetchResellerDetails from '@/app/actions/fetchResellerDetails';
import FetchUserDetails from '@/app/actions/fetchUserDetails';

export default function ViewDetailsDialog({ 
  isOpen, 
  onClose, 
  data, 
  type 
}) {
  const [detailedData, setDetailedData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDetailedData = async () => {
      if (!isOpen || !data) return;
      
      setLoading(true);
      try {
        let result;
        
        switch (type) {
          case 'credential':
            result = await FetchCredentialDetails(data.id);
            if (result.success) {
              setDetailedData(result.credential);
            } else {
              toast.error(result.error || 'Failed to fetch credential details');
            }
            break;
          case 'reseller':
            result = await FetchResellerDetails(data.customer_id || data.id);
            if (result.success) {
              setDetailedData(result.reseller);
            } else {
              toast.error(result.error || 'Failed to fetch reseller details');
            }
            break;
          case 'user':
            result = await FetchUserDetails(data.id);
            if (result.success) {
              setDetailedData(result.user);
            } else {
              toast.error(result.error || 'Failed to fetch user details');
            }
            break;
          default:
            setDetailedData(data);
        }
      } catch (error) {
        console.error('Error fetching detailed data:', error);
        toast.error('Failed to fetch detailed data');
      } finally {
        setLoading(false);
      }
    };

    fetchDetailedData();
  }, [isOpen, data, type]);

  const renderCredentialDetails = (credential) => (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>ID</Label>
              <div className="text-sm mt-1">{credential.id}</div>
            </div>
            <div>
              <Label>Email</Label>
              <div className="text-sm mt-1">{credential.email || 'N/A'}</div>
            </div>
            <div>
              <Label>Password</Label>
              <div className="text-sm mt-1">{credential.password || 'N/A'}</div>
            </div>
            <div>
              <Label>Code</Label>
              <div className="text-sm mt-1">{credential.code || 'N/A'}</div>
            </div>
            <div>
              <Label>Quota</Label>
              <div className="text-sm mt-1">{credential.quota || 'N/A'}</div>
            </div>
            <div>
              <Label>Package</Label>
              <div className="text-sm mt-1">{credential.pkg?.name || 'N/A'}</div>
            </div>
            <div>
              <Label>User</Label>
              <div className="text-sm mt-1">
                {credential.user?.company || credential.user?.name || 'N/A'}
              </div>
            </div>
            <div>
              <Label>User Email</Label>
              <div className="text-sm mt-1">{credential.user?.email || 'N/A'}</div>
            </div>
          </div>
          <div>
            <Label>Created At</Label>
            <div className="text-sm mt-1">
              {credential.created_at ? new Date(credential.created_at).toLocaleString() : 'N/A'}
            </div>
          </div>
          <div>
            <Label>Updated At</Label>
            <div className="text-sm mt-1">
              {credential.updated_at ? new Date(credential.updated_at).toLocaleString() : 'N/A'}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderResellerDetails = (reseller) => (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>ID</Label>
              <div className="text-sm mt-1">{reseller.customer_id || reseller.id}</div>
            </div>
            <div>
              <Label>Company Name</Label>
              <div className="text-sm mt-1">{reseller.company_name || 'N/A'}</div>
            </div>
            <div>
              <Label>Type</Label>
              <div className="text-sm mt-1">{reseller.type || 'N/A'}</div>
            </div>
            <div>
              <Label>VAT Number</Label>
              <div className="text-sm mt-1">{reseller.vat || 'N/A'}</div>
            </div>
            <div>
              <Label>Credit Limit</Label>
              <div className="text-sm mt-1">{reseller.credit_limit || 'N/A'}</div>
            </div>
            <div>
              <Label>Payment Terms</Label>
              <div className="text-sm mt-1">{reseller.payment_terms || 'N/A'}</div>
            </div>
            <div>
              <Label>City</Label>
              <div className="text-sm mt-1">
                {reseller.sri_lanka_districts_cities 
                  ? `${reseller.sri_lanka_districts_cities.city}, ${reseller.sri_lanka_districts_cities.district}` 
                  : (reseller.city ? reseller.city : 'N/A')}
              </div>
            </div>
          </div>
          <div>
            <Label>Address</Label>
            <div className="text-sm mt-1">{reseller.address || 'N/A'}</div>
          </div>
          <div>
            <Label>Note</Label>
            <div className="text-sm mt-1">{reseller.note || 'N/A'}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Created At</Label>
              <div className="text-sm mt-1">
                {reseller.created_at ? new Date(reseller.created_at).toLocaleString() : 'N/A'}
              </div>
            </div>
            <div>
              <Label>Updated At</Label>
              <div className="text-sm mt-1">
                {reseller.updated_at ? new Date(reseller.updated_at).toLocaleString() : 'N/A'}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderUserDetails = (user) => (
    <div className="space-y-4">
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>ID</Label>
              <div className="text-sm mt-1">{user.id}</div>
            </div>
            <div>
              <Label>Name</Label>
              <div className="text-sm mt-1">{user.name || 'N/A'}</div>
            </div>
            <div>
              <Label>Email</Label>
              <div className="text-sm mt-1">{user.email || 'N/A'}</div>
            </div>
            <div>
              <Label>Company</Label>
              <div className="text-sm mt-1">{user.company || 'N/A'}</div>
            </div>
            <div>
              <Label>Phone</Label>
              <div className="text-sm mt-1">{user.tel || 'N/A'}</div>
            </div>
            <div>
              <Label>City</Label>
              <div className="text-sm mt-1">
                {user.sri_lanka_districts_cities 
                  ? `${user.sri_lanka_districts_cities.city}, ${user.sri_lanka_districts_cities.district}` 
                  : (user.city ? user.city : 'N/A')}
              </div>
            </div>
          </div>
          <div>
            <Label>Address</Label>
            <div className="text-sm mt-1">{user.address || 'N/A'}</div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Created At</Label>
              <div className="text-sm mt-1">
                {user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
              </div>
            </div>
            <div>
              <Label>Updated At</Label>
              <div className="text-sm mt-1">
                {user.updated_at ? new Date(user.updated_at).toLocaleString() : 'N/A'}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const getTitle = () => {
    switch (type) {
      case 'credential':
        return 'Credential Details';
      case 'reseller':
        return 'Reseller Details';
      case 'user':
        return 'User Details';
      default:
        return 'Details';
    }
  };

  const renderContent = () => {
    const displayData = detailedData || data;
    if (!displayData) return <div>No details available</div>;
    
    switch (type) {
      case 'credential':
        return renderCredentialDetails(displayData);
      case 'reseller':
        return renderResellerDetails(displayData);
      case 'user':
        return renderUserDetails(displayData);
      default:
        return <div>No details available</div>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {renderContent()}
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}