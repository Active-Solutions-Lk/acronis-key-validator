'use client';

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, Search, Edit } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { deleteSale } from '@/app/actions/deleteSale';
import ViewDetailsDialog from '@/components/admin/ViewDetailsDialog';
import { usePermissions } from '@/hooks/usePermissions';

export function SalesTable({ sales, onSaleDeleted, onSaleEdit }) {
  const { canEdit } = usePermissions();
  const canEditSales = canEdit('sales');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewDialog, setViewDialog] = useState({
    isOpen: false,
    data: null,
    type: null
  });
  const itemsPerPage = 10;

  const filteredSales = useMemo(() => {
    if (!sales || sales.length === 0) return [];
    
    const term = searchTerm.toLowerCase().trim();
    if (!term) return sales;

    return sales.filter(sale => {
      const resellerName = sale.reseller?.company_name?.toLowerCase() || '';
      const customerName = sale.credentials?.customer?.toLowerCase() || '';
      const credentialId = sale.credentials_id?.toString() || '';
      const createdAt = sale.created_at ? new Date(sale.created_at).toLocaleDateString().toLowerCase() : '';

      return (
        resellerName.includes(term) ||
        customerName.includes(term) ||
        credentialId.includes(term) ||
        createdAt.includes(term)
      );
    });
  }, [sales, searchTerm]);

  // Pagination logic
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSales = filteredSales.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleDelete = async (saleId) => {
    // Check if user has permission to edit sales
    if (!canEditSales) {
      toast.error('You do not have permission to delete sales');
      return;
    }
    
    const confirmDelete = window.confirm('Are you sure you want to delete this sale?');
    
    if (confirmDelete) {
      try {
        const result = await deleteSale(saleId);
        
        if (result.success) {
          toast.success('Sale deleted successfully');
          onSaleDeleted();
        } else {
          toast.error(result.error || 'Failed to delete sale');
        }
      } catch (error) {
        toast.error('An unexpected error occurred');
        console.error(error);
      }
    }
  };

  const handleViewDetails = (data, type) => {
    setViewDialog({
      isOpen: true,
      data,
      type
    });
  };

  const closeViewDialog = () => {
    setViewDialog({
      isOpen: false,
      data: null,
      type: null
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sales..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
            className="pl-8"
          />
        </div>
      </div>
      <div className="rounded-md border">
        <div className="max-h-[600px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead>Reseller</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Credential ID</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentSales && currentSales.length > 0 ? (
                currentSales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell className="font-medium">
                      <button 
                        onClick={() => handleViewDetails(sale.reseller, 'reseller')}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {sale.reseller?.company_name || 'N/A'}
                      </button>
                    </TableCell>
                    <TableCell>
                      <button 
                        onClick={() => handleViewDetails(sale.credentials, 'user')}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {sale.credentials?.customer || 'N/A'}
                      </button>
                    </TableCell>
                    <TableCell>
                      <button 
                        onClick={() => handleViewDetails(sale.credentials, 'credential')}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {sale.credentials_id || 'N/A'}
                      </button>
                    </TableCell>
                    <TableCell>
                      {sale.created_at ? new Date(sale.created_at).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {canEditSales && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onSaleEdit(sale)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {canEditSales && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(sale.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? 'No matching sales found' : 'No sales found'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredSales.length)} of {filteredSales.length} results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {/* Page numbers */}
            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              // Show first, last, current, and nearby pages
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </Button>
                );
              }
              
              // Show ellipsis for skipped pages
              if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className="px-2 py-1 text-muted-foreground">
                    ...
                  </span>
                );
              }
              
              return null;
            })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      
      {/* View Details Dialog */}
      <ViewDetailsDialog
        isOpen={viewDialog.isOpen}
        onClose={closeViewDialog}
        data={viewDialog.data}
        type={viewDialog.type}
      />
    </div>
  );
}