'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updatePackage } from '@/app/actions/updatePackage';
import { toast } from 'sonner';

export function EditPackageDialog({ packageData, isOpen, onClose, onPackageUpdated }) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
  });

  useEffect(() => {
    if (packageData) {
      setFormData({
        name: packageData.name || '',
        duration: packageData.duration || '',
      });
    }
  }, [packageData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await updatePackage(packageData.id, formData);
      
      if (result.success) {
        toast.success('Package updated successfully');
        if (onPackageUpdated) onPackageUpdated();
        onClose();
      } else {
        toast.error(result.error || 'Failed to update package');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Package</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Package Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter package name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration">Duration (Optional)</Label>
            <Input
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              placeholder="e.g., 1 year, 1.3 years, 0.3 years"
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Package'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}