import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { LoadingSpinner } from "./LoadingSpinner";
import { useHasPermission } from "@/hooks/usePermission";
import type { PermissionKey, UserRole } from "@/config/permissions";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: PermissionKey;
  requiredRoles?: UserRole[];
  fallbackPath?: string;
}

/**
 * مسار محمي بناءً على الصلاحيات أو الأدوار
 * Protected route based on permissions or roles
 */
export default function ProtectedRoute({ 
  children, 
  requiredPermission,
  requiredRoles,
  fallbackPath = "/auth"
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const { hasPermission, hasAnyRole } = useHasPermission();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={fallbackPath} replace />;
  }

  // التحقق من الصلاحية المطلوبة
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/" replace />;
  }

  // التحقق من الأدوار المطلوبة
  if (requiredRoles && !hasAnyRole(requiredRoles)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}