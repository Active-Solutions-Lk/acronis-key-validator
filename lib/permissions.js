/**
 * Permission management utility for user roles and departments
 */

// Define permission levels
export const PERMISSION_LEVELS = {
  VIEW: 'view',
  EDIT: 'edit',
  DELETE: 'delete',
  ADMIN: 'admin'
};

// Define departments
export const DEPARTMENTS = {
  ACCOUNTS: 'accounts',
  ADMIN: 'admin',
  TECHNICAL: 'technical',
  MARKETING: 'marketing'
};

// Define user privileges
export const PRIVILEGES = {
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  VIEWER: 'viewer'
};

// Define modules/pages
export const MODULES = {
  SALES: 'sales',
  CREDENTIALS: 'credentials',
  RESSELLERS: 'resellers',
  USERS: 'users',
  PACKAGES: 'packages',
  SETTINGS: 'settings'
};

/**
 * Check if a user has permission for a specific action on a module
 * @param {Object} user - The user object with privilege and department
 * @param {string} action - The action to check (view, edit, delete)
 * @param {string} module - The module to check permissions for
 * @returns {boolean} - Whether the user has permission
 */
export function hasPermission(user, action, module) {
  // If no user, deny permission
  if (!user) {
    return false;
  }

  // Super admin can do everything (regardless of department)
//  console.log('Checking permission for user:', user)
  if (user.privilege && user.privilege.toLowerCase() === PRIVILEGES.SUPER_ADMIN) {
//console.log('User is super admin, granting all permissions');
    return true;
  }

  // Define permission rules based on privilege and department
  const permissionRules = {
    // Admin users
    [PRIVILEGES.ADMIN]: {
      [DEPARTMENTS.ACCOUNTS]: {
        [MODULES.SALES]: [PERMISSION_LEVELS.VIEW, PERMISSION_LEVELS.EDIT],
        [MODULES.CREDENTIALS]: [PERMISSION_LEVELS.VIEW, PERMISSION_LEVELS.EDIT, PERMISSION_LEVELS.DELETE],
        [MODULES.RESSELLERS]: [PERMISSION_LEVELS.VIEW, PERMISSION_LEVELS.EDIT],
        [MODULES.USERS]: [PERMISSION_LEVELS.VIEW, PERMISSION_LEVELS.EDIT],
        [MODULES.PACKAGES]: [PERMISSION_LEVELS.VIEW, PERMISSION_LEVELS.EDIT],
        [MODULES.SETTINGS]: [PERMISSION_LEVELS.VIEW, PERMISSION_LEVELS.EDIT]
      },
      [DEPARTMENTS.TECHNICAL]: {
        [MODULES.CREDENTIALS]: [PERMISSION_LEVELS.VIEW, PERMISSION_LEVELS.EDIT, PERMISSION_LEVELS.DELETE],
        [MODULES.USERS]: [PERMISSION_LEVELS.VIEW, PERMISSION_LEVELS.EDIT],
        [MODULES.RESSELLERS]: [PERMISSION_LEVELS.VIEW],
        [MODULES.SETTINGS]: [PERMISSION_LEVELS.VIEW, PERMISSION_LEVELS.EDIT] // Updated: Allow Technical Admins to edit settings
      },
      [DEPARTMENTS.MARKETING]: {
        [MODULES.CREDENTIALS]: [PERMISSION_LEVELS.VIEW, PERMISSION_LEVELS.EDIT],
        [MODULES.USERS]: [PERMISSION_LEVELS.VIEW, PERMISSION_LEVELS.EDIT],
        [MODULES.SALES]: [PERMISSION_LEVELS.VIEW], // Marketing Admins can only view sales
        [MODULES.PACKAGES]: [PERMISSION_LEVELS.VIEW],
        [MODULES.SETTINGS]: [PERMISSION_LEVELS.VIEW, PERMISSION_LEVELS.EDIT],

      }
    },
    // Viewer users
    [PRIVILEGES.VIEWER]: {
      [DEPARTMENTS.ACCOUNTS]: {
        [MODULES.SALES]: [PERMISSION_LEVELS.VIEW], // Accounts viewers can view sales
        [MODULES.CREDENTIALS]: [PERMISSION_LEVELS.VIEW], // Viewers can only view credentials, not edit
        [MODULES.RESSELLERS]: [PERMISSION_LEVELS.VIEW],
        [MODULES.USERS]: [PERMISSION_LEVELS.VIEW],
        [MODULES.SETTINGS]: [PERMISSION_LEVELS.VIEW] // Added settings view permission

      },
      [DEPARTMENTS.TECHNICAL]: {
        [MODULES.CREDENTIALS]: [PERMISSION_LEVELS.VIEW], // Technical viewers can only view credentials
        [MODULES.USERS]: [PERMISSION_LEVELS.VIEW],
        [MODULES.RESSELLERS]: [PERMISSION_LEVELS.VIEW],
        [MODULES.PACKAGES]: [PERMISSION_LEVELS.VIEW],
        [MODULES.SETTINGS]: [PERMISSION_LEVELS.VIEW],
        [MODULES.SALES]: [] // Technical viewers cannot view sales

      },
      [DEPARTMENTS.MARKETING]: {
        [MODULES.CREDENTIALS]: [PERMISSION_LEVELS.VIEW],
        [MODULES.USERS]: [PERMISSION_LEVELS.VIEW],
        [MODULES.SALES]: [PERMISSION_LEVELS.VIEW], // Marketing viewers can view sales
        [MODULES.RESSELLERS]: [PERMISSION_LEVELS.VIEW],
        [MODULES.SETTINGS]: [PERMISSION_LEVELS.VIEW] // Added settings view permission

      }
    }
  };

  // Normalize user privilege and department for comparison
  const userPrivilege = user.privilege?.toLowerCase();
  const userDepartment = user.department?.toLowerCase();

  //('Normalized user privilege:', userPrivilege, 'department:', userDepartment);
 // console.log('Permission rules for user privilege:', userPrivilege, 'and department:', userDepartment, 'are:', permissionRules[userPrivilege]?.[userDepartment])
  
  // Get the rules for this user's privilege and department
  const userRules = permissionRules[userPrivilege]?.[userDepartment];

  // If no specific rules, deny permission
  if (!userRules) {
 //   console.log('No permission rules found for user');
    return false;
  }

  // Check if the user has the required permission for this module
  const modulePermissions = userRules[module] || [];
  const hasPermission = modulePermissions.includes(action);
 // console.log('Module:', module, 'Action:', action, 'Has permission:', hasPermission);
  return hasPermission;
}

/**
 * Check if a user can view a module
 * @param {Object} user - The user object
 * @param {string} module - The module to check
 * @returns {boolean} - Whether the user can view the module
 */
export function canView(user, module) {
  const result = hasPermission(user, PERMISSION_LEVELS.VIEW, module);
 // console.log('canView for module:', module, 'result:', result);
  return result;
}

/**
 * Check if a user can edit a module
 * @param {Object} user - The user object
 * @param {string} module - The module to check
 * @returns {boolean} - Whether the user can edit the module
 */
export function canEdit(user, module) {
  const result = hasPermission(user, PERMISSION_LEVELS.EDIT, module);
 // console.log('canEdit for module:', module, 'result:', result);
  return result;
}

/**
 * Check if a user can delete from a module
 * @param {Object} user - The user object
 * @param {string} module - The module to check
 * @returns {boolean} - Whether the user can delete from the module
 */
export function canDelete(user, module) {
  // Super admin can delete everything (regardless of department)
  if (user.privilege && user.privilege.toLowerCase() === PRIVILEGES.SUPER_ADMIN) {
    return true;
  }
  
  // For other users, check specific delete permissions
  const result = hasPermission(user, PERMISSION_LEVELS.DELETE, module);
//  console.log('canDelete for module:', module, 'result:', result);
  return result;
}

/**
 * Check if a user is a super admin
 * @param {Object} user - The user object
 * @returns {boolean} - Whether the user is a super admin
 */
export function isSuperAdmin(user) {
  const result = user && user.privilege && user.privilege.toLowerCase() === PRIVILEGES.SUPER_ADMIN;
 // console.log('isSuperAdmin result:', result);
  return result;
}

/**
 * Get all modules a user can view
 * @param {Object} user - The user object
 * @returns {Array} - Array of modules the user can view
 */
export function getViewableModules(user) {
  const viewableModules = [];
  
  Object.values(MODULES).forEach(module => {
    if (canView(user, module)) {
      viewableModules.push(module);
    }
  });
  
  return viewableModules;
}

/**
 * Get all modules a user can edit
 * @param {Object} user - The user object
 * @returns {Array} - Array of modules the user can edit
 */
export function getEditableModules(user) {
  const editableModules = [];
  
  Object.values(MODULES).forEach(module => {
    if (canEdit(user, module)) {
      editableModules.push(module);
    }
  });
  
  return editableModules;
}

/**
 * Get all modules a user can delete from
 * @param {Object} user - The user object
 * @returns {Array} - Array of modules the user can delete from
 */
export function getDeletableModules(user) {
  const deletableModules = [];
  
  Object.values(MODULES).forEach(module => {
    if (canDelete(user, module)) {
      deletableModules.push(module);
    }
  });
  
  return deletableModules;
}