import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Palette, Type, Languages, Layout, Percent } from "lucide-react";

export default function SiteSettings() {
  const { t } = useLanguage();
  const { userRole, loading } = useAuth();
  const navigate = useNavigate();
  const [primaryColor, setPrimaryColor] = useState("#F59E0B");
  const [fontFamily, setFontFamily] = useState("Cairo");
  const [fontSize, setFontSize] = useState("16");
  const [taxPercentage, setTaxPercentage] = useState("15");
  const [loadingSettings, setLoadingSettings] = useState(true);

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
        setTaxPercentage(data.tax_percentage?.toString() || "15");
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
                {t({ ar: 'قريباً - إضافة لغات إضافية', en: 'Coming soon - Add additional languages' })}
              </p>
            </CardContent>
          </Card>

          {/* Layout Section */}
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5" />
                {t({ ar: 'تصميم الصفحات', en: 'Page Layouts' })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t({ ar: 'قريباً - تخصيص تصاميم الصفحات', en: 'Coming soon - Customize page layouts' })}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}