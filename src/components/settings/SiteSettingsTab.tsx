import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

export default function SiteSettingsTab() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    phone: '',
    email: '',
    whatsapp_number: '',
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    tax_percentage: 0,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error) throw error;
      if (data) {
        setSettings({
          phone: data.phone || '',
          email: data.email || '',
          whatsapp_number: data.whatsapp_number || '',
          facebook_url: data.facebook_url || '',
          twitter_url: data.twitter_url || '',
          instagram_url: data.instagram_url || '',
          tax_percentage: data.tax_percentage || 0,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .update(settings)
        .eq('id', (await supabase.from('site_settings').select('id').single()).data?.id);

      if (error) throw error;

      toast({
        title: t({ ar: 'تم الحفظ', en: 'Saved' }),
        description: t({ ar: 'تم حفظ الإعدادات بنجاح', en: 'Settings saved successfully' }),
      });
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>{t({ ar: 'رقم الهاتف', en: 'Phone Number' })}</Label>
          <Input
            value={settings.phone}
            onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>{t({ ar: 'البريد الإلكتروني', en: 'Email' })}</Label>
          <Input
            type="email"
            value={settings.email}
            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>{t({ ar: 'رقم واتساب', en: 'WhatsApp Number' })}</Label>
          <Input
            value={settings.whatsapp_number}
            onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>{t({ ar: 'نسبة الضريبة %', en: 'Tax Percentage %' })}</Label>
          <Input
            type="number"
            value={settings.tax_percentage}
            onChange={(e) => setSettings({ ...settings, tax_percentage: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div className="space-y-2">
          <Label>{t({ ar: 'رابط فيسبوك', en: 'Facebook URL' })}</Label>
          <Input
            value={settings.facebook_url}
            onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>{t({ ar: 'رابط تويتر', en: 'Twitter URL' })}</Label>
          <Input
            value={settings.twitter_url}
            onChange={(e) => setSettings({ ...settings, twitter_url: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>{t({ ar: 'رابط انستقرام', en: 'Instagram URL' })}</Label>
          <Input
            value={settings.instagram_url}
            onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
          />
        </div>
      </div>

      <Button onClick={handleSave} disabled={loading} className="btn-luxury">
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {t({ ar: 'حفظ التغييرات', en: 'Save Changes' })}
      </Button>
    </div>
  );
}
