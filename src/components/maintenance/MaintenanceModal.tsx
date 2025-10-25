import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, History, Archive, Trash2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MaintenanceModalProps {
  open: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

export default function MaintenanceModal({ open, onClose, onRefresh }: MaintenanceModalProps) {
  const { t } = useLanguage();
  const { session } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('history');
  const [history, setHistory] = useState<any[]>([]);
  const [snapshots, setSnapshots] = useState<any[]>([]);

  useEffect(() => {
    if (open) {
      loadHistory();
      loadSnapshots();
    }
  }, [open]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const token = session?.access_token;
      if (!token) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/maintenance-history?type=actions`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setHistory(data.data || []);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSnapshots = async () => {
    try {
      const token = session?.access_token;
      if (!token) return;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/maintenance-history?type=snapshots`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setSnapshots(data.data || []);
      }
    } catch (error) {
      console.error('Error loading snapshots:', error);
    }
  };

  const handlePurgeCacheAll = async () => {
    if (!confirm(t({ ar: 'هل أنت متأكد من تنظيف جميع الذاكرة المؤقتة؟', en: 'Are you sure you want to purge all cache?' }))) {
      return;
    }

    setLoading(true);
    try {
      const token = session?.access_token;
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/purge-cache`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            purgeAll: true
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to purge cache');
      }

      toast({
        title: t({ ar: 'تم التنظيف', en: 'Purged' }),
        description: t({ ar: 'تم تنظيف جميع الذاكرة المؤقتة بنجاح', en: 'All cache purged successfully' }),
      });

      onRefresh();
      loadHistory();
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionBadge = (actionType: string) => {
    const badges: Record<string, { label: string; variant: any }> = {
      'maintenance_enabled': { label: 'Enabled', variant: 'default' },
      'maintenance_disabled': { label: 'Disabled', variant: 'secondary' },
      'sw_skip_waiting': { label: 'SW Update', variant: 'default' },
      'sw_unregister': { label: 'SW Unregister', variant: 'destructive' },
      'cache_purge': { label: 'Cache Purge', variant: 'default' },
    };

    const badge = badges[actionType] || { label: actionType, variant: 'outline' };
    return <Badge variant={badge.variant as any}>{badge.label}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {t({ ar: 'الصيانة والإصلاحات الطارئة', en: 'Maintenance & Emergency Fixes' })}
          </DialogTitle>
          <DialogDescription>
            {t({ 
              ar: 'إدارة متقدمة لوضع الصيانة والإصلاحات الطارئة', 
              en: 'Advanced management for maintenance mode and emergency fixes' 
            })}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" />
              {t({ ar: 'السجل', en: 'History' })}
            </TabsTrigger>
            <TabsTrigger value="snapshots">
              <Archive className="w-4 h-4 mr-2" />
              {t({ ar: 'اللقطات', en: 'Snapshots' })}
            </TabsTrigger>
            <TabsTrigger value="emergency">
              <Trash2 className="w-4 h-4 mr-2" />
              {t({ ar: 'طوارئ', en: 'Emergency' })}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : history.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      {t({ ar: 'لا يوجد سجل', en: 'No history' })}
                    </CardContent>
                  </Card>
                ) : (
                  history.map((item) => (
                    <Card key={item.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm flex items-center gap-2">
                            {getActionBadge(item.action_type)}
                            <span className="text-muted-foreground">{formatDate(item.created_at)}</span>
                          </CardTitle>
                          <Badge variant={item.result === 'success' ? 'default' : 'destructive'}>
                            {item.result}
                          </Badge>
                        </div>
                      </CardHeader>
                      {item.log && (
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground">{item.log}</p>
                        </CardContent>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="snapshots" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-3">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : snapshots.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      {t({ ar: 'لا توجد لقطات', en: 'No snapshots' })}
                    </CardContent>
                  </Card>
                ) : (
                  snapshots.map((snapshot) => (
                    <Card key={snapshot.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm">
                            {snapshot.commit_sha.substring(0, 8)}
                          </CardTitle>
                          <Badge variant={snapshot.status === 'success' ? 'default' : 'destructive'}>
                            {snapshot.status}
                          </Badge>
                        </div>
                        <CardDescription>
                          {formatDate(snapshot.deployed_at)}
                        </CardDescription>
                      </CardHeader>
                      {snapshot.notes && (
                        <CardContent>
                          <p className="text-sm">{snapshot.notes}</p>
                        </CardContent>
                      )}
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="emergency" className="flex-1">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {t({ ar: 'تنظيف شامل للذاكرة', en: 'Full Cache Purge' })}
                </CardTitle>
                <CardDescription>
                  {t({ 
                    ar: 'هذا سيقوم بحذف جميع الذاكرة المؤقتة - استخدم بحذر', 
                    en: 'This will delete all cache - use with caution' 
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handlePurgeCacheAll}
                  disabled={loading}
                  variant="destructive"
                  className="w-full"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t({ ar: 'تنظيف كل شيء', en: 'Purge Everything' })}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            {t({ ar: 'إغلاق', en: 'Close' })}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
