'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { GenericCombobox } from '@/components/ui/generic-combobox';
import { toast } from 'sonner';
import AllResellers from '@/app/actions/allResellers';
import AllCredentials from '@/app/actions/allCredentials';
import { usePermissions } from '@/hooks/usePermissions';

export default function EditSaleDialog({ 
  isOpen, 
  onClose, 
  saleData, 
  onUpdateSale 
}) {
  const { canEdit } = usePermissions();
  const canEditSales = canEdit('sales');
  
  const [isLoading, setIsLoading] = useState(false);
  const [resellers, setResellers] = useState([]);
  const [credentials, setCredentials] = useState([]);
  const [formData, setFormData] = useState({
    reseller_id: '',
    credentials_id: ''
  });

  // Transform resellers data for the combobox component
  const resellerOptions = React.useMemo(() => {
    if (!resellers || resellers.length === 0) return [];
    return resellers.map(reseller => ({
      value: reseller.customer_id.toString(),
      label: reseller.company_name
    }));
  }, [resellers]);

  // Transform credentials data for the combobox component
  const credentialsOptions = React.useMemo(() => {
    if (!credentials || credentials.length === 0) return [];
    return credentials.map(credential => ({
      value: credential.id.toString(),
      label: `${credential.id} - ${credential.user?.company || credential.user?.name || 'N/A'}`
    }));
  }, [credentials]);

  const fetchDropdownData = async () => {
    try {
      const [resellersResult, credentialsResult] = await Promise.all([
        AllResellers(),
        AllCredentials()
      ]);

      if (resellersResult.success) {
        setResellers(resellersResult.resellers || []);
      }

      if (credentialsResult.success) {
        setCredentials(credentialsResult.credentials || []);
      }
    } catch (error) {
      toast.error('Failed to load dropdown data');
      console.error(error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (saleData && isOpen) {
      setFormData({
        reseller_id: saleData.reseller_id?.toString() || '',
        credentials_id: saleData.credentials_id?.toString() || ''
      });
    }
  }, [saleData, isOpen]);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user has permission to edit sales
    if (!canEditSales) {
      toast.error('You do not have permission to edit sales');
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (!saleData?.id) {
        toast.error('Sale ID is missing');
        setIsLoading(false);
        return;
      }

      const result = await onUpdateSale(saleData.id, {
        reseller_id: formData.reseller_id,
        credentials_id: formData.credentials_id
      });

      if (result.success) {
        toast.success('Sale updated successfully');
        onClose();
      } else {
        toast.error(result.error || 'Failed to update sale');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render the dialog if user doesn't have edit permissions
  if (!canEditSales) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Sale</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reseller_id">Reseller</Label>
            <GenericCombobox
              options={resellerOptions}
              value={formData.reseller_id}
              onValueChange={(value) => handleChange('reseller_id', value)}
              placeholder="Select a reseller"
              searchPlaceholder="Search resellers..."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="credentials_id">Credentials</Label>
            <GenericCombobox
              options={credentialsOptions}
              value={formData.credentials_id}
              onValueChange={(value) => handleChange('credentials_id', value)}
              placeholder="Select credentials"
              searchPlaceholder="Search credentials..."
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.reseller_id || !formData.credentials_id}
            >
              {isLoading ? 'Updating...' : 'Update Sale'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}