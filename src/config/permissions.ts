/**
 * مركز إدارة الأدوار والصلاحيات
 * Central Roles and Permissions Management
 */

// تعريف جميع الأدوار في النظام
export type UserRole = 
  | 'manager'
  | 'assistantmanager'
  | 'staff'
  | 'visamanager'
  | 'visaemployee'
  | 'accountsmanager'
  | 'accountsemployee'
  | 'marketingstaff'
  | 'client'
  | 'company';

// تعريف مفاتيح الصلاحيات
export type PermissionKey =
  // إدارة عامة
  | 'view_dashboard'
  | 'view_reports'
  | 'manage_settings'
  | 'view_audit_logs'
  
  // إدارة المستخدمين
  | 'manage_users'
  | 'view_users'
  | 'assign_roles'
  
  // إدارة الفنادق
  | 'manage_hotels'
  | 'view_hotels'
  | 'manage_hotel_pricing'
  
  // إدارة الحجوزات
  | 'manage_all_bookings'
  | 'view_all_bookings'
  | 'manage_own_bookings'
  | 'view_own_bookings'
  | 'approve_bookings'
  | 'cancel_bookings'
  
  // إدارة المالية والمحاسبة
  | 'manage_vault'
  | 'view_vault'
  | 'manage_transactions'
  | 'view_transactions'
  | 'approve_payments'
  | 'generate_financial_reports'
  
  // إدارة التأشيرات
  | 'manage_visas'
  | 'view_visas'
  | 'process_visa_applications'
  
  // إدارة المهام
  | 'manage_all_tasks'
  | 'view_all_tasks'
  | 'manage_own_tasks'
  | 'view_own_tasks'
  | 'assign_tasks'
  
  // إدارة التسويق
  | 'manage_marketing'
  | 'manage_coupons'
  | 'view_analytics'
  
  // إدارة الموظفين
  | 'manage_employees'
  | 'view_employees'
  | 'manage_attendance'
  | 'manage_salaries';

// خريطة الصلاحيات لكل دور
export const rolePermissions: Record<UserRole, PermissionKey[]> = {
  // المدير - صلاحيات كاملة
  manager: [
    'view_dashboard',
    'view_reports',
    'manage_settings',
    'view_audit_logs',
    'manage_users',
    'view_users',
    'assign_roles',
    'manage_hotels',
    'view_hotels',
    'manage_hotel_pricing',
    'manage_all_bookings',
    'view_all_bookings',
    'approve_bookings',
    'cancel_bookings',
    'manage_vault',
    'view_vault',
    'manage_transactions',
    'view_transactions',
    'approve_payments',
    'generate_financial_reports',
    'manage_visas',
    'view_visas',
    'manage_all_tasks',
    'view_all_tasks',
    'assign_tasks',
    'manage_marketing',
    'manage_coupons',
    'view_analytics',
    'manage_employees',
    'view_employees',
    'manage_attendance',
    'manage_salaries',
  ],

  // مساعد المدير
  assistantmanager: [
    'view_dashboard',
    'view_reports',
    'view_users',
    'view_hotels',
    'manage_all_bookings',
    'view_all_bookings',
    'approve_bookings',
    'view_vault',
    'view_transactions',
    'view_visas',
    'manage_all_tasks',
    'view_all_tasks',
    'assign_tasks',
    'view_analytics',
    'view_employees',
  ],

  // موظف عام
  staff: [
    'view_dashboard',
    'view_hotels',
    'view_all_bookings',
    'manage_own_bookings',
    'view_own_bookings',
    'view_own_tasks',
    'manage_own_tasks',
  ],

  // مدير التأشيرات
  visamanager: [
    'view_dashboard',
    'manage_visas',
    'view_visas',
    'process_visa_applications',
    'view_all_tasks',
    'manage_all_tasks',
    'assign_tasks',
    'view_reports',
  ],

  // موظف التأشيرات
  visaemployee: [
    'view_dashboard',
    'view_visas',
    'process_visa_applications',
    'view_own_tasks',
    'manage_own_tasks',
  ],

  // مدير المحاسبة
  accountsmanager: [
    'view_dashboard',
    'manage_vault',
    'view_vault',
    'manage_transactions',
    'view_transactions',
    'approve_payments',
    'generate_financial_reports',
    'view_all_bookings',
    'view_reports',
    'view_all_tasks',
    'manage_all_tasks',
    'assign_tasks',
  ],

  // موظف المحاسبة
  accountsemployee: [
    'view_dashboard',
    'view_vault',
    'view_transactions',
    'view_all_bookings',
    'view_own_tasks',
    'manage_own_tasks',
  ],

  // موظف التسويق
  marketingstaff: [
    'view_dashboard',
    'manage_marketing',
    'manage_coupons',
    'view_analytics',
    'view_hotels',
    'view_all_bookings',
    'view_own_tasks',
    'manage_own_tasks',
  ],

  // عميل
  client: [
    'view_dashboard',
    'view_hotels',
    'manage_own_bookings',
    'view_own_bookings',
  ],

  // شركة
  company: [
    'view_dashboard',
    'view_hotels',
    'manage_own_bookings',
    'view_own_bookings',
    'view_reports',
  ],
};

// دالة للتحقق من صلاحية دور معين
export function hasPermission(
  role: UserRole | null,
  permission: PermissionKey
): boolean {
  if (!role) return false;
  return rolePermissions[role]?.includes(permission) || false;
}

// دالة للتحقق من أحد الأدوار المتعددة
export function hasAnyRole(
  currentRole: UserRole | null,
  allowedRoles: UserRole[]
): boolean {
  if (!currentRole) return false;
  return allowedRoles.includes(currentRole);
}

// دالة للحصول على جميع الصلاحيات لدور معين
export function getRolePermissions(role: UserRole): PermissionKey[] {
  return rolePermissions[role] || [];
}

// تصنيف الأدوار حسب المستوى
export const roleHierarchy: Record<UserRole, number> = {
  manager: 10,
  assistantmanager: 9,
  accountsmanager: 8,
  visamanager: 8,
  staff: 5,
  accountsemployee: 4,
  visaemployee: 4,
  marketingstaff: 4,
  company: 2,
  client: 1,
};

// دالة للتحقق إذا كان الدور الأول أعلى من الثاني
export function isRoleHigher(role1: UserRole, role2: UserRole): boolean {
  return roleHierarchy[role1] > roleHierarchy[role2];
}

// أسماء الأدوار للعرض
export const roleDisplayNames: Record<UserRole, { ar: string; en: string }> = {
  manager: { ar: 'مدير', en: 'Manager' },
  assistantmanager: { ar: 'مساعد مدير', en: 'Assistant Manager' },
  staff: { ar: 'موظف', en: 'Staff' },
  visamanager: { ar: 'مدير التأشيرات', en: 'Visa Manager' },
  visaemployee: { ar: 'موظف التأشيرات', en: 'Visa Employee' },
  accountsmanager: { ar: 'مدير المحاسبة', en: 'Accounts Manager' },
  accountsemployee: { ar: 'موظف المحاسبة', en: 'Accounts Employee' },
  marketingstaff: { ar: 'موظف تسويق', en: 'Marketing Staff' },
  client: { ar: 'عميل', en: 'Client' },
  company: { ar: 'شركة', en: 'Company' },
};
