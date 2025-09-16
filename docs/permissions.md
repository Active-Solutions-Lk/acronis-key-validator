# User Permissions System

This document explains the permission system implemented in the Acronis Key Validator application.

## Overview

The permission system controls what actions users can perform based on their:
1. **Privilege Level** (admin, super_admin, viewer)
2. **Department** (accounts, admin, technical)

## Permission Rules

### Super Admin (Department: Admin)
- Can perform all actions (view, edit, delete) on all modules
- Full system access

### Admin Users

#### Department: Accounts
- **View**: Sales, Credentials, Resellers, Users, Packages
- **Edit**: Sales, Credentials, Resellers, Users, Packages
- **Delete**: None (inherits from privilege level)

#### Department: Technical
- **View**: Credentials, Users, Sales, Resellers, Packages
- **Edit**: Credentials, Users
- **Delete**: None (inherits from privilege level)

### Viewer Users

#### Department: Accounts
- **View**: Sales, Credentials, Resellers, Users, Packages
- **Edit**: Credentials (only)
- **Delete**: None

## Modules

The system defines the following modules:
- `sales`
- `credentials`
- `resellers`
- `users`
- `packages`
- `settings`

## Implementation

### Permission Functions

The system provides the following utility functions:

1. `hasPermission(user, action, module)` - Check if a user has a specific permission
2. `canView(user, module)` - Check if a user can view a module
3. `canEdit(user, module)` - Check if a user can edit a module
4. `canDelete(user, module)` - Check if a user can delete from a module
5. `isSuperAdmin(user)` - Check if a user is a super admin
6. `getViewableModules(user)` - Get all modules a user can view
7. `getEditableModules(user)` - Get all modules a user can edit
8. `getDeletableModules(user)` - Get all modules a user can delete from

### React Hook

The `usePermissions` hook provides easy access to permission functions in components:

```javascript
import { usePermissions } from '@/hooks/usePermissions'

function MyComponent() {
  const { canEdit, canDelete, canView } = usePermissions()
  
  // Check if current user can edit credentials
  const canEditCredentials = canEdit('credentials')
  
  // Check if current user can delete resellers
  const canDeleteResellers = canDelete('resellers')
  
  // Check if current user can view sales
  const canViewSales = canView('sales')
  
  return (
    // Component JSX
  )
}
```

### Usage in Components

Components should check permissions before rendering actions or allowing user interactions:

```javascript
import { usePermissions } from '@/hooks/usePermissions'

function CredentialsHeader({ setIsAddDialogOpen }) {
  const { canEdit } = usePermissions()
  const canAddCredentials = canEdit('credentials')
  
  return (
    <div>
      {canAddCredentials && (
        <Button onClick={() => setIsAddDialogOpen(true)}>
          Add Credential
        </Button>
      )}
    </div>
  )
}
```

## Adding New Permissions

To add new permissions:

1. Add new modules to the `MODULES` constant in `lib/permissions.js`
2. Update the permission rules in `lib/permissions.js`
3. Use the `usePermissions` hook in components to check permissions
4. Wrap components with appropriate permission checks

## Future Enhancements

Possible future enhancements to the permission system:
- Role-based permissions
- Fine-grained field-level permissions
- Permission inheritance
- Dynamic permission configuration