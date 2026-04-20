/**
 * Enhanced authentication and role-based access types
 */

export type UserRole = 'owner' | 'admin' | 'manager' | 'chef' | 'waiter' | 'staff' | 'viewer';

export type Permission = 
  // Dashboard permissions
  | 'dashboard.view'
  | 'dashboard.analytics'
  
  // Orders permissions
  | 'orders.view'
  | 'orders.create'
  | 'orders.update'
  | 'orders.delete'
  | 'pos.access'
  
  // Menu permissions
  | 'menu.view'
  | 'menu.create'
  | 'menu.update'
  | 'menu.delete'
  
  // Inventory permissions
  | 'inventory.view'
  | 'inventory.create'
  | 'inventory.update'
  | 'inventory.delete'
  
  // Staff permissions
  | 'staff.view'
  | 'staff.create'
  | 'staff.update'
  | 'staff.delete'
  | 'staff.manage_roles'
  
  // Customer permissions
  | 'customers.view'
  | 'customers.create'
  | 'customers.update'
  | 'customers.delete'
  
  // Rooms permissions
  | 'rooms.view'
  | 'rooms.create'
  | 'rooms.update'
  | 'rooms.delete'
  | 'rooms.checkout'
  
  // Reservations permissions
  | 'reservations.view'
  | 'reservations.create'
  | 'reservations.update'
  | 'reservations.delete'
  
  // Analytics permissions
  | 'analytics.view'
  | 'analytics.export'
  
  // Financial permissions
  | 'financial.view'
  | 'financial.create'
  | 'financial.update'
  | 'financial.delete'
  | 'financial.reports'
  
  // Settings permissions
  | 'settings.view'
  | 'settings.update'
  | 'settings.manage_users'
  | 'users.manage'
  
  // Kitchen permissions
  | 'kitchen.view'
  | 'kitchen.update'
  
  // Tables permissions
  | 'tables.view'
  | 'tables.create'
  | 'tables.update'
  | 'tables.delete'
  
  // Housekeeping permissions
  | 'housekeeping.view'
  | 'housekeeping.create'
  | 'housekeeping.update'
  | 'housekeeping.delete'
  | 'housekeeping.assign'
  
  // Audit permissions
  | 'audit.view'
  | 'audit.export'
  
  // Backup permissions
  | 'backup.create'
  | 'backup.restore'
  | 'backup.view'
  
  // GDPR permissions
  | 'gdpr.view'
  | 'gdpr.export'
  | 'gdpr.delete';

export interface RolePermissions {
  [key: string]: Permission[];
}

export const rolePermissions: RolePermissions = {
  owner: [
    // Full access to everything
    'dashboard.view', 'dashboard.analytics',
    'orders.view', 'orders.create', 'orders.update', 'orders.delete', 'pos.access',
    'menu.view', 'menu.create', 'menu.update', 'menu.delete',
    'inventory.view', 'inventory.create', 'inventory.update', 'inventory.delete',
    'staff.view', 'staff.create', 'staff.update', 'staff.delete',
    'customers.view', 'customers.create', 'customers.update', 'customers.delete',
    'rooms.view', 'rooms.create', 'rooms.update', 'rooms.delete', 'rooms.checkout',
    'reservations.view', 'reservations.create', 'reservations.update', 'reservations.delete',
    'analytics.view', 'analytics.export',
    'financial.view', 'financial.create', 'financial.update', 'financial.delete', 'financial.reports',
    'settings.view', 'settings.update', 'settings.manage_users', 'users.manage',
    'kitchen.view', 'kitchen.update',
    'tables.view', 'tables.create', 'tables.update', 'tables.delete',
    'housekeeping.view', 'housekeeping.create', 'housekeeping.update', 'housekeeping.delete', 'housekeeping.assign',
    'audit.view', 'audit.export',
    'backup.create', 'backup.restore', 'backup.view',
    'gdpr.view', 'gdpr.export', 'gdpr.delete'
  ],
  admin: [
    // Full access to everything (same as owner)
    'dashboard.view', 'dashboard.analytics',
    'orders.view', 'orders.create', 'orders.update', 'orders.delete', 'pos.access',
    'menu.view', 'menu.create', 'menu.update', 'menu.delete',
    'inventory.view', 'inventory.create', 'inventory.update', 'inventory.delete',
    'staff.view', 'staff.create', 'staff.update', 'staff.delete', 'staff.manage_roles',
    'customers.view', 'customers.create', 'customers.update', 'customers.delete',
    'rooms.view', 'rooms.create', 'rooms.update', 'rooms.delete', 'rooms.checkout',
    'reservations.view', 'reservations.create', 'reservations.update', 'reservations.delete',
    'analytics.view', 'analytics.export',
    'financial.view', 'financial.create', 'financial.update', 'financial.delete', 'financial.reports',
    'settings.view', 'settings.update', 'settings.manage_users', 'users.manage',
    'kitchen.view', 'kitchen.update',
    'tables.view', 'tables.create', 'tables.update', 'tables.delete',
    'housekeeping.view', 'housekeeping.create', 'housekeeping.update', 'housekeeping.delete', 'housekeeping.assign',
    'audit.view', 'audit.export',
    'backup.create', 'backup.restore', 'backup.view',
    'gdpr.view', 'gdpr.export', 'gdpr.delete'
  ],
  manager: [
    // All access except financial reports - managers can now view analytics
    'dashboard.view', 'dashboard.analytics',
    'orders.view', 'orders.create', 'orders.update', 'orders.delete', 'pos.access',
    'menu.view', 'menu.create', 'menu.update', 'menu.delete',
    'inventory.view', 'inventory.create', 'inventory.update', 'inventory.delete',
    'staff.view', 'staff.create', 'staff.update', 'staff.delete',
    'customers.view', 'customers.create', 'customers.update', 'customers.delete',
    'rooms.view', 'rooms.create', 'rooms.update', 'rooms.delete', 'rooms.checkout',
    'reservations.view', 'reservations.create', 'reservations.update', 'reservations.delete',
    'analytics.view', // Added analytics access for managers
    'settings.view', 'settings.update',
    'kitchen.view', 'kitchen.update',
    'tables.view', 'tables.create', 'tables.update', 'tables.delete',
    'housekeeping.view', 'housekeeping.create', 'housekeeping.update', 'housekeeping.delete', 'housekeeping.assign',
    'audit.view',
    'gdpr.view'
  ],
  chef: [
    // Access to orders, kitchen, inventory, menu management - no dashboard access
    'orders.view', 'orders.create', 'orders.update', 'pos.access',
    'menu.view', 'menu.create', 'menu.update', 'menu.delete',
    'inventory.view', 'inventory.create', 'inventory.update', 'inventory.delete',
    'kitchen.view', 'kitchen.update'
  ],
  waiter: [
    // Access to operations and guest services
    'dashboard.view',
    'orders.view', 'orders.create', 'orders.update', 'pos.access',
    'kitchen.view',
    'menu.view',
    'tables.view', 'tables.update',
    'inventory.view',
    'rooms.view', 'rooms.checkout',
    'reservations.view', 'reservations.create', 'reservations.update',
    'housekeeping.view'
  ],
  staff: [
    // Access to operations and guest services - no dashboard, AI, or settings access
    'orders.view', 'orders.create', 'orders.update', 'orders.delete', 'pos.access',
    'menu.view',
    'inventory.view', 'inventory.create', 'inventory.update', 'inventory.delete',
    'kitchen.view',
    'tables.view', 'tables.update',
    'reservations.view', 'reservations.create', 'reservations.update',
    'housekeeping.view'
  ],
  viewer: [
    'dashboard.view',
    // 'orders.view',
    // 'menu.view',
    // 'inventory.view',
    // 'customers.view',
    // 'rooms.view',
    // 'reservations.view'
  ]
};

export interface UserProfile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role: UserRole | string; // Can be system role or custom role name
  role_id?: string; // Foreign key to custom roles table
  role_name_text?: string; // Text representation of custom role
  role_is_system?: boolean; // True if this is a system role (Admin/Owner)
  role_has_full_access?: boolean; // True if user has full access (Admin)
  restaurant_id?: string;
  avatar_url?: string;
  phone?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface UserWithMetadata extends UserProfile {
  restaurants?: {
    name: string;
  };
}

export interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  hasPermission: (permission: Permission) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  isRole: (role: UserRole | string) => boolean;
  signOut: () => Promise<void>;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  components: string[];
  created_at: string;
  updated_at: string;
}

export interface RestaurantSubscription {
  id: string;
  restaurant_id: string;
  subscription_plan_id: string;
  status: 'active' | 'inactive' | 'cancelled';
  subscription_plans: SubscriptionPlan;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Franchise / Organization Types
// ============================================================

export type OrgType = 'single' | 'franchise' | 'chain';
export type OrgMenuMode = 'shared' | 'independent' | 'hybrid';
export type OrgMemberRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer';
export type OrgSubPlan = 'free' | 'starter' | 'professional' | 'enterprise';
export type OrgSubStatus = 'active' | 'inactive' | 'trial' | 'cancelled';
export type MenuItemOrigin = 'master' | 'branch' | 'inherited';

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  type: OrgType;
  owner_user_id?: string;
  logo_url?: string;
  menu_mode: OrgMenuMode;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: OrgMemberRole;
  accessible_branches?: string[] | null; // null = all branches
  created_at: string;
  updated_at: string;
}

export interface OrganizationSubscription {
  id: string;
  organization_id: string;
  plan_type: OrgSubPlan;
  max_branches: number; // -1 = unlimited
  base_price: number;
  per_branch_price: number;
  status: OrgSubStatus;
  trial_ends_at?: string;
  current_period_start: string;
  current_period_end?: string;
  features: string[];
  razorpay_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Branch {
  id: string;
  name: string;
  branch_code?: string;
  is_headquarters: boolean;
  organization_id: string;
  address?: string;
  phone?: string;
  logo_url?: string;
  is_active?: boolean;
}

export interface OrganizationContextType {
  organization: Organization | null;
  branches: Branch[];
  currentBranch: string | 'all'; // restaurant_id or 'all'
  switchBranch: (branchId: string | 'all') => void;
  isMultiBranch: boolean;
  orgRole: OrgMemberRole | null;
  menuMode: OrgMenuMode;
  orgSubscription: OrganizationSubscription | null;
  isLoading: boolean;
}

