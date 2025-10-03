import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { Palette, Type, Languages, Layout } from "lucide-react";

export default function SiteSettings() {
  const { t } = useLanguage();
  const [primaryColor, setPrimaryColor] = useState("#F59E0B");
  const [fontFamily, setFontFamily] = useState("Cairo");
  const [fontSize, setFontSize] = useState("16");

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-8">
          {t({ ar: 'إعدادات الموقع', en: 'Site Settings' })}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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