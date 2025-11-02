import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface UseEmailSyncOptions {
  enabled?: boolean;
  interval?: number; // بالثواني
}

export function useEmailSync(onSyncComplete?: () => void, options: UseEmailSyncOptions = {}) {
  const { enabled = false, interval = 60 } = options;
  const { t } = useLanguage();
  const [isSyncing, setIsSyncing] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const syncNow = async () => {
    if (isSyncing) return;

    try {
      setIsSyncing(true);
      
      // مزامنة سريعة - جلب البريد الجديد فقط
      const lastSyncTime = localStorage.getItem('lastEmailSyncTime');
      const now = new Date().toISOString();
      
      let query = supabase
        .from('emails')
        .select('id, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(100);

      // إذا كان هناك مزامنة سابقة، جلب البريد الجديد فقط
      if (lastSyncTime) {
        query = query.gte('created_at', lastSyncTime);
      }

      const { error } = await query;

      if (error) throw error;

      // حفظ وقت المزامنة الأخير
      localStorage.setItem('lastEmailSyncTime', now);

      onSyncComplete?.();
    } catch (error) {
      console.error('Error syncing emails:', error);
      toast.error(
        t({
          ar: 'خطأ في مزامنة البريد',
          en: 'Error syncing emails',
        })
      );
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (!enabled) return;

    // مزامنة فورية عند التفعيل
    syncNow();

    // مزامنة دورية
    intervalRef.current = setInterval(() => {
      syncNow();
    }, interval * 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval]);

  return { syncNow, isSyncing };
}

