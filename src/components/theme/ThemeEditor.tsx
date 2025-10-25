import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Save } from 'lucide-react';

interface ThemeEditorProps {
  onClose: () => void;
}

export default function ThemeEditor({ onClose }: ThemeEditorProps) {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [themeName, setThemeName] = useState('');

  const handleSave = async () => {
    toast({
      title: t({ ar: 'قريباً', en: 'Coming Soon' }),
      description: t({ ar: 'محرر الثيمات قيد التطوير', en: 'Theme editor is under development' }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>{t({ ar: 'اسم الثيم', en: 'Theme Name' })}</Label>
        <Input
          value={themeName}
          onChange={(e) => setThemeName(e.target.value)}
          placeholder={t({ ar: 'أدخل اسم الثيم', en: 'Enter theme name' })}
        />
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={handleSave} className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          {t({ ar: 'حفظ', en: 'Save' })}
        </Button>
        <Button variant="outline" onClick={onClose}>
          {t({ ar: 'إلغاء', en: 'Cancel' })}
        </Button>
      </div>
    </div>
  );
}
