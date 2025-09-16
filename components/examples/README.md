# Permission System Usage Guide

This guide explains how to use the permission system in the Acronis Key Validator application.

## Overview

The permission system controls what actions users can perform based on their privilege level and department. It provides a flexible way to implement role-based access control throughout the application.

## Installation

The permission system is already integrated into the application. No additional installation is required.

## Usage

### 1. Using the `usePermissions` Hook

The easiest way to use the permission system is through the `usePermissions` React hook:

```javascript
import { usePermissions } from '@/hooks/usePermissions';

function MyComponent() {
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

  // Check if current user can view credentials
  if (!canView('credentials')) {
    return <div>Access denied</div>;
  }

  return (
    <div>
      {canEdit('credentials') && (
        <button>Edit Credentials</button>
      )}
      {canDelete('credentials') && (
        <button>Delete Credentials</button>
      )}
    </div>
  );
}
```

### 2. Available Permission Functions

The `usePermissions` hook provides the following functions:

- `canView(module)`: Check if the user can view a module
- `canEdit(module)`: Check if the user can edit a module
- `canDelete(module)`: Check if the user can delete from a module
- `isSuperAdmin()`: Check if the user is a super admin
- `getViewableModules()`: Get array of modules the user can view
- `getEditableModules()`: Get array of modules the user can edit
- `getDeletableModules()`: Get array of modules the user can delete from

### 3. Available Modules

The system defines the following modules:
- `sales`
- `credentials`
- `resellers`
- `users`
- `packages`
- `settings`

### 4. Conditional Rendering

Use permission checks to conditionally render UI elements:

```javascript
function CredentialActions() {
  const { canEdit, canDelete } = usePermissions();
  
  return (
    <div>
      {canEdit('credentials') && (
        <Button>Edit</Button>
      )}
      {canDelete('credentials') && (
        <Button variant="destructive">Delete</Button>
      )}
    </div>
  );
}
```

### 5. Protecting Actions

Use permission checks to protect actions:

```javascript
function handleEdit() {
  if (!canEdit('credentials')) {
    toast.error('You do not have permission to edit credentials');
    return;
  }
  
  // Perform edit action
}

function handleDelete() {
  if (!canDelete('credentials')) {
    toast.error('You do not have permission to delete credentials');
    return;
  }
  
  // Perform delete action
}
```

## Permission Rules

### Super Admin (Department: Admin)
- Can perform all actions (view, edit, delete) on all modules
- Full system access

### Admin Users

#### Department: Accounts
- **View**: Sales, Credentials, Resellers, Users, Packages
- **Edit**: Sales, Credentials, Resellers, Users, Packages
- **Delete**: None

#### Department: Technical
- **View**: Credentials, Users, Sales, Resellers, Packages
- **Edit**: Credentials, Users
- **Delete**: None

### Viewer Users

#### Department: Accounts
- **View**: Sales, Credentials, Resellers, Users, Packages
- **Edit**: Credentials (only)
- **Delete**: None

## Adding New Permissions

To add new permissions:

1. Add new modules to the `MODULES` constant in `lib/permissions.js`
2. Update the permission rules in `lib/permissions.js`
3. Use the `usePermissions` hook in components to check permissions

## Testing

To test the permission system, run:

```bash
node test/permissions.test.js
```

This will run a series of tests to verify that the permission system works correctly for different user types.