export interface Admin {
  id: number;
  user_name: string;
  password: string;
  email: string;
  sync: number;
  department: string;
  privilege: string;
  created_at: Date;
  updated_at: Date;
}

export function hasPermission(user: Admin, action: string, module: string): boolean;
export function canView(user: Admin, module: string): boolean;
export function canEdit(user: Admin, module: string): boolean;
export function canDelete(user: Admin, module: string): boolean;
export function isSuperAdmin(user: Admin): boolean;
export function getViewableModules(user: Admin): string[];
export function getEditableModules(user: Admin): string[];
export function getDeletableModules(user: Admin): string[];