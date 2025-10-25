import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import NavyModernDashboard from './dashboards/NavyModernDashboard';
import WhiteCleanDashboard from './dashboards/WhiteCleanDashboard';
import BlackMinimalDashboard from './dashboards/BlackMinimalDashboard';
import NavyVariantDashboard from './dashboards/NavyVariantDashboard';

type DashboardType = 'navy-modern' | 'white-clean' | 'black-minimal' | 'navy-variant';

export default function DashboardSelector() {
  const { user } = useAuth();
  const [selectedDashboard, setSelectedDashboard] = useState<DashboardType>('navy-modern');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserDashboardPreference();
  }, [user]);

  const loadUserDashboardPreference = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const preferences = data?.preferences as any;
      if (preferences?.dashboard) {
        setSelectedDashboard(preferences.dashboard as DashboardType);
      }
    } catch (error) {
      console.error('Error loading dashboard preference:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const dashboards: Record<DashboardType, JSX.Element> = {
    'navy-modern': <NavyModernDashboard />,
    'white-clean': <WhiteCleanDashboard />,
    'black-minimal': <BlackMinimalDashboard />,
    'navy-variant': <NavyVariantDashboard />
  };

  return dashboards[selectedDashboard] || dashboards['navy-modern'];
}
