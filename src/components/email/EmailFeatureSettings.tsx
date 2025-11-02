import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Bell, RefreshCw, Keyboard, Tag, Paperclip, Languages, Download, Upload, Search, Filter, Eye, Mail, Send, Trash2, AlertTriangle, Save, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface EmailFeatureSettings {
  // تفعيل/إيقاف الوظائف
  enable_notifications: boolean;
  enable_auto_sync: boolean;
  enable_keyboard_shortcuts: boolean;
  enable_tags: boolean;
  enable_attachments: boolean;
  enable_translation: boolean;
  enable_export: boolean;
  enable_import: boolean;
  enable_email_preview: boolean;
  enable_email_search: boolean;
  enable_advanced_filters: boolean;
  enable_email_replies: boolean;
  enable_email_forwarding: boolean;
  enable_email_drafts: boolean;
  enable_email_spam_filter: boolean;
  enable_email_auto_delete: boolean;
  // إعدادات المزامنة
  sync_interval: number; // بالثواني
  notification_check_interval: number; // بالثواني
  // إعدادات أخرى
  auto_mark_read_after_days: number;
  max_emails_per_page: number;
  auto_delete_after_days: number;
  spam_filter_sensitivity: 'low' | 'medium' | 'high';
}

export function EmailFeatureSettings() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<EmailFeatureSettings>({
    enable_notifications: true,
    enable_auto_sync: true,
    enable_keyboard_shortcuts: true,
    enable_tags: true,
    enable_attachments: true,
    enable_translation: true,
    enable_export: true,
    enable_import: true,
    enable_email_preview: true,
    enable_email_search: true,
    enable_advanced_filters: true,
    enable_email_replies: true,
    enable_email_forwarding: true,
    enable_email_drafts: true,
    enable_email_spam_filter: true,
    enable_email_auto_delete: false,
    sync_interval: 30,
    notification_check_interval: 15,
    auto_mark_read_after_days: 30,
    max_emails_per_page: 50,
    auto_delete_after_days: 90,
    spam_filter_sensitivity: 'medium',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('email_feature_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error fetching feature settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('email_feature_settings')
        .upsert({
          ...settings,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (error) throw error;

      toast.success(t({ ar: 'تم حفظ الإعدادات', en: 'Settings saved' }));
      
      // تحديث localStorage للإعدادات السريعة
      localStorage.setItem('emailSyncInterval', settings.sync_interval.toString());
      localStorage.setItem('emailNotificationInterval', settings.notification_check_interval.toString());
    } catch (error) {
      console.error('Error saving feature settings:', error);
      toast.error(t({ ar: 'خطأ في حفظ الإعدادات', en: 'Error saving settings' }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Basic Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t({ ar: 'الوظائف الأساسية', en: 'Basic Features' })}
          </CardTitle>
          <CardDescription>
            {t({ ar: 'تفعيل أو إيقاف الوظائف الأساسية للبريد', en: 'Enable or disable basic email features' })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <Label>{t({ ar: 'الإشعارات', en: 'Notifications' })}</Label>
              </div>
              <Switch
                checked={settings.enable_notifications}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enable_notifications: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
                <Label>{t({ ar: 'المزامنة التلقائية', en: 'Auto Sync' })}</Label>
              </div>
              <Switch
                checked={settings.enable_auto_sync}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enable_auto_sync: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-muted-foreground" />
                <Label>{t({ ar: 'اختصارات لوحة المفاتيح', en: 'Keyboard Shortcuts' })}</Label>
              </div>
              <Switch
                checked={settings.enable_keyboard_shortcuts}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enable_keyboard_shortcuts: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <Label>{t({ ar: 'العلامات', en: 'Tags' })}</Label>
              </div>
              <Switch
                checked={settings.enable_tags}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enable_tags: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-muted-foreground" />
                <Label>{t({ ar: 'المرفقات', en: 'Attachments' })}</Label>
              </div>
              <Switch
                checked={settings.enable_attachments}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enable_attachments: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-muted-foreground" />
                <Label>{t({ ar: 'الترجمة', en: 'Translation' })}</Label>
              </div>
              <Switch
                checked={settings.enable_translation}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enable_translation: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Import/Export Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            {t({ ar: 'الاستيراد والتصدير', en: 'Import & Export' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-muted-foreground" />
                <Label>{t({ ar: 'التصدير', en: 'Export' })}</Label>
              </div>
              <Switch
                checked={settings.enable_export}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enable_export: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-muted-foreground" />
                <Label>{t({ ar: 'الاستيراد', en: 'Import' })}</Label>
              </div>
              <Switch
                checked={settings.enable_import}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enable_import: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            {t({ ar: 'وظائف البريد', en: 'Email Features' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <Label>{t({ ar: 'معاينة البريد', en: 'Email Preview' })}</Label>
              </div>
              <Switch
                checked={settings.enable_email_preview}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enable_email_preview: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <Label>{t({ ar: 'البحث في البريد', en: 'Email Search' })}</Label>
              </div>
              <Switch
                checked={settings.enable_email_search}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enable_email_search: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Label>{t({ ar: 'الفلاتر المتقدمة', en: 'Advanced Filters' })}</Label>
              </div>
              <Switch
                checked={settings.enable_advanced_filters}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enable_advanced_filters: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-muted-foreground" />
                <Label>{t({ ar: 'الرد على البريد', en: 'Email Replies' })}</Label>
              </div>
              <Switch
                checked={settings.enable_email_replies}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enable_email_replies: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <Label>{t({ ar: 'إعادة التوجيه', en: 'Forwarding' })}</Label>
              </div>
              <Switch
                checked={settings.enable_email_forwarding}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enable_email_forwarding: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <Label>{t({ ar: 'المسودات', en: 'Drafts' })}</Label>
              </div>
              <Switch
                checked={settings.enable_email_drafts}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enable_email_drafts: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                <Label>{t({ ar: 'فلتر السبام', en: 'Spam Filter' })}</Label>
              </div>
              <Switch
                checked={settings.enable_email_spam_filter}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enable_email_spam_filter: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-muted-foreground" />
                <Label>{t({ ar: 'الحذف التلقائي', en: 'Auto Delete' })}</Label>
              </div>
              <Switch
                checked={settings.enable_email_auto_delete}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, enable_email_auto_delete: checked })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            {t({ ar: 'إعدادات المزامنة', en: 'Sync Settings' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ ar: 'فترة المزامنة (بالثواني)', en: 'Sync Interval (seconds)' })}</Label>
              <Input
                type="number"
                value={settings.sync_interval}
                onChange={(e) =>
                  setSettings({ ...settings, sync_interval: parseInt(e.target.value) || 30 })
                }
                min={10}
                max={300}
              />
              <p className="text-xs text-muted-foreground">
                {t({ ar: 'الحد الأدنى: 10 ثواني، الحد الأقصى: 300 ثانية', en: 'Min: 10s, Max: 300s' })}
              </p>
            </div>
            <div className="space-y-2">
              <Label>{t({ ar: 'فترة فحص الإشعارات (بالثواني)', en: 'Notification Check Interval (seconds)' })}</Label>
              <Input
                type="number"
                value={settings.notification_check_interval}
                onChange={(e) =>
                  setSettings({ ...settings, notification_check_interval: parseInt(e.target.value) || 15 })
                }
                min={5}
                max={120}
              />
              <p className="text-xs text-muted-foreground">
                {t({ ar: 'الحد الأدنى: 5 ثواني، الحد الأقصى: 120 ثانية', en: 'Min: 5s, Max: 120s' })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t({ ar: 'إعدادات متقدمة', en: 'Advanced Settings' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t({ ar: 'عدد البريد لكل صفحة', en: 'Emails Per Page' })}</Label>
              <Input
                type="number"
                value={settings.max_emails_per_page}
                onChange={(e) =>
                  setSettings({ ...settings, max_emails_per_page: parseInt(e.target.value) || 50 })
                }
                min={10}
                max={200}
              />
            </div>
            <div className="space-y-2">
              <Label>{t({ ar: 'تحديد كمقروء تلقائياً بعد (أيام)', en: 'Auto Mark Read After (days)' })}</Label>
              <Input
                type="number"
                value={settings.auto_mark_read_after_days}
                onChange={(e) =>
                  setSettings({ ...settings, auto_mark_read_after_days: parseInt(e.target.value) || 30 })
                }
                min={1}
                max={365}
              />
            </div>
            {settings.enable_email_auto_delete && (
              <div className="space-y-2">
                <Label>{t({ ar: 'حذف تلقائي بعد (أيام)', en: 'Auto Delete After (days)' })}</Label>
                <Input
                  type="number"
                  value={settings.auto_delete_after_days}
                  onChange={(e) =>
                    setSettings({ ...settings, auto_delete_after_days: parseInt(e.target.value) || 90 })
                  }
                  min={1}
                  max={365}
                />
              </div>
            )}
            {settings.enable_email_spam_filter && (
              <div className="space-y-2">
                <Label>{t({ ar: 'حساسية فلتر السبام', en: 'Spam Filter Sensitivity' })}</Label>
                <select
                  value={settings.spam_filter_sensitivity}
                  onChange={(e) =>
                    setSettings({ ...settings, spam_filter_sensitivity: e.target.value as 'low' | 'medium' | 'high' })
                  }
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="low">{t({ ar: 'منخفضة', en: 'Low' })}</option>
                  <option value="medium">{t({ ar: 'متوسطة', en: 'Medium' })}</option>
                  <option value="high">{t({ ar: 'عالية', en: 'High' })}</option>
                </select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving 
            ? t({ ar: 'جاري الحفظ...', en: 'Saving...' })
            : t({ ar: 'حفظ الإعدادات', en: 'Save Settings' })
          }
        </Button>
      </div>
    </div>
  );
}

