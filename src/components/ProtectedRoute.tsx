import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "./LoadingSpinner";
import { BiometricAuth } from "./BiometricAuth";

// الصفحات التي تتطلب البصمة الحيوية
const BIOMETRIC_REQUIRED_PAGES = [
  '/my-tasks',
  '/task-manager',
  '/private-accounting',
  '/email-manager',
  '/email-settings',
  '/site-settings',
  '/api-settings',
  '/manage-employees',
  '/audit-logs',
];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [biometricVerified, setBiometricVerified] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);
  const [biometricChecked, setBiometricChecked] = useState(false);

  const requiresBiometric = BIOMETRIC_REQUIRED_PAGES.some(path => 
    location.pathname.startsWith(path)
  );

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        setIsAuthorized(false);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin','employee','manager','company'])
        .single();

      setIsAuthorized(!!data);
      setLoading(false);

      // Check if biometric is required and if it's already verified in this session
      if (requiresBiometric && !!data) {
        const biometricKey = `biometric_verified_${user.id}_${location.pathname}`;
        const wasVerified = sessionStorage.getItem(biometricKey);
        
        if (!wasVerified) {
          setShowBiometric(true);
        } else {
          setBiometricVerified(true);
        }
        setBiometricChecked(true);
      } else {
        setBiometricVerified(true);
        setBiometricChecked(true);
      }
    };

    checkRole();
  }, [user, location.pathname, requiresBiometric]);

  const handleBiometricVerified = () => {
    const biometricKey = `biometric_verified_${user.id}_${location.pathname}`;
    sessionStorage.setItem(biometricKey, 'true');
    setBiometricVerified(true);
    setShowBiometric(false);
  };

  const handleBiometricCancel = () => {
    // الرجوع إلى الصفحة السابقة بسهولة
    navigate(-1);
  };

  if (loading || !biometricChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user || !isAuthorized) {
    return <Navigate to="/auth" replace />;
  }

  if (showBiometric && !biometricVerified) {
    return (
      <BiometricAuth
        open={showBiometric}
        onVerified={handleBiometricVerified}
        onCancel={handleBiometricCancel}
      />
    );
  }

  return <>{children}</>;
}