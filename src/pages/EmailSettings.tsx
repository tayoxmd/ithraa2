import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Settings, Palette, Mail, Server, Shield, Filter, Layout, Smartphone, Tablet, Monitor, Save, Download, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailAccessControl } from '@/components/email/EmailAccessControl';
import { EmailStatusSettings } from '@/components/email/EmailStatusSettings';
import { EmailFilterSettings } from '@/components/email/EmailFilterSettings';
import { EmailTemplateDesigner } from '@/components/email/EmailTemplateDesigner';
import { EmailDesignSettings } from '@/components/email/EmailDesignSettings';
import { EmailImportExport } from '@/components/email/EmailImportExport';
import { EmailFeatureSettings } from '@/components/email/EmailFeatureSettings';

export default function EmailSettings() {
  const { t, language } = useLanguage();
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    design_theme: 'design2' as 'design1' | 'design2' | 'design3' | 'design4' | 'design5',
    // Email Server Settings - SMTP
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_encryption: 'tls' as 'tls' | 'ssl' | 'none',
    // Email Server Settings - IMAP
    imap_host: '',
    imap_port: 993,
    imap_username: '',
    imap_password: '',
    imap_encryption: 'ssl' as 'tls' | 'ssl' | 'none',
    // Email Server Settings - POP3
    pop3_host: '',
    pop3_port: 995,
    pop3_username: '',
    pop3_password: '',
    pop3_encryption: 'ssl' as 'tls' | 'ssl' | 'none',
    from_email: '',
    from_name: '',
    // Backup & Forwarding
    backup_email: '',
    backup_enabled: false,
    forward_to: '',
    forward_enabled: false,
    // Colors
    inbox_color: '#3b82f6',
    sent_color: '#10b981',
    trash_color: '#ef4444',
    spam_color: '#f59e0b',
  });

  const canManage = userRole === 'admin';

  useEffect(() => {
    if (!canManage) {
      navigate('/email-manager');
      return;
    }
    fetchSettings();
  }, [canManage, navigate]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('email_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings((prev) => ({ 
          ...prev, 
          design_theme: (data.design_theme as 'design1' | 'design2' | 'design3' | 'design4' | 'design5') || 'design2',
          smtp_host: data.smtp_host || prev.smtp_host,
          smtp_port: data.smtp_port || prev.smtp_port,
          smtp_username: data.smtp_username || prev.smtp_username,
          smtp_password: data.smtp_password || prev.smtp_password,
          smtp_encryption: (data.smtp_encryption as 'tls' | 'ssl' | 'none') || prev.smtp_encryption,
          imap_host: data.imap_host || prev.imap_host,
          imap_port: data.imap_port || prev.imap_port,
          imap_username: data.imap_username || prev.imap_username,
          imap_password: data.imap_password || prev.imap_password,
          imap_encryption: (data.imap_encryption as 'tls' | 'ssl' | 'none') || prev.imap_encryption,
          pop3_host: data.pop3_host || prev.pop3_host,
          pop3_port: data.pop3_port || prev.pop3_port,
          pop3_username: data.pop3_username || prev.pop3_username,
          pop3_password: data.pop3_password || prev.pop3_password,
          pop3_encryption: (data.pop3_encryption as 'tls' | 'ssl' | 'none') || prev.pop3_encryption,
          from_email: data.from_email || prev.from_email,
          from_name: data.from_name || prev.from_name,
          backup_email: data.backup_email || prev.backup_email,
          backup_enabled: data.backup_enabled ?? prev.backup_enabled,
          forward_to: data.forward_to || prev.forward_to,
          forward_enabled: data.forward_enabled ?? prev.forward_enabled,
          inbox_color: data.inbox_color || prev.inbox_color,
          sent_color: data.sent_color || prev.sent_color,
          trash_color: data.trash_color || prev.trash_color,
          spam_color: data.spam_color || prev.spam_color,
        }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error(t({ ar: 'خطأ في جلب الإعدادات', en: 'Error fetching settings' }));
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from('email_settings')
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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!canManage) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto p-4 md:p-6 pt-10 md:pt-14 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/email-manager')}
            className="h-10 w-10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              <Settings className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
              {t({ ar: 'إعدادات البريد', en: 'Email Settings' })}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t({ ar: 'إعدادات شاملة لنظام البريد الإلكتروني', en: 'Comprehensive email system settings' })}
            </p>
          </div>
        </div>

        <Tabs defaultValue="design" className="space-y-6">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="design" className="gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ ar: 'التصميم', en: 'Design' })}</span>
            </TabsTrigger>
            <TabsTrigger value="server" className="gap-2">
              <Server className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ ar: 'الخادم', en: 'Server' })}</span>
            </TabsTrigger>
            <TabsTrigger value="statuses" className="gap-2">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ ar: 'الحالات', en: 'Statuses' })}</span>
            </TabsTrigger>
            <TabsTrigger value="filters" className="gap-2">
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ ar: 'الفلاتر', en: 'Filters' })}</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <Layout className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ ar: 'القوالب', en: 'Templates' })}</span>
            </TabsTrigger>
            <TabsTrigger value="import-export" className="gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ ar: 'استيراد/تصدير', en: 'Import/Export' })}</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ ar: 'إعدادات البريد', en: 'Email Settings' })}</span>
            </TabsTrigger>
            <TabsTrigger value="access" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">{t({ ar: 'الصلاحيات', en: 'Access' })}</span>
            </TabsTrigger>
          </TabsList>

          {/* Design Theme Tab */}
          <TabsContent value="design" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  {t({ ar: 'اختيار تصميم الواجهة', en: 'Choose Interface Design' })}
                </CardTitle>
                <CardDescription>
                  {t({ ar: 'اختر التصميم المفضل لعرض البريد', en: 'Choose your preferred email interface design' })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t({ ar: 'تصميم الواجهة', en: 'Interface Design' })}</Label>
                  <Select
                    value={settings.design_theme}
                    onValueChange={(value: any) => setSettings((prev) => ({ ...prev, design_theme: value }))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t({ ar: 'اختر التصميم', en: 'Select Design' })} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="design1">
                        {t({ ar: 'تصميم 1 - عصري بسيط', en: 'Design 1 - Modern Minimalist' })}
                      </SelectItem>
                      <SelectItem value="design2">
                        {t({ ar: 'تصميم 2 - كلاسيكي احترافي', en: 'Design 2 - Classic Professional' })}
                      </SelectItem>
                      <SelectItem value="design3">
                        {t({ ar: 'تصميم 3 - قائم على البطاقات', en: 'Design 3 - Card Based' })}
                      </SelectItem>
                      <SelectItem value="design4">
                        {t({ ar: 'تصميم 4 - الوضع الليلي', en: 'Design 4 - Dark Mode' })}
                      </SelectItem>
                      <SelectItem value="design5">
                        {t({ ar: 'تصميم 5 - عرض مقسم', en: 'Design 5 - Split View' })}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {settings.design_theme === 'design1' && t({ ar: 'تصميم عصري وبسيط مع واجهة نظيفة', en: 'Modern and simple design with clean interface' })}
                    {settings.design_theme === 'design2' && t({ ar: 'تصميم كلاسيكي احترافي مناسب للعمل', en: 'Classic professional design suitable for work' })}
                    {settings.design_theme === 'design3' && t({ ar: 'تصميم قائم على البطاقات مع عرض منظم', en: 'Card-based design with organized display' })}
                    {settings.design_theme === 'design4' && t({ ar: 'تصميم الوضع الليلي المظلم', en: 'Dark mode design' })}
                    {settings.design_theme === 'design5' && t({ ar: 'تصميم العرض المقسم مع لوحة تفاصيل', en: 'Split view design with detail panel' })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Color Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  {t({ ar: 'ألوان البريد', en: 'Email Colors' })}
                </CardTitle>
                <CardDescription>
                  {t({ ar: 'تخصيص ألوان البريد الوارد والصادر', en: 'Customize inbox and sent email colors' })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t({ ar: 'لون البريد الوارد', en: 'Inbox Color' })}</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.inbox_color}
                        onChange={(e) => setSettings((prev) => ({ ...prev, inbox_color: e.target.value }))}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={settings.inbox_color}
                        onChange={(e) => setSettings((prev) => ({ ...prev, inbox_color: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t({ ar: 'لون البريد الوارد في قائمة البريد', en: 'Color for inbox emails in email list' })}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ ar: 'لون البريد الصادر', en: 'Sent Color' })}</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.sent_color}
                        onChange={(e) => setSettings((prev) => ({ ...prev, sent_color: e.target.value }))}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={settings.sent_color}
                        onChange={(e) => setSettings((prev) => ({ ...prev, sent_color: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t({ ar: 'لون البريد الصادر في قائمة البريد', en: 'Color for sent emails in email list' })}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ ar: 'لون المهملات', en: 'Trash Color' })}</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.trash_color}
                        onChange={(e) => setSettings((prev) => ({ ...prev, trash_color: e.target.value }))}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={settings.trash_color}
                        onChange={(e) => setSettings((prev) => ({ ...prev, trash_color: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ ar: 'لون السبام', en: 'Spam Color' })}</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.spam_color}
                        onChange={(e) => setSettings((prev) => ({ ...prev, spam_color: e.target.value }))}
                        className="w-20 h-10"
                      />
                      <Input
                        type="text"
                        value={settings.spam_color}
                        onChange={(e) => setSettings((prev) => ({ ...prev, spam_color: e.target.value }))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Server Settings Tab */}
          <TabsContent value="server" className="space-y-6">
            {/* SMTP Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  {t({ ar: 'إعدادات SMTP (إرسال البريد)', en: 'SMTP Settings (Send Email)' })}
                </CardTitle>
                <CardDescription>
                  {t({ ar: 'ربط البريد بخادم SMTP لإرسال الرسائل', en: 'Connect email to SMTP server to send emails' })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t({ ar: 'عنوان الخادم (SMTP Host)', en: 'SMTP Host' })}</Label>
                    <Input
                      value={settings.smtp_host}
                      onChange={(e) => setSettings((prev) => ({ ...prev, smtp_host: e.target.value }))}
                      placeholder="smtp.example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ ar: 'منفذ الخادم (Port)', en: 'Port' })}</Label>
                    <Input
                      type="number"
                      value={settings.smtp_port}
                      onChange={(e) => setSettings((prev) => ({ ...prev, smtp_port: parseInt(e.target.value) || 587 }))}
                      placeholder="587"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ ar: 'اسم المستخدم', en: 'Username' })}</Label>
                    <Input
                      value={settings.smtp_username}
                      onChange={(e) => setSettings((prev) => ({ ...prev, smtp_username: e.target.value }))}
                      placeholder="username@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ ar: 'كلمة المرور', en: 'Password' })}</Label>
                    <Input
                      type="password"
                      value={settings.smtp_password}
                      onChange={(e) => setSettings((prev) => ({ ...prev, smtp_password: e.target.value }))}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ ar: 'التشفير', en: 'Encryption' })}</Label>
                    <Select
                      value={settings.smtp_encryption}
                      onValueChange={(value: any) => setSettings((prev) => ({ ...prev, smtp_encryption: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tls">TLS</SelectItem>
                        <SelectItem value="ssl">SSL</SelectItem>
                        <SelectItem value="none">{t({ ar: 'بدون', en: 'None' })}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* IMAP Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  {t({ ar: 'إعدادات IMAP (استقبال البريد)', en: 'IMAP Settings (Receive Email)' })}
                </CardTitle>
                <CardDescription>
                  {t({ ar: 'ربط البريد بخادم IMAP لاستقبال الرسائل', en: 'Connect email to IMAP server to receive emails' })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t({ ar: 'عنوان الخادم (IMAP Host)', en: 'IMAP Host' })}</Label>
                    <Input
                      value={settings.imap_host}
                      onChange={(e) => setSettings((prev) => ({ ...prev, imap_host: e.target.value }))}
                      placeholder="imap.example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ ar: 'منفذ الخادم (Port)', en: 'Port' })}</Label>
                    <Input
                      type="number"
                      value={settings.imap_port}
                      onChange={(e) => setSettings((prev) => ({ ...prev, imap_port: parseInt(e.target.value) || 993 }))}
                      placeholder="993"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ ar: 'اسم المستخدم', en: 'Username' })}</Label>
                    <Input
                      value={settings.imap_username}
                      onChange={(e) => setSettings((prev) => ({ ...prev, imap_username: e.target.value }))}
                      placeholder="username@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ ar: 'كلمة المرور', en: 'Password' })}</Label>
                    <Input
                      type="password"
                      value={settings.imap_password}
                      onChange={(e) => setSettings((prev) => ({ ...prev, imap_password: e.target.value }))}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ ar: 'التشفير', en: 'Encryption' })}</Label>
                    <Select
                      value={settings.imap_encryption}
                      onValueChange={(value: any) => setSettings((prev) => ({ ...prev, imap_encryption: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tls">TLS</SelectItem>
                        <SelectItem value="ssl">SSL</SelectItem>
                        <SelectItem value="none">{t({ ar: 'بدون', en: 'None' })}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* POP3 Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  {t({ ar: 'إعدادات POP3 (استقبال البريد)', en: 'POP3 Settings (Receive Email)' })}
                </CardTitle>
                <CardDescription>
                  {t({ ar: 'ربط البريد بخادم POP3 لاستقبال الرسائل', en: 'Connect email to POP3 server to receive emails' })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t({ ar: 'عنوان الخادم (POP3 Host)', en: 'POP3 Host' })}</Label>
                    <Input
                      value={settings.pop3_host}
                      onChange={(e) => setSettings((prev) => ({ ...prev, pop3_host: e.target.value }))}
                      placeholder="pop3.example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ ar: 'منفذ الخادم (Port)', en: 'Port' })}</Label>
                    <Input
                      type="number"
                      value={settings.pop3_port}
                      onChange={(e) => setSettings((prev) => ({ ...prev, pop3_port: parseInt(e.target.value) || 995 }))}
                      placeholder="995"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ ar: 'اسم المستخدم', en: 'Username' })}</Label>
                    <Input
                      value={settings.pop3_username}
                      onChange={(e) => setSettings((prev) => ({ ...prev, pop3_username: e.target.value }))}
                      placeholder="username@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ ar: 'كلمة المرور', en: 'Password' })}</Label>
                    <Input
                      type="password"
                      value={settings.pop3_password}
                      onChange={(e) => setSettings((prev) => ({ ...prev, pop3_password: e.target.value }))}
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ ar: 'التشفير', en: 'Encryption' })}</Label>
                    <Select
                      value={settings.pop3_encryption}
                      onValueChange={(value: any) => setSettings((prev) => ({ ...prev, pop3_encryption: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tls">TLS</SelectItem>
                        <SelectItem value="ssl">SSL</SelectItem>
                        <SelectItem value="none">{t({ ar: 'بدون', en: 'None' })}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  {t({ ar: 'إعدادات المرسل الافتراضي', en: 'Default Sender Settings' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t({ ar: 'البريد الإلكتروني المرسل', en: 'From Email' })}</Label>
                    <Input
                      type="email"
                      value={settings.from_email}
                      onChange={(e) => setSettings((prev) => ({ ...prev, from_email: e.target.value }))}
                      placeholder="noreply@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t({ ar: 'اسم المرسل', en: 'From Name' })}</Label>
                    <Input
                      value={settings.from_name}
                      onChange={(e) => setSettings((prev) => ({ ...prev, from_name: e.target.value }))}
                      placeholder="إثراء ITHRAA"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  {t({ ar: 'البريد الاحتياطي والتوجيه', en: 'Backup & Forwarding' })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t({ ar: 'تفعيل البريد الاحتياطي', en: 'Enable Backup Email' })}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t({ ar: 'إرسال نسخة من جميع الرسائل إلى بريد احتياطي', en: 'Send copy of all emails to backup address' })}
                      </p>
                    </div>
                    <Switch
                      checked={settings.backup_enabled}
                      onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, backup_enabled: checked }))}
                    />
                  </div>
                  {settings.backup_enabled && (
                    <div className="space-y-2">
                      <Label>{t({ ar: 'البريد الاحتياطي', en: 'Backup Email' })}</Label>
                      <Input
                        type="email"
                        value={settings.backup_email}
                        onChange={(e) => setSettings((prev) => ({ ...prev, backup_email: e.target.value }))}
                        placeholder="backup@example.com"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{t({ ar: 'تفعيل التوجيه', en: 'Enable Forwarding' })}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t({ ar: 'توجيه جميع الرسائل الواردة إلى بريد آخر', en: 'Forward all incoming emails to another address' })}
                      </p>
                    </div>
                    <Switch
                      checked={settings.forward_enabled}
                      onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, forward_enabled: checked }))}
                    />
                  </div>
                  {settings.forward_enabled && (
                    <div className="space-y-2">
                      <Label>{t({ ar: 'البريد المستلم', en: 'Forward To' })}</Label>
                      <Input
                        type="email"
                        value={settings.forward_to}
                        onChange={(e) => setSettings((prev) => ({ ...prev, forward_to: e.target.value }))}
                        placeholder="forward@example.com"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Status Settings Tab */}
          <TabsContent value="statuses">
            <EmailStatusSettings />
          </TabsContent>

          {/* Filter Settings Tab */}
          <TabsContent value="filters">
            <EmailFilterSettings />
          </TabsContent>

          {/* Template Designer Tab */}
          <TabsContent value="templates">
            <EmailTemplateDesigner />
          </TabsContent>

          {/* Design Settings Tab */}
          <TabsContent value="design-settings">
            <EmailDesignSettings />
          </TabsContent>

          {/* Import/Export Tab */}
          <TabsContent value="import-export">
            <EmailImportExport />
          </TabsContent>

          {/* Email Feature Settings Tab */}
          <TabsContent value="features">
            <EmailFeatureSettings />
          </TabsContent>

          {/* Access Control Tab */}
          <TabsContent value="access">
            <EmailAccessControl />
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t p-4 -mx-4 md:-mx-6 mt-6">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => navigate('/email-manager')}>
              {t({ ar: 'إلغاء', en: 'Cancel' })}
            </Button>
            <Button onClick={saveSettings} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? t({ ar: 'جاري الحفظ...', en: 'Saving...' }) : t({ ar: 'حفظ الإعدادات', en: 'Save Settings' })}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

