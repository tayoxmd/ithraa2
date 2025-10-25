import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useThemeContext } from '@/contexts/ThemeProviderContext';
import { Loader2, Eye, Download, Upload, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ThemeEditor from '@/components/theme/ThemeEditor';
import ThemePreview from '@/components/theme/ThemePreview';

export default function ThemeSettingsTab() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { themes, currentTheme, applyTheme, forceThemeForAll, loading } = useThemeContext();
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [showForceDialog, setShowForceDialog] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleApplyTheme = async (themeId: string) => {
    try {
      await applyTheme(themeId);
      toast({
        title: t({ ar: 'تم التطبيق', en: 'Applied' }),
        description: t({ ar: 'تم تطبيق الثيم بنجاح', en: 'Theme applied successfully' }),
      });
    } catch (error: any) {
      toast({
        title: t({ ar: 'خطأ', en: 'Error' }),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleForceTheme = async () => {
    if (confirmText !== 'FORCE APPLY' || !selectedTheme) return;

    try {
      await forceThemeForAll(selectedTheme);
      toast({
        title: t({ ar: 'تم التطبيق القسري', en: 'Force Applied' }),
        description: t({ ar: 'تم تطبيق الثيم لجميع المستخدمين', en: 'Theme applied to all users' }),
      });
      setShowForceDialog(false);
      setConfirmText('');
    } catch (error: any) {
      toast({
        title: t({ ar: 'خطأ', en: 'Error' }),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleExportTheme = (theme: any) => {
    const dataStr = JSON.stringify(theme, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `theme-${theme.name.toLowerCase().replace(/\s+/g, '-')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {t({ ar: 'إدارة الثيمات', en: 'Theme Management' })}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t({ ar: 'اختر وخصص ثيمات التطبيق', en: 'Choose and customize application themes' })}
          </p>
        </div>
        <Button onClick={() => setShowEditor(true)}>
          {t({ ar: 'محرر الثيمات', en: 'Theme Editor' })}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {themes.map((theme) => (
          <Card key={theme.id} className={currentTheme?.id === theme.id ? 'border-primary' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {theme.name}
                {theme.is_default && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {t({ ar: 'افتراضي', en: 'Default' })}
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                {t({ ar: `الإصدار ${theme.version}`, en: `Version ${theme.version}` })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => handleApplyTheme(theme.id)}
                  variant={currentTheme?.id === theme.id ? 'default' : 'outline'}
                  className="flex-1"
                >
                  {currentTheme?.id === theme.id 
                    ? t({ ar: 'مطبق حالياً', en: 'Currently Applied' })
                    : t({ ar: 'تطبيق', en: 'Apply' })
                  }
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedTheme(theme.id);
                    setShowPreview(true);
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleExportTheme(theme)}
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  setSelectedTheme(theme.id);
                  setShowForceDialog(true);
                }}
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                {t({ ar: 'تطبيق قسري لجميع المستخدمين', en: 'Force Apply to All Users' })}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Force Apply Dialog */}
      <Dialog open={showForceDialog} onOpenChange={setShowForceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              {t({ ar: 'تحذير: تطبيق قسري', en: 'Warning: Force Apply' })}
            </DialogTitle>
            <DialogDescription>
              {t({ 
                ar: 'هذا سيطبق الثيم على جميع المستخدمين ويتجاوز تفضيلاتهم الشخصية. اكتب "FORCE APPLY" للتأكيد.',
                en: 'This will apply the theme to all users and override their personal preferences. Type "FORCE APPLY" to confirm.'
              })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t({ ar: 'تأكيد العملية', en: 'Confirm Action' })}</Label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="FORCE APPLY"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowForceDialog(false);
              setConfirmText('');
            }}>
              {t({ ar: 'إلغاء', en: 'Cancel' })}
            </Button>
            <Button
              variant="destructive"
              onClick={handleForceTheme}
              disabled={confirmText !== 'FORCE APPLY'}
            >
              {t({ ar: 'تطبيق قسري', en: 'Force Apply' })}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Theme Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t({ ar: 'محرر الثيمات', en: 'Theme Editor' })}</DialogTitle>
          </DialogHeader>
          <ThemeEditor onClose={() => setShowEditor(false)} />
        </DialogContent>
      </Dialog>

      {/* Theme Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t({ ar: 'معاينة الثيم', en: 'Theme Preview' })}</DialogTitle>
          </DialogHeader>
          {selectedTheme && (
            <ThemePreview 
              themeId={selectedTheme} 
              onClose={() => setShowPreview(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
