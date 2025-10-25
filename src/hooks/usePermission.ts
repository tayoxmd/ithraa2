import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, hasAnyRole, type PermissionKey, type UserRole } from '@/config/permissions';

/**
 * Hook للتحقق من الصلاحيات
 * Hook for checking permissions
 */
export function useHasPermission() {
  const { userRole } = useAuth();

  /**
   * تحقق إذا كان المستخدم الحالي لديه صلاحية معينة
   * Check if current user has a specific permission
   */
  const checkPermission = (permission: PermissionKey): boolean => {
    return hasPermission(userRole as UserRole | null, permission);
  };

  /**
   * تحقق إذا كان المستخدم الحالي يملك أحد الأدوار المحددة
   * Check if current user has any of the specified roles
   */
  const checkRoles = (roles: UserRole[]): boolean => {
    return hasAnyRole(userRole as UserRole | null, roles);
  };

  /**
   * تحقق إذا كان المستخدم الحالي يملك دور معين
   * Check if current user has a specific role
   */
  const checkRole = (role: UserRole): boolean => {
    return userRole === role;
  };

  return {
    hasPermission: checkPermission,
    hasAnyRole: checkRoles,
    hasRole: checkRole,
    userRole: userRole as UserRole | null,
  };
}

/**
 * Hook مبسط للتحقق من صلاحية واحدة
 * Simplified hook for checking a single permission
 */
export function usePermission(permission: PermissionKey): boolean {
  const { hasPermission } = useHasPermission();
  return hasPermission(permission);
}
