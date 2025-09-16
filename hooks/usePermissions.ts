'use client';

import React, { useContext, useMemo } from 'react';
import { 
  hasPermission, 
  canView, 
  canEdit, 
  canDelete, 
  isSuperAdmin,
  getViewableModules,
  getEditableModules,
  getDeletableModules
} from '@/lib/permissions';

// Define the Admin type based on the Prisma schema
interface Admin {
  id: number;
  user_name: string;
  password: string;
  email: string;
  sync: number;
  department: string;
  privilege: string;
  created_at: Date;
  updated_at: Date;
  // Allow additional properties with unknown type
  [key: string]: unknown;
}

// Create a context for the current user
const UserContext = React.createContext<Admin | null>(null);

interface UserProviderProps {
  user: Admin | null | object;
  children: React.ReactNode;
}

/**
 * Provider component to wrap the app with user context
 */
export function UserProvider({ user, children }: UserProviderProps) {
  // Type assertion to handle the case where user might be a generic object
  const adminUser = user as Admin | null;
  
 // console.log('UserProvider - User data:', adminUser);
  
  return React.createElement(
    UserContext.Provider,
    { value: adminUser },
    children
  );
}

/**
 * Hook to access the current user and permission functions
 */
export function usePermissions() {
  // console.log('usePermissions')
  const user = useContext(UserContext);

//  console.log('usePermissions - User context:', user);
  
  // Memoize the permission functions to prevent unnecessary re-renders
  const permissionFunctions = useMemo(() => {
    if (!user) {
      // If no user, return functions that always return false
   //   console.log('usePermissions - No user, returning false functions');
      return {
        hasPermission: () => false,
        canView: () => false,
        canEdit: () => false,
        canDelete: () => false,
        isSuperAdmin: () => false,
        getViewableModules: () => [],
        getEditableModules: () => [],
        getDeletableModules: () => []
      };
    }
    
  //  console.log('usePermissions - Creating permission functions for user:', user);
    
    return {
      hasPermission: (action: string, module: string) => hasPermission(user, action, module),
      canView: (module: string) => canView(user, module),
      canEdit: (module: string) => canEdit(user, module),
      canDelete: (module: string) => canDelete(user, module),
      isSuperAdmin: () => isSuperAdmin(user),
      getViewableModules: () => getViewableModules(user),
      getEditableModules: () => getEditableModules(user),
      getDeletableModules: () => getDeletableModules(user)
    };
  }, [user]);
  
  return {
    user,
    ...permissionFunctions
  };
}