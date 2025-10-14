import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Smartphone, Download, Share, Chrome, Menu, MoreVertical, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function InstallApp() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app was installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setIsInstallable(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-2xl">
              <Smartphone className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {t({ ar: "تطبيق إثراء للموبايل", en: "ITHRAA Mobile App" })}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t({ 
              ar: "احجز الفنادق بسهولة من جوالك", 
              en: "Book hotels easily from your mobile" 
            })}
          </p>
        </div>

        {/* Install Status */}
        {isInstalled && (
          <Card className="border-primary bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-primary">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">
                    {t({ ar: "التطبيق مثبت بنجاح!", en: "App installed successfully!" })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t({ 
                      ar: "يمكنك الآن استخدام التطبيق من الشاشة الرئيسية", 
                      en: "You can now use the app from home screen" 
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Install Button */}
        {isInstallable && !isInstalled && (
          <Card className="border-primary bg-gradient-to-br from-primary/10 to-primary/5">
            <CardContent className="pt-6">
              <Button 
                onClick={handleInstallClick} 
                size="lg" 
                className="w-full text-lg"
              >
                <Download className="w-5 h-5 mr-2" />
                {t({ ar: "تثبيت التطبيق الآن", en: "Install App Now" })}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Android Instructions */}
        {isAndroid && !isInstalled && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Chrome className="w-6 h-6" />
                {t({ ar: "تثبيت على أندرويد", en: "Install on Android" })}
              </CardTitle>
              <CardDescription>
                {t({ 
                  ar: "اتبع الخطوات التالية لتثبيت التطبيق", 
                  en: "Follow these steps to install the app" 
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {t({ ar: "افتح قائمة المتصفح", en: "Open browser menu" })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t({ 
                        ar: "اضغط على أيقونة النقاط الثلاث في أعلى يمين الشاشة", 
                        en: "Tap the three dots icon in the top right" 
                      })}
                    </p>
                    <div className="mt-2 p-2 bg-muted rounded-lg inline-flex items-center gap-2">
                      <MoreVertical className="w-5 h-5" />
                      <span className="text-sm">{t({ ar: "القائمة", en: "Menu" })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {t({ ar: "اختر إضافة إلى الشاشة الرئيسية", en: "Select Add to Home screen" })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t({ 
                        ar: "ابحث عن خيار 'إضافة إلى الشاشة الرئيسية' أو 'تثبيت التطبيق'", 
                        en: "Look for 'Add to Home screen' or 'Install app' option" 
                      })}
                    </p>
                    <div className="mt-2 p-2 bg-muted rounded-lg inline-flex items-center gap-2">
                      <Home className="w-5 h-5" />
                      <span className="text-sm">{t({ ar: "إضافة إلى الشاشة", en: "Add to Home" })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {t({ ar: "أكد التثبيت", en: "Confirm installation" })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t({ 
                        ar: "اضغط على 'تثبيت' أو 'إضافة' لإكمال العملية", 
                        en: "Tap 'Install' or 'Add' to complete" 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* iOS Instructions */}
        {isIOS && !isInstalled && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="w-6 h-6" />
                {t({ ar: "تثبيت على آيفون", en: "Install on iPhone" })}
              </CardTitle>
              <CardDescription>
                {t({ 
                  ar: "اتبع الخطوات التالية لتثبيت التطبيق على آيفون", 
                  en: "Follow these steps to install on iPhone" 
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {t({ ar: "افتح سفاري", en: "Open Safari" })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t({ 
                        ar: "تأكد من فتح الموقع في متصفح سفاري (Safari)", 
                        en: "Make sure you're using Safari browser" 
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {t({ ar: "اضغط على زر المشاركة", en: "Tap Share button" })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t({ 
                        ar: "اضغط على أيقونة المشاركة في أسفل الشاشة", 
                        en: "Tap the share icon at the bottom of the screen" 
                      })}
                    </p>
                    <div className="mt-2 p-2 bg-muted rounded-lg inline-flex items-center gap-2">
                      <Share className="w-5 h-5" />
                      <span className="text-sm">{t({ ar: "مشاركة", en: "Share" })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {t({ ar: "اختر إضافة إلى الشاشة الرئيسية", en: "Select Add to Home Screen" })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t({ 
                        ar: "مرر لأسفل واختر 'إضافة إلى الشاشة الرئيسية'", 
                        en: "Scroll down and select 'Add to Home Screen'" 
                      })}
                    </p>
                    <div className="mt-2 p-2 bg-muted rounded-lg inline-flex items-center gap-2">
                      <Home className="w-5 h-5" />
                      <span className="text-sm">{t({ ar: "إضافة إلى الشاشة", en: "Add to Home" })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    4
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {t({ ar: "اضغط على إضافة", en: "Tap Add" })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t({ 
                        ar: "اضغط على 'إضافة' في أعلى يمين الشاشة", 
                        en: "Tap 'Add' in the top right corner" 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle>
              {t({ ar: "مميزات التطبيق", en: "App Features" })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">
                    {t({ ar: "تجربة أصلية", en: "Native Experience" })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t({ ar: "يعمل مثل تطبيق حقيقي", en: "Works like a real app" })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">
                    {t({ ar: "يعمل بدون إنترنت", en: "Works Offline" })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t({ ar: "تصفح الفنادق بدون اتصال", en: "Browse hotels offline" })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Menu className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">
                    {t({ ar: "سريع وخفيف", en: "Fast & Light" })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t({ ar: "لا يحتاج مساحة كبيرة", en: "Minimal storage space" })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Home className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">
                    {t({ ar: "وصول سريع", en: "Quick Access" })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t({ ar: "من الشاشة الرئيسية مباشرة", en: "Direct from home screen" })}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            size="lg"
          >
            {t({ ar: "العودة للصفحة الرئيسية", en: "Back to Home" })}
          </Button>
        </div>
      </div>
    </div>
  );
}
