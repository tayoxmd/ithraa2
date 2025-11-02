import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Layout, Edit, X, Save, LogOut, FileText, Search, Calendar, ShoppingCart, Users, Settings, Home, ArrowLeft } from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PageBuilder } from '@/components/page-builder/PageBuilder';

interface PageInfo {
  id: string;
  name_ar: string;
  name_en: string;
  path: string;
  type: 'page' | 'popup' | 'dialog';
  icon: any;
}

const AVAILABLE_PAGES: PageInfo[] = [
  { id: 'home', name_ar: 'الصفحة الرئيسية', name_en: 'Home Page', path: '/', type: 'page', icon: Home },
  { id: 'search', name_ar: 'صفحة البحث', name_en: 'Search Page', path: '/search', type: 'page', icon: Search },
  { id: 'booking', name_ar: 'صفحة الحجز', name_en: 'Booking Page', path: '/booking', type: 'page', icon: Calendar },
  { id: 'auth', name_ar: 'صفحة تسجيل الدخول', name_en: 'Login Page', path: '/auth', type: 'page', icon: LogOut },
  { id: 'profile', name_ar: 'صفحة الملف الشخصي', name_en: 'Profile Page', path: '/profile', type: 'page', icon: Users },
  { id: 'settings', name_ar: 'صفحة الإعدادات', name_en: 'Settings Page', path: '/site-settings', type: 'page', icon: Settings },
];

export default function PageCustomization() {
  const { t } = useLanguage();
  const { userRole, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editorMode, setEditorMode] = useState(false);

  useEffect(() => {
    if (!loading && userRole !== 'admin') {
      navigate('/');
    }
  }, [loading, userRole, navigate]);

  // التحقق من وجود معامل ?edit في الرابط
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('edit') === 'true' && params.get('page')) {
      setSelectedPage(params.get('page'));
      setIsEditing(true);
      setEditorMode(true);
    }
  }, [location]);

  const handleEditPage = (pageId: string) => {
    const page = AVAILABLE_PAGES.find(p => p.id === pageId);
    if (page) {
      setSelectedPage(pageId);
      setIsEditing(true);
      setEditorMode(true);
      // التوجيه إلى الصفحة مع فتح المحرر
      navigate(`${page.path}?edit=true&page=${pageId}`);
    }
  };

  const handleExitEditor = () => {
    setIsEditing(false);
    setEditorMode(false);
    setSelectedPage(null);
    // إزالة معاملات التحرير من الرابط
    navigate('/page-customization');
  };

  const handleSaveAndExit = () => {
    // هنا يمكنك إضافة منطق الحفظ
    handleExitEditor();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (userRole !== 'admin') {
    return null;
  }

  // إذا كان في وضع التحرير، اعرض المحرر
  if (editorMode && selectedPage) {
    const page = AVAILABLE_PAGES.find(p => p.id === selectedPage);
    return (
      <div className="min-h-screen bg-background">
        <Header />
        
        {/* أزرار التحكم في المحرر */}
        <div className="fixed top-20 right-4 z-50 flex gap-2">
          <Button
            onClick={handleSaveAndExit}
            variant="default"
            size="sm"
            className="shadow-lg"
          >
            <Save className="h-4 w-4 mr-2" />
            {t({ ar: 'حفظ والخروج', en: 'Save & Exit' })}
          </Button>
          <Button
            onClick={handleExitEditor}
            variant="outline"
            size="sm"
            className="shadow-lg bg-background"
          >
            <X className="h-4 w-4 mr-2" />
            {t({ ar: 'خروج', en: 'Exit' })}
          </Button>
        </div>

        {/* المحرر */}
        <div className="pt-24">
          <PageBuilder />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <Button
            onClick={() => navigate('/site-settings')}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t({ ar: 'رجوع إلى الإعدادات', en: 'Back to Settings' })}
          </Button>
          <h1 className="text-3xl font-bold mb-2">
            {t({ ar: 'تخصيص الصفحات', en: 'Page Customization' })}
          </h1>
          <p className="text-muted-foreground">
            {t({ ar: 'قم بتحرير وتخصيص صفحات الموقع والنوافذ المنبثقة', en: 'Edit and customize site pages and popups' })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AVAILABLE_PAGES.map((page) => {
            const Icon = page.icon;
            return (
              <Card key={page.id} className="card-luxury hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="w-5 h-5" />
                    {t({ ar: page.name_ar, en: page.name_en })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {t({ 
                      ar: `مسار: ${page.path}`, 
                      en: `Path: ${page.path}` 
                    })}
                  </p>
                  <Button
                    onClick={() => handleEditPage(page.id)}
                    className="w-full"
                    variant="outline"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t({ ar: 'تحرير', en: 'Edit' })}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Footer />
    </div>
  );
}

