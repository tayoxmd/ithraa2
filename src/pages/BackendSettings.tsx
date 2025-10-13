import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Database, Key, Mail, Shield, HardDrive } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export default function BackendSettings() {
  const { t } = useLanguage();
  const { userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Auth Settings
  const [authSettings, setAuthSettings] = useState({
    googleClientId: "",
    googleClientSecret: "",
    appleClientId: "",
    appleClientSecret: "",
    twitterClientId: "",
    twitterClientSecret: "",
    whatsappApiKey: "",
    autoConfirmEmail: true,
    disableSignup: false,
    anonymousUsersEnabled: false,
  });

  // Email Settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "",
    smtpPort: "",
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "",
    fromName: "",
  });

  // Storage Settings
  const [storageSettings, setStorageSettings] = useState({
    maxFileSize: "52428800", // 50MB default
    allowedMimeTypes: "image/*,application/pdf",
    publicBucket: true,
  });

  useEffect(() => {
    if (userRole !== 'admin') {
      navigate('/');
      return;
    }
    loadSettings();
  }, [userRole]);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // Load existing settings from a settings table if exists
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (data) {
        // Parse stored settings if they exist
        // This is just a placeholder - you'd store these in your database
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAuthSettings = async () => {
    setLoading(true);
    try {
      toast({
        title: t({ ar: "تم الحفظ", en: "Saved" }),
        description: t({ 
          ar: "يجب تطبيق هذه الإعدادات من لوحة التحكم في Backend", 
          en: "These settings must be applied from the Backend dashboard" 
        }),
      });
    } catch (error: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate('/site-settings')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t({ ar: "العودة", en: "Back" })}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Database className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {t({ ar: "إعدادات Backend", en: "Backend Settings" })}
                </CardTitle>
                <CardDescription>
                  {t({ 
                    ar: "إدارة جميع إعدادات قاعدة البيانات والمصادقة", 
                    en: "Manage all database and authentication settings" 
                  })}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="auth" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="auth">
                  <Shield className="w-4 h-4 mr-2" />
                  {t({ ar: "المصادقة", en: "Auth" })}
                </TabsTrigger>
                <TabsTrigger value="email">
                  <Mail className="w-4 h-4 mr-2" />
                  {t({ ar: "البريد", en: "Email" })}
                </TabsTrigger>
                <TabsTrigger value="storage">
                  <HardDrive className="w-4 h-4 mr-2" />
                  {t({ ar: "التخزين", en: "Storage" })}
                </TabsTrigger>
                <TabsTrigger value="api">
                  <Key className="w-4 h-4 mr-2" />
                  {t({ ar: "API", en: "API" })}
                </TabsTrigger>
              </TabsList>

              {/* Auth Settings */}
              <TabsContent value="auth" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t({ ar: "إعدادات OAuth", en: "OAuth Settings" })}
                    </CardTitle>
                    <CardDescription>
                      {t({ 
                        ar: "قم بإدخال معرفات OAuth للخدمات المختلفة", 
                        en: "Enter OAuth credentials for different services" 
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Google OAuth */}
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 text-sm">G</span>
                        </div>
                        Google OAuth
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Client ID</Label>
                          <Input
                            value={authSettings.googleClientId}
                            onChange={(e) => setAuthSettings({...authSettings, googleClientId: e.target.value})}
                            placeholder="xxx.apps.googleusercontent.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Client Secret</Label>
                          <Input
                            type="password"
                            value={authSettings.googleClientSecret}
                            onChange={(e) => setAuthSettings({...authSettings, googleClientSecret: e.target.value})}
                            placeholder="GOCSPX-xxx"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Apple OAuth */}
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-gray-800 text-sm"></span>
                        </div>
                        Apple OAuth
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Client ID (Service ID)</Label>
                          <Input
                            value={authSettings.appleClientId}
                            onChange={(e) => setAuthSettings({...authSettings, appleClientId: e.target.value})}
                            placeholder="com.example.app"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Team ID</Label>
                          <Input
                            type="password"
                            value={authSettings.appleClientSecret}
                            onChange={(e) => setAuthSettings({...authSettings, appleClientSecret: e.target.value})}
                            placeholder="XXXXX"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Twitter/X OAuth */}
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 text-sm">𝕏</span>
                        </div>
                        X (Twitter) OAuth
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>API Key</Label>
                          <Input
                            value={authSettings.twitterClientId}
                            onChange={(e) => setAuthSettings({...authSettings, twitterClientId: e.target.value})}
                            placeholder="xxxxx"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>API Secret</Label>
                          <Input
                            type="password"
                            value={authSettings.twitterClientSecret}
                            onChange={(e) => setAuthSettings({...authSettings, twitterClientSecret: e.target.value})}
                            placeholder="xxxxx"
                          />
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp API */}
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-sm">W</span>
                        </div>
                        WhatsApp API
                      </h3>
                      <div className="space-y-2">
                        <Label>API Key (ASENDERAPI_KEY)</Label>
                        <Input
                          type="password"
                          value={authSettings.whatsappApiKey}
                          onChange={(e) => setAuthSettings({...authSettings, whatsappApiKey: e.target.value})}
                          placeholder="Enter WhatsApp API key"
                        />
                      </div>
                    </div>

                    {/* Auth Options */}
                    <div className="space-y-4 pt-4 border-t">
                      <h3 className="font-semibold">
                        {t({ ar: "خيارات المصادقة", en: "Auth Options" })}
                      </h3>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>{t({ ar: "تأكيد البريد التلقائي", en: "Auto Confirm Email" })}</Label>
                          <p className="text-sm text-muted-foreground">
                            {t({ 
                              ar: "تفعيل المستخدمين تلقائياً بدون تأكيد البريد", 
                              en: "Activate users automatically without email confirmation" 
                            })}
                          </p>
                        </div>
                        <Switch
                          checked={authSettings.autoConfirmEmail}
                          onCheckedChange={(checked) => setAuthSettings({...authSettings, autoConfirmEmail: checked})}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>{t({ ar: "تعطيل التسجيل", en: "Disable Signup" })}</Label>
                          <p className="text-sm text-muted-foreground">
                            {t({ 
                              ar: "منع المستخدمين الجدد من التسجيل", 
                              en: "Prevent new users from signing up" 
                            })}
                          </p>
                        </div>
                        <Switch
                          checked={authSettings.disableSignup}
                          onCheckedChange={(checked) => setAuthSettings({...authSettings, disableSignup: checked})}
                        />
                      </div>
                    </div>

                    <Button onClick={handleSaveAuthSettings} disabled={loading} className="w-full">
                      {t({ ar: "حفظ إعدادات المصادقة", en: "Save Auth Settings" })}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Email Settings */}
              <TabsContent value="email" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t({ ar: "إعدادات SMTP", en: "SMTP Settings" })}
                    </CardTitle>
                    <CardDescription>
                      {t({ 
                        ar: "قم بتكوين خادم البريد الإلكتروني", 
                        en: "Configure email server settings" 
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>SMTP Host</Label>
                        <Input
                          value={emailSettings.smtpHost}
                          onChange={(e) => setEmailSettings({...emailSettings, smtpHost: e.target.value})}
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>SMTP Port</Label>
                        <Input
                          value={emailSettings.smtpPort}
                          onChange={(e) => setEmailSettings({...emailSettings, smtpPort: e.target.value})}
                          placeholder="587"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>SMTP Username</Label>
                      <Input
                        value={emailSettings.smtpUser}
                        onChange={(e) => setEmailSettings({...emailSettings, smtpUser: e.target.value})}
                        placeholder="user@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>SMTP Password</Label>
                      <Input
                        type="password"
                        value={emailSettings.smtpPassword}
                        onChange={(e) => setEmailSettings({...emailSettings, smtpPassword: e.target.value})}
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t({ ar: "البريد المرسل", en: "From Email" })}</Label>
                        <Input
                          value={emailSettings.fromEmail}
                          onChange={(e) => setEmailSettings({...emailSettings, fromEmail: e.target.value})}
                          placeholder="noreply@ithraa.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t({ ar: "اسم المرسل", en: "From Name" })}</Label>
                        <Input
                          value={emailSettings.fromName}
                          onChange={(e) => setEmailSettings({...emailSettings, fromName: e.target.value})}
                          placeholder="ITHRAA"
                        />
                      </div>
                    </div>
                    <Button onClick={handleSaveAuthSettings} disabled={loading} className="w-full">
                      {t({ ar: "حفظ إعدادات البريد", en: "Save Email Settings" })}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Storage Settings */}
              <TabsContent value="storage" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t({ ar: "إعدادات التخزين", en: "Storage Settings" })}
                    </CardTitle>
                    <CardDescription>
                      {t({ 
                        ar: "إدارة إعدادات تخزين الملفات", 
                        en: "Manage file storage settings" 
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t({ ar: "الحد الأقصى لحجم الملف (بايت)", en: "Max File Size (bytes)" })}</Label>
                      <Input
                        type="number"
                        value={storageSettings.maxFileSize}
                        onChange={(e) => setStorageSettings({...storageSettings, maxFileSize: e.target.value})}
                        placeholder="52428800"
                      />
                      <p className="text-sm text-muted-foreground">
                        {t({ ar: "الافتراضي: 50 ميجابايت (52428800 بايت)", en: "Default: 50MB (52428800 bytes)" })}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ ar: "أنواع الملفات المسموحة", en: "Allowed MIME Types" })}</Label>
                      <Textarea
                        value={storageSettings.allowedMimeTypes}
                        onChange={(e) => setStorageSettings({...storageSettings, allowedMimeTypes: e.target.value})}
                        placeholder="image/*,application/pdf,video/*"
                        rows={3}
                      />
                      <p className="text-sm text-muted-foreground">
                        {t({ 
                          ar: "افصل بفاصلة. مثال: image/*,application/pdf", 
                          en: "Separate with commas. Example: image/*,application/pdf" 
                        })}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>{t({ ar: "دلو عام", en: "Public Bucket" })}</Label>
                        <p className="text-sm text-muted-foreground">
                          {t({ 
                            ar: "السماح بالوصول العام للملفات", 
                            en: "Allow public access to files" 
                          })}
                        </p>
                      </div>
                      <Switch
                        checked={storageSettings.publicBucket}
                        onCheckedChange={(checked) => setStorageSettings({...storageSettings, publicBucket: checked})}
                      />
                    </div>
                    <Button onClick={handleSaveAuthSettings} disabled={loading} className="w-full">
                      {t({ ar: "حفظ إعدادات التخزين", en: "Save Storage Settings" })}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* API Settings */}
              <TabsContent value="api" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {t({ ar: "معلومات API", en: "API Information" })}
                    </CardTitle>
                    <CardDescription>
                      {t({ 
                        ar: "معلومات الاتصال بقاعدة البيانات", 
                        en: "Database connection information" 
                      })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Project URL</Label>
                      <Input
                        value={import.meta.env.VITE_SUPABASE_URL || ""}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Anon/Public Key</Label>
                      <Input
                        value={import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || ""}
                        readOnly
                        className="bg-muted font-mono text-xs"
                      />
                    </div>
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        ⚠️ {t({ 
                          ar: "هذه المعلومات للقراءة فقط. للتعديل استخدم لوحة التحكم.", 
                          en: "This information is read-only. Use the dashboard to modify." 
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Backend Dashboard Link */}
            <div className="mt-6 p-6 bg-gradient-to-r from-primary/10 to-primary-glow/10 rounded-lg border border-primary/20">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Database className="w-5 h-5" />
                {t({ ar: "الوصول إلى لوحة التحكم الكاملة", en: "Access Full Backend Dashboard" })}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t({ 
                  ar: "لتطبيق التغييرات والوصول إلى جميع الميزات المتقدمة، افتح لوحة التحكم الكاملة", 
                  en: "To apply changes and access all advanced features, open the full dashboard" 
                })}
              </p>
              <Button
                onClick={() => {
                  // This would trigger opening the backend
                  toast({
                    title: t({ ar: "فتح لوحة التحكم", en: "Opening Dashboard" }),
                    description: t({ 
                      ar: "يتم فتح لوحة التحكم...", 
                      en: "Opening dashboard..." 
                    }),
                  });
                }}
                className="w-full"
              >
                <Database className="w-4 h-4 mr-2" />
                {t({ ar: "فتح لوحة التحكم", en: "Open Backend Dashboard" })}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
