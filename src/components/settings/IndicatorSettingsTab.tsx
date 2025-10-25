import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Upload, Trash2, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { IndicatorAsset } from '@/types/theme';

export default function IndicatorSettingsTab() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [indicators, setIndicators] = useState<IndicatorAsset[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    asset_type: 'svg' as 'svg' | 'json' | 'js',
    asset_data: ''
  });

  useEffect(() => {
    loadIndicators();
  }, []);

  const loadIndicators = async () => {
    try {
      const { data, error } = await supabase
        .from('indicator_assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIndicators(data as any || []);
    } catch (error) {
      console.error('Error loading indicators:', error);
    }
  };

  const handleUpload = async () => {
    if (!formData.name || !formData.asset_data) {
      toast({
        title: t({ ar: 'خطأ', en: 'Error' }),
        description: t({ ar: 'يرجى ملء جميع الحقول المطلوبة', en: 'Please fill all required fields' }),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('indicator_assets')
        .insert({
          name: formData.name,
          description: formData.description,
          asset_type: formData.asset_type,
          asset_data: formData.asset_data,
          is_active: false
        });

      if (error) throw error;

      toast({
        title: t({ ar: 'تم الرفع', en: 'Uploaded' }),
        description: t({ ar: 'تم رفع المؤشر بنجاح', en: 'Indicator uploaded successfully' }),
      });

      setFormData({ name: '', description: '', asset_type: 'svg', asset_data: '' });
      setShowUploadForm(false);
      loadIndicators();
    } catch (error: any) {
      toast({
        title: t({ ar: 'خطأ', en: 'Error' }),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (indicatorId: string) => {
    setLoading(true);
    try {
      // Deactivate all others
      await supabase
        .from('indicator_assets')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Activate selected
      const { error } = await supabase
        .from('indicator_assets')
        .update({ is_active: true })
        .eq('id', indicatorId);

      if (error) throw error;

      toast({
        title: t({ ar: 'تم التفعيل', en: 'Activated' }),
        description: t({ ar: 'تم تفعيل المؤشر بنجاح', en: 'Indicator activated successfully' }),
      });

      loadIndicators();
    } catch (error: any) {
      toast({
        title: t({ ar: 'خطأ', en: 'Error' }),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (indicatorId: string) => {
    if (!confirm(t({ ar: 'هل أنت متأكد من حذف هذا المؤشر؟', en: 'Are you sure you want to delete this indicator?' }))) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('indicator_assets')
        .delete()
        .eq('id', indicatorId);

      if (error) throw error;

      toast({
        title: t({ ar: 'تم الحذف', en: 'Deleted' }),
        description: t({ ar: 'تم حذف المؤشر بنجاح', en: 'Indicator deleted successfully' }),
      });

      loadIndicators();
    } catch (error: any) {
      toast({
        title: t({ ar: 'خطأ', en: 'Error' }),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {t({ ar: 'مؤشرات التحميل', en: 'Loading Indicators' })}
          </h3>
          <p className="text-sm text-muted-foreground">
            {t({ ar: 'إدارة مؤشرات التحميل المخصصة', en: 'Manage custom loading indicators' })}
          </p>
        </div>
        <Button onClick={() => setShowUploadForm(!showUploadForm)}>
          <Upload className="w-4 h-4 mr-2" />
          {t({ ar: 'رفع مؤشر', en: 'Upload Indicator' })}
        </Button>
      </div>

      {showUploadForm && (
        <Card>
          <CardHeader>
            <CardTitle>{t({ ar: 'رفع مؤشر جديد', en: 'Upload New Indicator' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>{t({ ar: 'الاسم', en: 'Name' })}</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t({ ar: 'الوصف', en: 'Description' })}</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t({ ar: 'النوع', en: 'Type' })}</Label>
              <Select value={formData.asset_type} onValueChange={(v: any) => setFormData({ ...formData, asset_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="svg">SVG</SelectItem>
                  <SelectItem value="json">JSON (Lottie)</SelectItem>
                  <SelectItem value="js">JavaScript</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t({ ar: 'الكود', en: 'Code' })}</Label>
              <Textarea
                rows={8}
                value={formData.asset_data}
                onChange={(e) => setFormData({ ...formData, asset_data: e.target.value })}
                placeholder={t({ ar: 'الصق كود SVG أو JSON هنا...', en: 'Paste SVG or JSON code here...' })}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleUpload} disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t({ ar: 'رفع', en: 'Upload' })}
              </Button>
              <Button variant="outline" onClick={() => setShowUploadForm(false)}>
                {t({ ar: 'إلغاء', en: 'Cancel' })}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {indicators.map((indicator) => (
          <Card key={indicator.id} className={indicator.is_active ? 'border-primary' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {indicator.name}
                {indicator.is_active && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    {t({ ar: 'نشط', en: 'Active' })}
                  </span>
                )}
              </CardTitle>
              <CardDescription>{indicator.description || '-'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="aspect-square bg-muted rounded-md flex items-center justify-center p-4">
                {indicator.asset_type === 'svg' && (
                  <div dangerouslySetInnerHTML={{ __html: indicator.asset_data }} className="w-12 h-12" />
                )}
                {indicator.asset_type !== 'svg' && (
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={indicator.is_active ? 'default' : 'outline'}
                  className="flex-1"
                  onClick={() => handleActivate(indicator.id)}
                  disabled={loading || indicator.is_active}
                >
                  {indicator.is_active ? t({ ar: 'نشط', en: 'Active' }) : t({ ar: 'تفعيل', en: 'Activate' })}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(indicator.id)}
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {indicators.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center text-muted-foreground">
              {t({ ar: 'لا توجد مؤشرات محملة', en: 'No indicators uploaded' })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
