import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Monitor, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type DashboardType = 'navy-modern' | 'white-clean' | 'black-minimal' | 'navy-variant';

export default function DashboardSettingsTab() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentDashboard, setCurrentDashboard] = useState<DashboardType>('navy-modern');
  const [showForceDialog, setShowForceDialog] = useState(false);
  const [selectedForceApply, setSelectedForceApply] = useState<DashboardType | null>(null);
  const [confirmText, setConfirmText] = useState('');

  const dashboards = [
    {
      type: 'navy-modern' as DashboardType,
      name: { ar: 'أزرق عصري', en: 'Navy Modern' },
      description: { ar: 'تصميم أزرق احترافي مع تدرجات عصرية', en: 'Professional navy design with modern gradients' },
      preview: '/images/dashboard-navy.png'
    },
    {
      type: 'white-clean' as DashboardType,
      name: { ar: 'أبيض نظيف', en: 'White Clean' },
      description: { ar: 'تصميم بسيط وأنيق باللون الأبيض', en: 'Simple and elegant white design' },
      preview: '/images/dashboard-white.png'
    },
    {
      type: 'black-minimal' as DashboardType,
      name: { ar: 'أسود بسيط', en: 'Black Minimal' },
      description: { ar: 'تصميم داكن بسيط مع تباين عالي', en: 'Dark minimal design with high contrast' },
      preview: '/images/dashboard-black.png'
    },
    {
      type: 'navy-variant' as DashboardType,
      name: { ar: 'متغير أزرق', en: 'Navy Variant' },
      description: { ar: 'تصميم داكن مع إمكانية تخصيص اللون الأساسي', en: 'Dark layout with customizable primary color' },
      preview: '/images/dashboard-variant.png'
    }
  ];

  useEffect(() => {
    loadUserDashboard();
  }, [user]);

  const loadUserDashboard = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      const preferences = data?.preferences as any;
      if (preferences?.dashboard) {
        setCurrentDashboard(preferences.dashboard);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const handleApplyDashboard = async (dashboardType: DashboardType) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { data: currentData } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();

      const currentPreferences = (currentData?.preferences as any) || {};

      const { error } = await supabase
        .from('profiles')
        .update({
          preferences: {
            ...currentPreferences,
            dashboard: dashboardType
          }
        })
        .eq('id', user.id);

      if (error) throw error;

      setCurrentDashboard(dashboardType);

      // Log admin action
      await supabase.from('admin_actions').insert({
        user_id: user.id,
        action_type: 'dashboard_apply',
        entity_type: 'dashboard',
        details: { dashboard_type: dashboardType }
      });

      toast({
        title: t({ ar: 'تم التطبيق', en: 'Applied' }),
        description: t({ ar: 'تم تطبيق تصميم اللوحة بنجاح', en: 'Dashboard design applied successfully' }),
      });

      // Reload page to apply changes
      setTimeout(() => window.location.reload(), 1000);
    } catch (error: any) {
      toast({
        title: t({ ar: 'خطأ', en: 'Error' }),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForceApply = async () => {
    if (confirmText !== 'FORCE APPLY' || !selectedForceApply) return;

    setLoading(true);
    try {
      // Get all profiles
      const { data: profiles, error: fetchError } = await supabase
        .from('profiles')
        .select('id, preferences');

      if (fetchError) throw fetchError;

      // Update each profile
      const updates = profiles?.map(profile => {
        const currentPreferences = (profile.preferences as any) || {};
        return supabase
          .from('profiles')
          .update({
            preferences: {
              ...currentPreferences,
              dashboard: selectedForceApply,
              forced: true
            }
          })
          .eq('id', profile.id);
      });

      if (updates) {
        await Promise.all(updates);
      }

      // Log admin action
      await supabase.from('admin_actions').insert({
        user_id: user?.id,
        action_type: 'dashboard_force_all',
        entity_type: 'dashboard',
        details: { 
          dashboard_type: selectedForceApply,
          affected_users: profiles?.length || 0
        }
      });

      toast({
        title: t({ ar: 'تم التطبيق القسري', en: 'Force Applied' }),
        description: t({ ar: 'تم تطبيق التصميم لجميع المستخدمين', en: 'Dashboard applied to all users' }),
      });

      setShowForceDialog(false);
      setConfirmText('');
      setSelectedForceApply(null);
    } catch (error: any) {
      toast({
        title: t({ ar: 'خطأ', en: 'Error' }),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">
          {t({ ar: 'تصميم لوحة التحكم', en: 'Dashboard Design' })}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t({ ar: 'اختر تصميم لوحة التحكم المناسب', en: 'Choose your preferred dashboard design' })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dashboards.map((dashboard) => (
          <Card key={dashboard.type} className={currentDashboard === dashboard.type ? 'border-primary ring-2 ring-primary' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {t(dashboard.name)}
                  {currentDashboard === dashboard.type && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </CardTitle>
                <Monitor className="w-5 h-5 text-muted-foreground" />
              </div>
              <CardDescription>
                {t(dashboard.description)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                <span className="text-muted-foreground text-sm">
                  {t({ ar: 'معاينة', en: 'Preview' })}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleApplyDashboard(dashboard.type)}
                  disabled={loading || currentDashboard === dashboard.type}
                  className="flex-1"
                  variant={currentDashboard === dashboard.type ? 'default' : 'outline'}
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {currentDashboard === dashboard.type 
                    ? t({ ar: 'مطبق حالياً', en: 'Currently Applied' })
                    : t({ ar: 'تطبيق', en: 'Apply' })
                  }
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setSelectedForceApply(dashboard.type);
                    setShowForceDialog(true);
                  }}
                >
                  {t({ ar: 'تطبيق قسري', en: 'Force' })}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Force Apply Dialog */}
      <Dialog open={showForceDialog} onOpenChange={setShowForceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">
              {t({ ar: 'تحذير: تطبيق قسري', en: 'Warning: Force Apply' })}
            </DialogTitle>
            <DialogDescription>
              {t({ 
                ar: 'هذا سيطبق التصميم على جميع المستخدمين ويتجاوز تفضيلاتهم. اكتب "FORCE APPLY" للتأكيد.',
                en: 'This will apply the dashboard to all users and override their preferences. Type "FORCE APPLY" to confirm.'
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t({ ar: 'تأكيد العملية', en: 'Confirm Action' })}</Label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="FORCE APPLY"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowForceDialog(false);
              setConfirmText('');
              setSelectedForceApply(null);
            }}>
              {t({ ar: 'إلغاء', en: 'Cancel' })}
            </Button>
            <Button
              variant="destructive"
              onClick={handleForceApply}
              disabled={confirmText !== 'FORCE APPLY' || loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t({ ar: 'تطبيق قسري', en: 'Force Apply' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
