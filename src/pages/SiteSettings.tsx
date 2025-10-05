import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Palette, Type, Languages, Layout, Percent, Key } from "lucide-react";

export default function SiteSettings() {
  const { t } = useLanguage();
  const { userRole, loading } = useAuth();
  const navigate = useNavigate();
  const [primaryColor, setPrimaryColor] = useState("#F59E0B");
  const [fontFamily, setFontFamily] = useState("Cairo");
  const [fontSize, setFontSize] = useState("16");
  const [taxPercentage, setTaxPercentage] = useState("15");
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [socialMedia, setSocialMedia] = useState({
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    whatsapp_number: '+966505731136',
    email: 'support@ithraa.com',
    phone: '0505731136'
  });
  const [exceptionColors, setExceptionColors] = useState({
    owner_room_color: '#87CEEB',
    hotel_room_color: '' as string
  });
  const [chatCodes, setChatCodes] = useState({
    chat_widget_code: '',
    custom_head_code: '',
    custom_body_code: ''
  });

  useEffect(() => {
    if (!loading && userRole !== 'admin') {
      navigate('/');
    } else if (!loading) {
      fetchSettings();
    }
  }, [userRole, loading, navigate]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setTaxPercentage(data.tax_percentage?.toString() || "0");
        setSocialMedia({
          facebook_url: data.facebook_url || '',
          twitter_url: data.twitter_url || '',
          instagram_url: data.instagram_url || '',
          whatsapp_number: data.whatsapp_number || '+966505731136',
          email: data.email || 'support@ithraa.com',
          phone: data.phone || '0505731136'
        });
        setExceptionColors({
          owner_room_color: data.owner_room_color || '#87CEEB',
          hotel_room_color: data.hotel_room_color || ''
        });
        setChatCodes({
          chat_widget_code: data.chat_widget_code || '',
          custom_head_code: data.custom_head_code || '',
          custom_body_code: data.custom_body_code || ''
        });
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSaveColors = () => {
    toast({
      title: t({ ar: "تم الحفظ", en: "Saved" }),
      description: t({ ar: "تم حفظ إعدادات الألوان", en: "Color settings saved" }),
    });
  };

  const handleSaveExceptionColors = async () => {
    try {
      const { data: existingSettings } = await supabase
        .from('site_settings')
        .select('id')
        .single();

      if (existingSettings) {
        const { error } = await supabase
          .from('site_settings')
          .update({
            owner_room_color: exceptionColors.owner_room_color,
            hotel_room_color: exceptionColors.hotel_room_color || null,
          })
          .eq('id', existingSettings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert({
            tax_percentage: parseFloat(taxPercentage),
            owner_room_color: exceptionColors.owner_room_color,
            hotel_room_color: exceptionColors.hotel_room_color || null,
          });
        if (error) throw error;
      }

      toast({
        title: t({ ar: 'تم الحفظ', en: 'Saved' }),
        description: t({ ar: 'تم حفظ الألوان الاستثنائية', en: 'Exceptional colors saved' }),
      });
    } catch (error: any) {
      toast({
        title: t({ ar: 'خطأ', en: 'Error' }),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleSaveFonts = () => {
    toast({
      title: t({ ar: "تم الحفظ", en: "Saved" }),
      description: t({ ar: "تم حفظ إعدادات الخطوط", en: "Font settings saved" }),
    });
  };

  const handleSaveTax = async () => {
    try {
      const { data: existingSettings } = await supabase
        .from('site_settings')
        .select('id')
        .single();

      if (existingSettings) {
        const { error } = await supabase
          .from('site_settings')
          .update({ tax_percentage: parseFloat(taxPercentage) })
          .eq('id', existingSettings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert({ tax_percentage: parseFloat(taxPercentage) });

        if (error) throw error;
      }

      toast({
        title: t({ ar: "تم الحفظ", en: "Saved" }),
        description: t({ ar: "تم حفظ إعدادات الضريبة", en: "Tax settings saved" }),
      });
    } catch (error: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveSocialMedia = async () => {
    try {
      const { data: existingSettings } = await supabase
        .from('site_settings')
        .select('id')
        .single();

      if (existingSettings) {
        const { error } = await supabase
          .from('site_settings')
          .update(socialMedia)
          .eq('id', existingSettings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert({ ...socialMedia, tax_percentage: parseFloat(taxPercentage) });

        if (error) throw error;
      }

      toast({
        title: t({ ar: "تم الحفظ", en: "Saved" }),
        description: t({ ar: "تم حفظ إعدادات وسائل التواصل", en: "Social media settings saved" }),
      });
    } catch (error: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveChatCodes = async () => {
    try {
      const { data: existingSettings } = await supabase
        .from('site_settings')
        .select('id')
        .single();

      if (existingSettings) {
        const { error } = await supabase
          .from('site_settings')
          .update({
            chat_widget_code: chatCodes.chat_widget_code,
            custom_head_code: chatCodes.custom_head_code,
            custom_body_code: chatCodes.custom_body_code,
          })
          .eq('id', existingSettings.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert({
            ...chatCodes,
            tax_percentage: parseFloat(taxPercentage)
          });

        if (error) throw error;
      }

      toast({
        title: t({ ar: "تم الحفظ", en: "Saved" }),
        description: t({ ar: "تم حفظ إعدادات الدردشة والأكواد", en: "Chat & custom code settings saved" }),
      });
    } catch (error: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading || loadingSettings) {
    return <div className="min-h-screen flex items-center justify-center">{t({ ar: "جاري التحميل...", en: "Loading..." })}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-8">
          {t({ ar: 'إعدادات الموقع', en: 'Site Settings' })}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tax Settings Section */}
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                {t({ ar: 'إعدادات الضريبة', en: 'Tax Settings' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t({ ar: 'نسبة الضريبة المئوية', en: 'Tax Percentage' })}</Label>
                <div className="flex gap-2 mt-2 items-center">
                  <Input 
                    type="number" 
                    value={taxPercentage}
                    onChange={(e) => setTaxPercentage(e.target.value)}
                    min="0"
                    max="100"
                    step="0.1"
                    className="flex-1"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {t({ ar: 'سيتم تطبيق هذه النسبة على جميع أسعار الفنادق', en: 'This percentage will be applied to all hotel prices' })}
                </p>
              </div>
              <Button onClick={handleSaveTax} className="w-full btn-luxury">
                {t({ ar: 'حفظ إعدادات الضريبة', en: 'Save Tax Settings' })}
              </Button>
            </CardContent>
          </Card>

          {/* Colors Section */}
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                {t({ ar: 'الألوان الأساسية', en: 'Primary Colors' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t({ ar: 'اللون الأساسي', en: 'Primary Color' })}</Label>
                <div className="flex gap-2 mt-2">
                  <Input 
                    type="color" 
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-20 h-12"
                  />
                  <Input 
                    type="text" 
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              <Button onClick={handleSaveColors} className="w-full btn-luxury">
                {t({ ar: 'حفظ الألوان', en: 'Save Colors' })}
              </Button>
            </CardContent>
          </Card>

          {/* Exceptional Colors Section */}
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                {t({ ar: 'تغيير الألوان الاستثنائية', en: 'Exceptional Colors' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{t({ ar: 'غرف مُلّاك', en: 'Owner Rooms' })}</Label>
                  <div className="flex gap-2 mt-2 items-center">
                    <Input
                      type="color"
                      value={exceptionColors.owner_room_color}
                      onChange={(e) => setExceptionColors({ ...exceptionColors, owner_room_color: e.target.value })}
                      className="w-20 h-12"
                    />
                    <Input
                      type="text"
                      value={exceptionColors.owner_room_color}
                      onChange={(e) => setExceptionColors({ ...exceptionColors, owner_room_color: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>{t({ ar: 'غرف فندقية', en: 'Hotel Rooms' })}</Label>
                  <div className="flex gap-2 mt-2 items-center">
                    <Input
                      type="color"
                      value={exceptionColors.hotel_room_color}
                      onChange={(e) => setExceptionColors({ ...exceptionColors, hotel_room_color: e.target.value })}
                      className="w-20 h-12"
                    />
                    <Input
                      type="text"
                      value={exceptionColors.hotel_room_color}
                      onChange={(e) => setExceptionColors({ ...exceptionColors, hotel_room_color: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{t({ ar: 'تُستخدم هذه الألوان لتظليل بطاقات الفنادق والطلبات حسب النوع', en: 'These colors are used to highlight hotel and booking cards by type' })}</p>
              <Button onClick={handleSaveExceptionColors} className="w-full btn-luxury">
                {t({ ar: 'حفظ الألوان الاستثنائية', en: 'Save Exceptional Colors' })}
              </Button>
            </CardContent>
          </Card>

          {/* Fonts Section */}
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5" />
                {t({ ar: 'إعدادات الخطوط', en: 'Font Settings' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{t({ ar: 'نوع الخط', en: 'Font Family' })}</Label>
                <Select value={fontFamily} onValueChange={setFontFamily}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cairo">Cairo</SelectItem>
                    <SelectItem value="Tajawal">Tajawal</SelectItem>
                    <SelectItem value="Almarai">Almarai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t({ ar: 'حجم الخط', en: 'Font Size' })}</Label>
                <Input 
                  type="number" 
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  min="12"
                  max="24"
                  className="mt-2"
                />
              </div>
              <Button onClick={handleSaveFonts} className="w-full btn-luxury">
                {t({ ar: 'حفظ الخطوط', en: 'Save Fonts' })}
              </Button>
            </CardContent>
          </Card>

          {/* Languages Section */}
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="w-5 h-5" />
                {t({ ar: 'إدارة اللغات', en: 'Language Management' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t({ ar: 'اللغات المدعومة حالياً: العربية والإنجليزية', en: 'Currently supported languages: Arabic and English' })}
              </p>
              <p className="text-sm text-muted-foreground">
                {t({ ar: 'نظام الترجمة نشط ويعمل على جميع صفحات الموقع', en: 'Translation system is active and working across all site pages' })}
              </p>
            </CardContent>
          </Card>

          {/* Chat Widget & Custom Code Section */}
          <Card className="card-luxury lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5" />
                {t({ ar: 'إعدادات الدردشة والأكواد المخصصة', en: 'Chat Widget & Custom Code Settings' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>{t({ ar: 'كود الدردشة الحية (Tidio / Tawk.to / etc)', en: 'Live Chat Code (Tidio / Tawk.to / etc)' })}</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  {t({ ar: 'الصق كود HTML/JavaScript الخاص بالدردشة هنا', en: 'Paste your chat widget HTML/JavaScript code here' })}
                </p>
                <Textarea
                  value={chatCodes.chat_widget_code}
                  onChange={(e) => setChatCodes({ ...chatCodes, chat_widget_code: e.target.value })}
                  placeholder="<!-- كود الدردشة -->"
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label>{t({ ar: 'أكواد مخصصة للـ Head', en: 'Custom Head Code' })}</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  {t({ ar: 'أكواد Google Analytics أو Facebook Pixel أو أي أكواد أخرى', en: 'Google Analytics, Facebook Pixel or other codes' })}
                </p>
                <Textarea
                  value={chatCodes.custom_head_code}
                  onChange={(e) => setChatCodes({ ...chatCodes, custom_head_code: e.target.value })}
                  placeholder="<!-- أكواد Head -->"
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label>{t({ ar: 'أكواد مخصصة للـ Body', en: 'Custom Body Code' })}</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  {t({ ar: 'أكواد تُوضع قبل نهاية علامة body', en: 'Codes to be placed before the closing body tag' })}
                </p>
                <Textarea
                  value={chatCodes.custom_body_code}
                  onChange={(e) => setChatCodes({ ...chatCodes, custom_body_code: e.target.value })}
                  placeholder="<!-- أكواد Body -->"
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              <Button onClick={handleSaveChatCodes} className="w-full btn-luxury">
                {t({ ar: 'حفظ إعدادات الدردشة والأكواد', en: 'Save Chat & Custom Code Settings' })}
              </Button>
            </CardContent>
          </Card>

          {/* Social Media Section */}
          <Card className="card-luxury lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5" />
                {t({ ar: 'وسائل التواصل الاجتماعي', en: 'Social Media' })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>{t({ ar: 'رابط فيسبوك', en: 'Facebook URL' })}</Label>
                  <Input 
                    type="url"
                    value={socialMedia.facebook_url}
                    onChange={(e) => setSocialMedia({...socialMedia, facebook_url: e.target.value})}
                    placeholder="https://facebook.com/..."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>{t({ ar: 'رابط تويتر', en: 'Twitter URL' })}</Label>
                  <Input 
                    type="url"
                    value={socialMedia.twitter_url}
                    onChange={(e) => setSocialMedia({...socialMedia, twitter_url: e.target.value})}
                    placeholder="https://twitter.com/..."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>{t({ ar: 'رابط إنستقرام', en: 'Instagram URL' })}</Label>
                  <Input 
                    type="url"
                    value={socialMedia.instagram_url}
                    onChange={(e) => setSocialMedia({...socialMedia, instagram_url: e.target.value})}
                    placeholder="https://instagram.com/..."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>{t({ ar: 'رقم واتساب', en: 'WhatsApp Number' })}</Label>
                  <Input 
                    type="tel"
                    value={socialMedia.whatsapp_number}
                    onChange={(e) => setSocialMedia({...socialMedia, whatsapp_number: e.target.value})}
                    placeholder="+966505731136"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>{t({ ar: 'البريد الإلكتروني', en: 'Email' })}</Label>
                  <Input 
                    type="email"
                    value={socialMedia.email}
                    onChange={(e) => setSocialMedia({...socialMedia, email: e.target.value})}
                    placeholder="support@ithraa.com"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>{t({ ar: 'رقم الهاتف', en: 'Phone' })}</Label>
                  <Input 
                    type="tel"
                    value={socialMedia.phone}
                    onChange={(e) => setSocialMedia({...socialMedia, phone: e.target.value})}
                    placeholder="0505731136"
                    className="mt-2"
                  />
                </div>
              </div>
              <Button onClick={handleSaveSocialMedia} className="w-full btn-luxury">
                {t({ ar: 'حفظ إعدادات وسائل التواصل', en: 'Save Social Media Settings' })}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* API Settings Link */}
      <div className="container mx-auto px-4 pb-8">
        <Card className="card-luxury">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              {t({ ar: "إعدادات API", en: "API Settings" })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {t({ ar: "إدارة مفاتيح API والنطاقات المسموحة لربط موقعك بمواقع أخرى", en: "Manage API keys and allowed origins to connect your site with other platforms" })}
            </p>
            <Button onClick={() => navigate('/api-settings')} variant="outline">
              {t({ ar: "إدارة إعدادات API", en: "Manage API Settings" })}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}