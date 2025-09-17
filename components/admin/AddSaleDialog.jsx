'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { GenericCombobox } from '@/components/ui/generic-combobox';
import { TagInput } from '@/components/ui/tag-input';
import { createSale } from '@/app/actions/createSale';
import { fetchCredentialsByCodes } from '@/app/actions/fetchCredentialsByCodes';
import { toast } from 'sonner';
import AllResellers from '@/app/actions/allResellers';
import CheckCredentialSale from '@/app/actions/checkCredentialSale';
import { usePermissions } from '@/hooks/usePermissions';

export function AddSaleDialog({ onSaleAdded }) {
  const { canEdit } = usePermissions();
  const canEditSales = canEdit('sales');
  
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resellers, setResellers] = useState([]);
  const [formData, setFormData] = useState({
    reseller_id: '',
    codes: [], // Array for tag input
  });
  const [codeValidations, setCodeValidations] = useState({}); // Track code validations
  const [credentialsLookup, setCredentialsLookup] = useState({}); // Cache for credentials records
  const [credentialSaleStatus, setCredentialSaleStatus] = useState({}); // Track credential sale status
  const validationTimeoutRef = useRef(null);
  const [loadingData, setLoadingData] = useState(true);

  // Transform resellers data for the combobox component
  const resellerOptions = React.useMemo(() => {
    if (!resellers || resellers.length === 0) return [];
    return resellers.map(reseller => ({
      value: reseller.customer_id.toString(),
      label: reseller.company_name
    }));
  }, [resellers]);

  const fetchDropdownData = async () => {
    try {
      setLoadingData(true);
      const [resellersResult] = await Promise.all([
        AllResellers()
      ]);

      if (resellersResult.success) {
        setResellers(resellersResult.resellers || []);
      }
    } catch (error) {
      toast.error('Failed to load dropdown data');
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchDropdownData();
    }
  }, [isOpen]);

  // Real-time validation of codes
  useEffect(() => {
    if (formData.codes.length === 0) {
      setCodeValidations({});
      setCredentialsLookup({});
      setCredentialSaleStatus({});
      return;
    }

    // Clear previous timeout
    if (validationTimeoutRef.current) {
      clearTimeout(validationTimeoutRef.current);
    }

    // Set new timeout for debounced validation
    validationTimeoutRef.current = setTimeout(async () => {
      try {
        // Get codes that need validation (not already validated)
        const codesToValidate = formData.codes.filter(code => 
          !codeValidations[code] || codeValidations[code] === 'pending'
        );

        if (codesToValidate.length === 0) return;

        // Fetch credentials records for these codes
        const credentialsResult = await fetchCredentialsByCodes(codesToValidate);
        
        if (credentialsResult.success) {
          const credentialsRecords = credentialsResult.credentialsRecords;
          
          // Update validations
          setCodeValidations(prev => {
            const newValidations = { ...prev };
            // Mark validated codes
            codesToValidate.forEach(code => {
              const isValid = credentialsRecords.some(record => record.id === parseInt(code, 10));
              newValidations[code] = isValid ? 'valid' : 'invalid';
            });
            return newValidations;
          });
          
          // Update credentials lookup cache
          setCredentialsLookup(prev => {
            const newLookup = { ...prev };
            codesToValidate.forEach(code => {
              const credentialsRecord = credentialsRecords.find(record => record.id === parseInt(code, 10));
              if (credentialsRecord) {
                newLookup[code] = credentialsRecord;
              }
            });
            return newLookup;
          });
          
          // Check if credentials are already assigned to sales
          const saleStatus = {};
          for (const code of codesToValidate) {
            const credentialsRecord = credentialsRecords.find(record => record.id === parseInt(code, 10));
            if (credentialsRecord) {
              const saleCheckResult = await CheckCredentialSale(credentialsRecord.id);
              if (saleCheckResult.success && saleCheckResult.isAssigned) {
                saleStatus[code] = {
                  isAssigned: true,
                  reseller: saleCheckResult.sale.reseller?.company_name || 'Unknown Reseller',
                  saleId: saleCheckResult.sale.id
                };
              } else {
                saleStatus[code] = { isAssigned: false };
              }
            }
          }
          setCredentialSaleStatus(prev => ({ ...prev, ...saleStatus }));
        }
      } catch (error) {
        console.error('Validation error:', error);
        // Mark all as pending on error
        setCodeValidations(prev => {
          const newValidations = { ...prev };
          codesToValidate.forEach(code => {
            newValidations[code] = 'pending';
          });
          return newValidations;
        });
      }
    }, 500); // Debounce for 500ms

    // Cleanup timeout on unmount
    return () => {
      if (validationTimeoutRef.current) {
        clearTimeout(validationTimeoutRef.current);
      }
    };
  }, [formData.codes]); // Only depend on formData.codes, not on codeValidations or credentialsLookup

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleValidationChange = React.useCallback((validations) => {
    setCodeValidations(validations);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user has permission to edit sales
    if (!canEditSales) {
      toast.error('You do not have permission to add sales');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const codes = formData.codes;
      
      if (codes.length === 0) {
        toast.error('Please enter at least one code');
        setIsLoading(false);
        return;
      }
      
      // Get valid codes from validation cache
      const validCodes = codes.filter(code => codeValidations[code] === 'valid');
      const invalidCodes = codes.filter(code => codeValidations[code] === 'invalid');
      
      if (validCodes.length === 0) {
        toast.error('No valid codes found. Please check your entries.');
        setIsLoading(false);
        return;
      }
      
      // Check if any valid codes are already assigned to sales
      const assignedCodes = validCodes.filter(code => 
        credentialSaleStatus[code] && credentialSaleStatus[code].isAssigned
      );
      
      if (assignedCodes.length > 0) {
        const assignedCodeDetails = assignedCodes.map(code => {
          const status = credentialSaleStatus[code];
          return `${code} (assigned to ${status.reseller})`;
        });
        toast.error(`The following credential IDs are already assigned to sales: ${assignedCodeDetails.join(', ')}`);
        setIsLoading(false);
        return;
      }
      
      if (invalidCodes.length > 0) {
        toast.warning(`Skipping ${invalidCodes.length} invalid codes: ${invalidCodes.join(', ')}`);
      }
      
      // Get credentials records from cache
      const credentialsRecords = validCodes.map(code => credentialsLookup[code]).filter(Boolean);
      
      // Create a sale for each valid credentials record
      const results = await Promise.all(
        credentialsRecords.map(async (credentialsRecord) => {
          return await createSale({
            reseller_id: formData.reseller_id,
            credentials_id: credentialsRecord.id
          });
        })
      );
      
      // Check results
      const successfulSales = results.filter(result => result.success);
      const failedSales = results.filter(result => !result.success);
      
      if (successfulSales.length > 0) {
        toast.success(`${successfulSales.length} sale(s) created successfully`);
        
        if (failedSales.length > 0) {
          const errors = failedSales.map(result => result.error);
          toast.error(`Failed to create ${failedSales.length} sale(s): ${errors.join(', ')}`);
        }
        
        setFormData({ reseller_id: '', codes: [] });
        setCodeValidations({});
        setCredentialsLookup({});
        setCredentialSaleStatus({});
        setIsOpen(false);
        onSaleAdded();
      } else {
        const errors = results.map(result => result.error);
        toast.error(`Failed to create sales: ${errors.join(', ')}`);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Count valid/invalid codes for display
  const validCodeCount = formData.codes.filter(code => codeValidations[code] === 'valid').length;
  const invalidCodeCount = formData.codes.filter(code => codeValidations[code] === 'invalid').length;
  const pendingCodeCount = formData.codes.filter(code => !codeValidations[code] || codeValidations[code] === 'pending').length;
  
  // Count assigned codes for display
  const assignedCodeCount = formData.codes.filter(code => 
    credentialSaleStatus[code] && credentialSaleStatus[code].isAssigned
  ).length;

  // Don't render the dialog if user doesn't have edit permissions
  if (!canEditSales) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        setFormData({ reseller_id: '', codes: [] });
        setCodeValidations({});
        setCredentialsLookup({});
        setCredentialSaleStatus({});
      }
    }}>
      <DialogTrigger asChild>
        <Button variant="default">Add Sale</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Sale</DialogTitle>
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
              disabled={loadingData || isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="codes">Credential IDs</Label>
            <TagInput
              value={formData.codes}
              onChange={(value) => handleChange('codes', value)}
              onValidationChange={handleValidationChange}
              validations={codeValidations} // Pass validation status to TagInput
              placeholder="Enter credential IDs (press Enter or comma to add)"
              disabled={isLoading}
            />
            <div className="text-sm text-muted-foreground">
              <p>Enter credential IDs separated by commas or pressing Enter. You can also paste multiple IDs.</p>
              {formData.codes.length > 0 && (
                <div className="mt-1 flex gap-3 flex-wrap">
                  <span className="text-blue-600 font-medium">{validCodeCount} valid</span>
                  <span className="text-red-600 font-medium">{invalidCodeCount} invalid</span>
                  {pendingCodeCount > 0 && <span className="text-gray-500">{pendingCodeCount} checking</span>}
                  {assignedCodeCount > 0 && <span className="text-orange-600 font-medium">{assignedCodeCount} already assigned</span>}
                </div>
              )}
            </div>
            
            {/* Display assigned credential warnings */}
            {formData.codes.map(code => {
              if (credentialSaleStatus[code] && credentialSaleStatus[code].isAssigned) {
                return (
                  <div key={code} className="text-sm p-2 bg-orange-100 border border-orange-300 rounded text-orange-800">
                    Credential ID <span className="font-medium">{code}</span> is already assigned to <span className="font-medium">{credentialSaleStatus[code].reseller}</span>
                  </div>
                );
              }
              return null;
            })}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || !formData.reseller_id || validCodeCount === 0}
            >
              {isLoading ? 'Processing...' : `Process ${validCodeCount} Valid ID(s)`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}