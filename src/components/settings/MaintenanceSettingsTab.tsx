import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertTriangle, Wrench, RefreshCw, Trash2, Activity } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MaintenanceModal from '@/components/maintenance/MaintenanceModal';

export default function MaintenanceSettingsTab() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [maintenanceState, setMaintenanceState] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Maintenance toggle state
  const [isActive, setIsActive] = useState(false);
  const [message, setMessage] = useState('');
  const [allowAdminAccess, setAllowAdminAccess] = useState(true);
  const [eta, setEta] = useState<number | undefined>();

  useEffect(() => {
    loadMaintenanceState();
  }, []);

  const loadMaintenanceState = async () => {
    try {
      const token = session?.access_token;
      if (!token) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/maintenance-history?type=state`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      if (data.success && data.data) {
        setMaintenanceState(data.data);
        setIsActive(data.data.is_active || false);
        setMessage(data.data.message || '');
        setAllowAdminAccess(data.data.allow_admin_access ?? true);
        setEta(data.data.eta_minutes);
      }
    } catch (error: any) {
      console.error('Error loading maintenance state:', error);
    }
  };

  const handleToggleMaintenance = async () => {
    setLoading(true);
    try {
      const token = session?.access_token;
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/maintenance-toggle`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            on: !isActive,
            message,
            allowAdminAccess,
            eta
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to toggle maintenance');
      }

      setIsActive(!isActive);
      
      toast({
        title: t({ 
          ar: isActive ? 'تم إيقاف وضع الصيانة' : 'تم تفعيل وضع الصيانة', 
          en: isActive ? 'Maintenance Disabled' : 'Maintenance Enabled' 
        }),
        description: t({ 
          ar: isActive ? 'الموقع الآن متاح للجميع' : 'الموقع الآن في وضع الصيانة', 
          en: isActive ? 'Site is now available to everyone' : 'Site is now in maintenance mode' 
        }),
      });

      loadMaintenanceState();
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

  const handleServiceWorkerAction = async (action: 'skip-waiting' | 'unregister') => {
    setLoading(true);
    try {
      const token = session?.access_token;
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/maintenance-sw-control`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to control service worker');
      }

      // Execute client-side action
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        
        if (action === 'skip-waiting' && registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          toast({
            title: t({ ar: 'تم الإرسال', en: 'Sent' }),
            description: t({ ar: 'تم إرسال أمر التحديث لجميع العملاء', en: 'Update command sent to all clients' }),
          });
        } else if (action === 'unregister') {
          await registration?.unregister();
          toast({
            title: t({ ar: 'تم إلغاء التسجيل', en: 'Unregistered' }),
            description: t({ ar: 'تم إلغاء تسجيل Service Worker', en: 'Service Worker unregistered' }),
          });
        }
      }
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            {t({ ar: 'الصيانة والطوارئ', en: 'Maintenance & Emergency' })}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t({ 
              ar: 'إدارة وضع الصيانة والإصلاحات الطارئة', 
              en: 'Manage maintenance mode and emergency fixes' 
            })}
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Activity className="w-4 h-4 mr-2" />
          {t({ ar: 'الإعدادات المتقدمة', en: 'Advanced Settings' })}
        </Button>
      </div>

      {/* Quick Maintenance Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {t({ ar: 'وضع الصيانة', en: 'Maintenance Mode' })}
          </CardTitle>
          <CardDescription>
            {t({ 
              ar: 'تفعيل/إيقاف وضع الصيانة للموقع', 
              en: 'Enable/disable site maintenance mode' 
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-base">
                {t({ ar: 'الحالة', en: 'Status' })}
              </Label>
              <p className="text-sm text-muted-foreground">
                {isActive 
                  ? t({ ar: 'الموقع في وضع الصيانة', en: 'Site is in maintenance mode' })
                  : t({ ar: 'الموقع يعمل بشكل طبيعي', en: 'Site is operating normally' })
                }
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={handleToggleMaintenance}
              disabled={loading}
            />
          </div>

          {isActive && (
            <>
              <div className="space-y-2">
                <Label>{t({ ar: 'رسالة الصيانة', en: 'Maintenance Message' })}</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t({ 
                    ar: 'نحن نعمل على تحسين الموقع...', 
                    en: 'We are working to improve the site...' 
                  })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>{t({ ar: 'الوقت المتوقع (دقائق)', en: 'Estimated Time (minutes)' })}</Label>
                <Input
                  type="number"
                  value={eta || ''}
                  onChange={(e) => setEta(parseInt(e.target.value) || undefined)}
                  placeholder="30"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={allowAdminAccess}
                  onCheckedChange={setAllowAdminAccess}
                />
                <Label>
                  {t({ ar: 'السماح بوصول المدراء', en: 'Allow Admin Access' })}
                </Label>
              </div>
            </>
          )}

          <Button 
            onClick={handleToggleMaintenance} 
            disabled={loading}
            className="w-full"
            variant={isActive ? 'destructive' : 'default'}
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isActive 
              ? t({ ar: 'إيقاف وضع الصيانة', en: 'Disable Maintenance' })
              : t({ ar: 'تفعيل وضع الصيانة', en: 'Enable Maintenance' })
            }
          </Button>
        </CardContent>
      </Card>

      {/* Service Worker Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            {t({ ar: 'التحكم في Service Worker', en: 'Service Worker Control' })}
          </CardTitle>
          <CardDescription>
            {t({ 
              ar: 'إدارة تحديثات Service Worker', 
              en: 'Manage Service Worker updates' 
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={() => handleServiceWorkerAction('skip-waiting')}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t({ ar: 'تحديث جميع العملاء', en: 'Update All Clients' })}
          </Button>
          
          <Button
            onClick={() => handleServiceWorkerAction('unregister')}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t({ ar: 'إلغاء تسجيل SW', en: 'Unregister SW' })}
          </Button>
        </CardContent>
      </Card>

      {/* Maintenance Modal */}
      <MaintenanceModal 
        open={showModal}
        onClose={() => setShowModal(false)}
        onRefresh={loadMaintenanceState}
      />
    </div>
  );
}
