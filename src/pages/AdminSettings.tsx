import { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useHasPermission } from '@/hooks/usePermission';
import ProtectedRoute from '@/components/ProtectedRoute';
import SiteSettingsTab from '@/components/settings/SiteSettingsTab';
import ThemeSettingsTab from '@/components/settings/ThemeSettingsTab';
import DashboardSettingsTab from '@/components/settings/DashboardSettingsTab';
import IndicatorSettingsTab from '@/components/settings/IndicatorSettingsTab';

export default function AdminSettings() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { hasPermission } = useHasPermission();
  const [activeTab, setActiveTab] = useState('site');

  const tabs = [
    { value: 'site', label: { ar: 'إعدادات الموقع', en: 'Site Settings' }, permission: 'manage_settings' },
    { value: 'theme', label: { ar: 'الثيمات', en: 'Themes' }, permission: 'manage_settings' },
    { value: 'dashboard', label: { ar: 'تصميم اللوحة', en: 'Dashboard Design' }, permission: 'manage_settings' },
    { value: 'indicators', label: { ar: 'مؤشرات التحميل', en: 'Loading Indicators' }, permission: 'manage_settings' }
  ];

  const visibleTabs = tabs.filter(tab => hasPermission(tab.permission as any));

  return (
    <ProtectedRoute requiredPermission="manage_settings">
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 pt-24">
          <Button variant="outline" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t({ ar: 'العودة', en: 'Back' })}
          </Button>

          <Card className="card-luxury">
            <CardHeader>
              <CardTitle className="text-3xl">
                {t({ ar: 'الإعدادات المتقدمة', en: 'Advanced Settings' })}
              </CardTitle>
              <CardDescription>
                {t({ 
                  ar: 'إدارة جميع إعدادات النظام من مكان واحد', 
                  en: 'Manage all system settings from one place' 
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
                  {visibleTabs.map(tab => (
                    <TabsTrigger key={tab.value} value={tab.value}>
                      {t(tab.label)}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="site">
                  <SiteSettingsTab />
                </TabsContent>

                <TabsContent value="theme">
                  <ThemeSettingsTab />
                </TabsContent>

                <TabsContent value="dashboard">
                  <DashboardSettingsTab />
                </TabsContent>

                <TabsContent value="indicators">
                  <IndicatorSettingsTab />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
