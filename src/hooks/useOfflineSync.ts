import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface PendingAction {
  id: string;
  type: 'insert' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
}

const STORAGE_KEY = 'offline_pending_actions';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    // Load pending actions from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setPendingActions(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading pending actions:', error);
      }
    }

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: t({ ar: "تم الاتصال", en: "Connected" }),
        description: t({ 
          ar: "تم استعادة الاتصال بالإنترنت. جاري المزامنة...", 
          en: "Internet connection restored. Syncing..." 
        }),
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: t({ ar: "بدون اتصال", en: "Offline" }),
        description: t({ 
          ar: "أنت الآن في وضع عدم الاتصال. سيتم حفظ التغييرات ومزامنتها لاحقاً.", 
          en: "You are now offline. Changes will be saved and synced later." 
        }),
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && pendingActions.length > 0 && !isSyncing) {
      syncPendingActions();
    }
  }, [isOnline, pendingActions.length]);

  const addPendingAction = (action: Omit<PendingAction, 'id' | 'timestamp'>) => {
    const newAction: PendingAction = {
      ...action,
      id: `${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
    };

    const updated = [...pendingActions, newAction];
    setPendingActions(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    if (!isOnline) {
      toast({
        title: t({ ar: "تم الحفظ محلياً", en: "Saved Locally" }),
        description: t({ 
          ar: "سيتم إرسال التغييرات عند الاتصال بالإنترنت", 
          en: "Changes will be synced when online" 
        }),
      });
    }
  };

  const syncPendingActions = async () => {
    if (pendingActions.length === 0 || isSyncing) return;

    setIsSyncing(true);
    const successfulActions: string[] = [];

    try {
      for (const action of pendingActions) {
        try {
          switch (action.type) {
            case 'insert':
              await (supabase.from as any)(action.table).insert(action.data);
              break;
            case 'update':
              await (supabase.from as any)(action.table)
                .update(action.data)
                .eq('id', action.data.id);
              break;
            case 'delete':
              await (supabase.from as any)(action.table)
                .delete()
                .eq('id', action.data.id);
              break;
          }
          successfulActions.push(action.id);
        } catch (error) {
          console.error('Error syncing action:', action, error);
        }
      }

      // Remove successful actions
      if (successfulActions.length > 0) {
        const remaining = pendingActions.filter(
          (a) => !successfulActions.includes(a.id)
        );
        setPendingActions(remaining);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));

        toast({
          title: t({ ar: "تمت المزامنة", en: "Synced" }),
          description: t({ 
            ar: `تم مزامنة ${successfulActions.length} عملية بنجاح`, 
            en: `${successfulActions.length} actions synced successfully` 
          }),
        });
      }
    } catch (error) {
      console.error('Error during sync:', error);
      toast({
        title: t({ ar: "خطأ في المزامنة", en: "Sync Error" }),
        description: t({ 
          ar: "حدث خطأ أثناء المزامنة. سنحاول مرة أخرى.", 
          en: "An error occurred during sync. We'll try again." 
        }),
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isOnline,
    pendingActions,
    isSyncing,
    addPendingAction,
    syncPendingActions,
  };
}
