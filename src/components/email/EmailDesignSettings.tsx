import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Tablet, Smartphone, Palette, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface DesignSettings {
  id?: string;
  desktop_width: number;
  desktop_font_size: number;
  desktop_line_height: number;
  desktop_background_color: string;
  desktop_text_color: string;
  tablet_width: number;
  tablet_font_size: number;
  tablet_line_height: number;
  tablet_background_color: string;
  tablet_text_color: string;
  mobile_width: number;
  mobile_font_size: number;
  mobile_line_height: number;
  mobile_background_color: string;
  mobile_text_color: string;
  signature_html?: string;
  signature_text?: string;
  signature_position: 'top' | 'bottom';
}

export function EmailDesignSettings() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<DesignSettings>({
    desktop_width: 600,
    desktop_font_size: 14,
    desktop_line_height: 1.6,
    desktop_background_color: '#ffffff',
    desktop_text_color: '#333333',
    tablet_width: 768,
    tablet_font_size: 16,
    tablet_line_height: 1.6,
    tablet_background_color: '#ffffff',
    tablet_text_color: '#333333',
    mobile_width: 375,
    mobile_font_size: 14,
    mobile_line_height: 1.5,
    mobile_background_color: '#ffffff',
    mobile_text_color: '#333333',
    signature_position: 'bottom',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_design_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching design settings:', error);
      toast.error(t({ ar: 'خطأ في جلب الإعدادات', en: 'Error fetching settings' }));
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('email_design_settings')
        .upsert({
          ...settings,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success(t({ ar: 'تم حفظ الإعدادات', en: 'Settings saved' }));
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(t({ ar: 'خطأ في حفظ الإعدادات', en: 'Error saving settings' }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            {t({ ar: 'إعدادات تصميم البريد المرسل', en: 'Outgoing Email Design Settings' })}
          </CardTitle>
          <CardDescription>
            {t({ ar: 'تخصيص شكل البريد المرسل للأجهزة المختلفة', en: 'Customize outgoing email appearance for different devices' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="desktop" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="desktop" className="gap-2">
                <Monitor className="w-4 h-4" />
                {t({ ar: 'سطح المكتب', en: 'Desktop' })}
              </TabsTrigger>
              <TabsTrigger value="tablet" className="gap-2">
                <Tablet className="w-4 h-4" />
                {t({ ar: 'التابلت', en: 'Tablet' })}
              </TabsTrigger>
              <TabsTrigger value="mobile" className="gap-2">
                <Smartphone className="w-4 h-4" />
                {t({ ar: 'الجوال', en: 'Mobile' })}
              </TabsTrigger>
            </TabsList>

            {/* Desktop Settings */}
            <TabsContent value="desktop" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ ar: 'عرض البريد (px)', en: 'Email Width (px)' })}</Label>
                  <Input
                    type="number"
                    value={settings.desktop_width}
                    onChange={(e) =>
                      setSettings({ ...settings, desktop_width: parseInt(e.target.value) || 600 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ ar: 'حجم الخط (px)', en: 'Font Size (px)' })}</Label>
                  <Input
                    type="number"
                    value={settings.desktop_font_size}
                    onChange={(e) =>
                      setSettings({ ...settings, desktop_font_size: parseInt(e.target.value) || 14 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ ar: 'ارتفاع السطر', en: 'Line Height' })}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={settings.desktop_line_height}
                    onChange={(e) =>
                      setSettings({ ...settings, desktop_line_height: parseFloat(e.target.value) || 1.6 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ ar: 'لون الخلفية', en: 'Background Color' })}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.desktop_background_color}
                      onChange={(e) =>
                        setSettings({ ...settings, desktop_background_color: e.target.value })
                      }
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={settings.desktop_background_color}
                      onChange={(e) =>
                        setSettings({ ...settings, desktop_background_color: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t({ ar: 'لون النص', en: 'Text Color' })}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.desktop_text_color}
                      onChange={(e) =>
                        setSettings({ ...settings, desktop_text_color: e.target.value })
                      }
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={settings.desktop_text_color}
                      onChange={(e) =>
                        setSettings({ ...settings, desktop_text_color: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tablet Settings */}
            <TabsContent value="tablet" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ ar: 'عرض البريد (px)', en: 'Email Width (px)' })}</Label>
                  <Input
                    type="number"
                    value={settings.tablet_width}
                    onChange={(e) =>
                      setSettings({ ...settings, tablet_width: parseInt(e.target.value) || 768 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ ar: 'حجم الخط (px)', en: 'Font Size (px)' })}</Label>
                  <Input
                    type="number"
                    value={settings.tablet_font_size}
                    onChange={(e) =>
                      setSettings({ ...settings, tablet_font_size: parseInt(e.target.value) || 16 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ ar: 'ارتفاع السطر', en: 'Line Height' })}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={settings.tablet_line_height}
                    onChange={(e) =>
                      setSettings({ ...settings, tablet_line_height: parseFloat(e.target.value) || 1.6 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ ar: 'لون الخلفية', en: 'Background Color' })}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.tablet_background_color}
                      onChange={(e) =>
                        setSettings({ ...settings, tablet_background_color: e.target.value })
                      }
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={settings.tablet_background_color}
                      onChange={(e) =>
                        setSettings({ ...settings, tablet_background_color: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t({ ar: 'لون النص', en: 'Text Color' })}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.tablet_text_color}
                      onChange={(e) =>
                        setSettings({ ...settings, tablet_text_color: e.target.value })
                      }
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={settings.tablet_text_color}
                      onChange={(e) =>
                        setSettings({ ...settings, tablet_text_color: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Mobile Settings */}
            <TabsContent value="mobile" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t({ ar: 'عرض البريد (px)', en: 'Email Width (px)' })}</Label>
                  <Input
                    type="number"
                    value={settings.mobile_width}
                    onChange={(e) =>
                      setSettings({ ...settings, mobile_width: parseInt(e.target.value) || 375 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ ar: 'حجم الخط (px)', en: 'Font Size (px)' })}</Label>
                  <Input
                    type="number"
                    value={settings.mobile_font_size}
                    onChange={(e) =>
                      setSettings({ ...settings, mobile_font_size: parseInt(e.target.value) || 14 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ ar: 'ارتفاع السطر', en: 'Line Height' })}</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={settings.mobile_line_height}
                    onChange={(e) =>
                      setSettings({ ...settings, mobile_line_height: parseFloat(e.target.value) || 1.5 })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ ar: 'لون الخلفية', en: 'Background Color' })}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.mobile_background_color}
                      onChange={(e) =>
                        setSettings({ ...settings, mobile_background_color: e.target.value })
                      }
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={settings.mobile_background_color}
                      onChange={(e) =>
                        setSettings({ ...settings, mobile_background_color: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t({ ar: 'لون النص', en: 'Text Color' })}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.mobile_text_color}
                      onChange={(e) =>
                        setSettings({ ...settings, mobile_text_color: e.target.value })
                      }
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={settings.mobile_text_color}
                      onChange={(e) =>
                        setSettings({ ...settings, mobile_text_color: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Signature Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">{t({ ar: 'إعدادات التوقيع', en: 'Signature Settings' })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t({ ar: 'موضع التوقيع', en: 'Signature Position' })}</Label>
                <select
                  value={settings.signature_position}
                  onChange={(e) =>
                    setSettings({ ...settings, signature_position: e.target.value as 'top' | 'bottom' })
                  }
                  className="w-full p-2 border rounded"
                >
                  <option value="top">{t({ ar: 'أعلى', en: 'Top' })}</option>
                  <option value="bottom">{t({ ar: 'أسفل', en: 'Bottom' })}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>{t({ ar: 'التوقيع HTML', en: 'Signature HTML' })}</Label>
                <textarea
                  value={settings.signature_html || ''}
                  onChange={(e) => setSettings({ ...settings, signature_html: e.target.value })}
                  className="w-full p-2 border rounded min-h-[100px]"
                  placeholder={t({ ar: 'أدخل HTML للتوقيع', en: 'Enter HTML for signature' })}
                />
              </div>
            </CardContent>
          </Card>

          <Button onClick={saveSettings} disabled={saving} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {saving ? t({ ar: 'جاري الحفظ...', en: 'Saving...' }) : t({ ar: 'حفظ الإعدادات', en: 'Save Settings' })}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

