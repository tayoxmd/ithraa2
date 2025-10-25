import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Trash2, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

export default function CacheSettingsTab() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paths, setPaths] = useState('');
  const [surrogateKeys, setSurrogateKeys] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [purgeType, setPurgeType] = useState<'selective' | 'all'>('selective');

  const handlePurgeCache = async (purgeAll: boolean = false) => {
    setLoading(true);
    try {
      const token = session?.access_token;
      if (!token) {
        throw new Error('Not authenticated');
      }

      const pathsArray = paths
        .split('\n')
        .map(p => p.trim())
        .filter(p => p.length > 0);
      
      const keysArray = surrogateKeys
        .split('\n')
        .map(k => k.trim())
        .filter(k => k.length > 0);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/purge-cache`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            paths: pathsArray,
            surrogateKeys: keysArray,
            purgeAll
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Purge failed');
      }

      toast({
        title: t({ ar: 'تم تنظيف الذاكرة المؤقتة', en: 'Cache Purged' }),
        description: t({ 
          ar: 'تم تنظيف الذاكرة المؤقتة بنجاح', 
          en: 'Cache purged successfully' 
        }),
      });

      setPaths('');
      setSurrogateKeys('');
      setShowConfirmDialog(false);

      // Trigger service worker update
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration?.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          window.location.reload();
        }
      }

    } catch (error: any) {
      toast({
        title: t({ ar: 'خطأ', en: 'Error' }),
        description: error.message || t({ 
          ar: 'فشل تنظيف الذاكرة المؤقتة', 
          en: 'Failed to purge cache' 
        }),
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
          {t({ ar: 'إدارة الذاكرة المؤقتة', en: 'Cache Management' })}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t({ 
            ar: 'قم بتنظيف الذاكرة المؤقتة لتطبيق التحديثات الجديدة', 
            en: 'Clear cache to apply new updates' 
          })}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t({ ar: 'تنظيف انتقائي', en: 'Selective Purge' })}</CardTitle>
          <CardDescription>
            {t({ 
              ar: 'قم بتنظيف مسارات أو مفاتيح محددة', 
              en: 'Purge specific paths or surrogate keys' 
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t({ ar: 'المسارات', en: 'Paths' })}</Label>
            <Textarea
              value={paths}
              onChange={(e) => setPaths(e.target.value)}
              placeholder={t({ 
                ar: '/hotel/123\n/search\n/api/hotels', 
                en: '/hotel/123\n/search\n/api/hotels' 
              })}
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              {t({ ar: 'مسار واحد في كل سطر', en: 'One path per line' })}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t({ ar: 'المفاتيح البديلة', en: 'Surrogate Keys' })}</Label>
            <Textarea
              value={surrogateKeys}
              onChange={(e) => setSurrogateKeys(e.target.value)}
              placeholder="hotel-123\nhotel-list\nuser-data"
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              {t({ ar: 'مفتاح واحد في كل سطر', en: 'One key per line' })}
            </p>
          </div>

          <Button 
            onClick={() => handlePurgeCache(false)} 
            disabled={loading || (paths.length === 0 && surrogateKeys.length === 0)}
            className="w-full"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {t({ ar: 'تنظيف محدد', en: 'Purge Selected' })}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            {t({ ar: 'تنظيف شامل', en: 'Purge All' })}
          </CardTitle>
          <CardDescription>
            {t({ 
              ar: 'تنظيف جميع الذاكرة المؤقتة - استخدم بحذر', 
              en: 'Clear all cache - use with caution' 
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive"
            onClick={() => {
              setPurgeType('all');
              setShowConfirmDialog(true);
            }}
            disabled={loading}
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t({ ar: 'تنظيف كل شيء', en: 'Purge Everything' })}
          </Button>
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">
              {t({ ar: 'تأكيد التنظيف الشامل', en: 'Confirm Purge All' })}
            </DialogTitle>
            <DialogDescription>
              {t({ 
                ar: 'هذا سيقوم بتنظيف جميع الذاكرة المؤقتة وإعادة تحميل الصفحة للجميع. هل أنت متأكد؟',
                en: 'This will clear all cache and reload the page for everyone. Are you sure?'
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmDialog(false)}
            >
              {t({ ar: 'إلغاء', en: 'Cancel' })}
            </Button>
            <Button 
              variant="destructive"
              onClick={() => handlePurgeCache(true)}
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t({ ar: 'تأكيد التنظيف', en: 'Confirm Purge' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
