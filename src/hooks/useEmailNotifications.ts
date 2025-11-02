import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

export function useEmailNotifications(onNewEmail?: () => void) {
  const { t } = useLanguage();
  const lastEmailCountRef = useRef<number>(0);

  useEffect(() => {
    // جلب عدد البريد الحالي
    const fetchEmailCount = async () => {
      try {
        const { count } = await supabase
          .from('emails')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'inbox')
          .eq('is_read', false);

        if (count !== null) {
          if (lastEmailCountRef.current === 0) {
            lastEmailCountRef.current = count;
          } else if (count > lastEmailCountRef.current) {
            const newEmailsCount = count - lastEmailCountRef.current;
            toast.success(
              t({
                ar: `لديك ${newEmailsCount} بريد جديد`,
                en: `You have ${newEmailsCount} new email(s)`,
              })
            );
            lastEmailCountRef.current = count;
            onNewEmail?.();
          }
        }
      } catch (error) {
        console.error('Error checking for new emails:', error);
      }
    };

    // فحص البريد الجديد كل 15 ثانية (أسرع)
    const interval = setInterval(fetchEmailCount, 15000);
    fetchEmailCount(); // فحص فوري

    return () => clearInterval(interval);
  }, [onNewEmail, t]);
}

