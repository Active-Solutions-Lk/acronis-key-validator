'use client';

import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Button } from '@/components/ui/button';

/**
 * Example component demonstrating how to use the permission system
 */
export function PermissionExample() {
  // Get the permission functions
  const { 
    user, 
    canView, 
    canEdit, 
    canDelete, 
    isSuperAdmin,
    getViewableModules,
    getEditableModules,
    getDeletableModules
  } = usePermissions();

  // If no user is logged in, show a message
  if (!user) {
    return (
      <div className="p-4 border rounded-md">
        <h3 className="text-lg font-medium">Permission System Example</h3>
        <p className="text-gray-500">No user is currently logged in.</p>
      </div>
    );
  }

  // Check specific permissions
  const canViewCredentials = canView('credentials');
  const canEditCredentials = canEdit('credentials');
  const canDeleteCredentials = canDelete('credentials');
  const canViewSales = canView('sales');
  const canEditSales = canEdit('sales');
  const canDeleteSales = canDelete('sales');

  // Get lists of modules
  const viewableModules = getViewableModules();
  const editableModules = getEditableModules();
  const deletableModules = getDeletableModules();

  return (
    <div className="p-4 border rounded-md space-y-4">
      <h3 className="text-lg font-medium">Permission System Example</h3>
      
      {/* User info */}
      <div className="bg-gray-50 p-3 rounded-md">
        <h4 className="font-medium">Current User</h4>
        <p>Username: {user.user_name}</p>
        <p>Privilege: {user.privilege}</p>
        <p>Department: {user.department || 'Not set'}</p>
        <p>Is Super Admin: {isSuperAdmin() ? 'Yes' : 'No'}</p>
      </div>

      {/* Permission checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-3 rounded-md">
          <h4 className="font-medium">Credentials Permissions</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Can View: {canViewCredentials ? 'Yes' : 'No'}</li>
            <li>Can Edit: {canEditCredentials ? 'Yes' : 'No'}</li>
            <li>Can Delete: {canDeleteCredentials ? 'Yes' : 'No'}</li>
          </ul>
        </div>
        
        <div className="bg-green-50 p-3 rounded-md">
          <h4 className="font-medium">Sales Permissions</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Can View: {canViewSales ? 'Yes' : 'No'}</li>
            <li>Can Edit: {canEditSales ? 'Yes' : 'No'}</li>
            <li>Can Delete: {canDeleteSales ? 'Yes' : 'No'}</li>
          </ul>
        </div>
      </div>

      {/* Module lists */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-purple-50 p-3 rounded-md">
          <h4 className="font-medium">Viewable Modules ({viewableModules.length})</h4>
          <ul className="list-disc list-inside space-y-1">
            {viewableModules.map(module => (
              <li key={module}>{module}</li>
            ))}
          </ul>
        </div>
        
        <div className="bg-yellow-50 p-3 rounded-md">
          <h4 className="font-medium">Editable Modules ({editableModules.length})</h4>
          <ul className="list-disc list-inside space-y-1">
            {editableModules.map(module => (
              <li key={module}>{module}</li>
            ))}
          </ul>
        </div>
        
        <div className="bg-red-50 p-3 rounded-md">
          <h4 className="font-medium">Deletable Modules ({deletableModules.length})</h4>
          <ul className="list-disc list-inside space-y-1">
            {deletableModules.length > 0 ? (
              deletableModules.map(module => (
                <li key={module}>{module}</li>
              ))
            ) : (
              <li>None (only Super Admins can delete)</li>
            )}
          </ul>
        </div>
      </div>

      {/* Conditional actions based on permissions */}
      <div className="flex flex-wrap gap-2">
        {canViewCredentials && (
          <Button variant="outline">View Credentials</Button>
        )}
        
        {canEditCredentials && (
          <Button variant="default">Edit Credentials</Button>
        )}
        
        {canDeleteCredentials && (
          <Button variant="destructive">Delete Credentials</Button>
        )}
        
        {!canViewCredentials && (
          <Button variant="outline" disabled>
            No Access to Credentials
          </Button>
        )}
      </div>
    </div>
  );
}