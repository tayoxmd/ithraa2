import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

interface ThemePreviewProps {
  themeId: string;
  onClose: () => void;
}

export default function ThemePreview({ themeId, onClose }: ThemePreviewProps) {
  const { t } = useLanguage();
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  return (
    <div className="space-y-6">
      <Tabs value={viewport} onValueChange={(v) => setViewport(v as any)}>
        <TabsList>
          <TabsTrigger value="desktop">
            <Monitor className="w-4 h-4 mr-2" />
            {t({ ar: 'سطح المكتب', en: 'Desktop' })}
          </TabsTrigger>
          <TabsTrigger value="tablet">
            <Tablet className="w-4 h-4 mr-2" />
            {t({ ar: 'تابلت', en: 'Tablet' })}
          </TabsTrigger>
          <TabsTrigger value="mobile">
            <Smartphone className="w-4 h-4 mr-2" />
            {t({ ar: 'موبايل', en: 'Mobile' })}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="desktop">
          <Card>
            <CardContent className="p-12">
              <div className="text-center text-muted-foreground">
                {t({ ar: 'معاينة سطح المكتب', en: 'Desktop Preview' })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tablet">
          <Card>
            <CardContent className="p-8">
              <div className="text-center text-muted-foreground">
                {t({ ar: 'معاينة التابلت', en: 'Tablet Preview' })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mobile">
          <Card>
            <CardContent className="p-4">
              <div className="text-center text-muted-foreground">
                {t({ ar: 'معاينة الموبايل', en: 'Mobile Preview' })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button variant="outline" onClick={onClose} className="w-full">
        {t({ ar: 'إغلاق', en: 'Close' })}
      </Button>
    </div>
  );
}
