'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { deletePackage } from '@/app/actions/deletePackage';
import { EditPackageDialog } from './EditPackageDialog';

export function PackagesTable({ packages, onPackageUpdated }) {
  const [editingPackage, setEditingPackage] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (pkg) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete the package "${pkg.name}"?`);
    
    if (confirmDelete) {
      try {
        const result = await deletePackage(pkg.id);
        
        if (result.success) {
          toast.success('Package deleted successfully');
          if (onPackageUpdated) onPackageUpdated();
        } else {
          toast.error(result.error || 'Failed to delete package');
        }
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error(error);
      }
    }
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setEditingPackage(null);
  };

  return (
    <>
      <div className="rounded-md border p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Package Name</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Credentials Count</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages && packages.length > 0 ? (
              packages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">{pkg.name || 'N/A'}</TableCell>
                  <TableCell>{pkg.duration || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {pkg.credentials?.length || 0} credentials
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {pkg.created_at ? new Date(pkg.created_at).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(pkg)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(pkg)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No packages found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <EditPackageDialog
        packageData={editingPackage}
        isOpen={isEditDialogOpen}
        onClose={handleEditDialogClose}
        onPackageUpdated={onPackageUpdated}
      />
    </>
  );
}