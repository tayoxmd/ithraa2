import type { UserRole } from './permissions';

/**
 * تعيين الأدوار القديمة للأدوار الجديدة
 * Mapping old roles to new roles
 */
export const roleMapping: Record<string, UserRole> = {
  'admin': 'manager',
  'employee': 'staff',
  'customer': 'client',
  'assistant_manager': 'assistantmanager',
  'visa_department_manager': 'visamanager',
  'visa_department_employee': 'visaemployee',
  'specific_financial_manager': 'accountsmanager',
  'specific_financial_employee': 'accountsemployee',
};

/**
 * تحويل الدور القديم إلى الدور الجديد
 * Convert old role to new role
 */
export function migrateRole(oldRole: string): UserRole {
  return roleMapping[oldRole] || oldRole as UserRole;
}

/**
 * الأدوار التي يمكن للمستخدمين تحديدها
 * Roles that can be assigned by users
 */
export const assignableRoles: Array<{ value: UserRole; labelAr: string; labelEn: string }> = [
  { value: 'manager', labelAr: 'مدير', labelEn: 'Manager' },
  { value: 'assistantmanager', labelAr: 'مساعد مدير', labelEn: 'Assistant Manager' },
  { value: 'staff', labelAr: 'موظف', labelEn: 'Staff' },
  { value: 'visamanager', labelAr: 'مدير التأشيرات', labelEn: 'Visa Manager' },
  { value: 'visaemployee', labelAr: 'موظف التأشيرات', labelEn: 'Visa Employee' },
  { value: 'accountsmanager', labelAr: 'مدير المحاسبة', labelEn: 'Accounts Manager' },
  { value: 'accountsemployee', labelAr: 'موظف المحاسبة', labelEn: 'Accounts Employee' },
  { value: 'marketingstaff', labelAr: 'موظف تسويق', labelEn: 'Marketing Staff' },
  { value: 'client', labelAr: 'عميل', labelEn: 'Client' },
  { value: 'company', labelAr: 'شركة', labelEn: 'Company' },
];
