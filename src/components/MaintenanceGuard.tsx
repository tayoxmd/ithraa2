import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Wrench, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';

interface MaintenanceGuardProps {
  children: React.ReactNode;
}

export default function MaintenanceGuard({ children }: MaintenanceGuardProps) {
  const { user, userRole } = useAuth();
  const { t } = useLanguage();
  const [maintenanceState, setMaintenanceState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkMaintenanceMode();

    // Set up realtime subscription for maintenance state changes
    const channel = supabase
      .channel('maintenance_state_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'maintenance_state'
        },
        () => {
          checkMaintenanceMode();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, userRole]);

  const checkMaintenanceMode = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_state')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking maintenance:', error);
      }

      setMaintenanceState(data);
    } catch (error) {
      console.error('Error checking maintenance:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking
  if (loading) {
    return <>{children}</>;
  }

  // If maintenance is active and user is not admin (or admin access not allowed)
  if (maintenanceState?.is_active) {
    const isAdmin = userRole === 'manager';
    const allowAdminAccess = maintenanceState.allow_admin_access ?? true;

    // Show maintenance page to non-admins or if admin access is disabled
    if (!isAdmin || !allowAdminAccess) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Wrench className="w-16 h-16 text-primary animate-pulse" />
              </div>
              <CardTitle className="text-3xl">
                {t({ ar: 'الموقع تحت الصيانة', en: 'Site Under Maintenance' })}
              </CardTitle>
              <CardDescription className="text-lg">
                {maintenanceState.message || t({ 
                  ar: 'نحن نعمل على تحسين الموقع. سنعود قريباً.', 
                  en: 'We are working to improve the site. We will be back soon.' 
                })}
              </CardDescription>
            </CardHeader>
            {maintenanceState.eta_minutes && (
              <CardContent className="text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Clock className="w-5 h-5" />
                  <span>
                    {t({ ar: 'الوقت المتوقع:', en: 'Estimated time:' })} {maintenanceState.eta_minutes} {t({ ar: 'دقيقة', en: 'minutes' })}
                  </span>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      );
    }
  }

  // Allow access
  return <>{children}</>;
}
