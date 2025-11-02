import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Languages, Paperclip, Reply, Forward } from 'lucide-react';
import type { Email } from '@/types/email';
import { exportEmailToPDF } from '@/utils/emailExport';
import { translateEmailContent } from '@/utils/emailTranslation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EmailDetailDialogProps {
  email: Email | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEmailUpdated?: () => void;
}

export function EmailDetailDialog({
  email,
  open,
  onOpenChange,
  onEmailUpdated,
}: EmailDetailDialogProps) {
  const { t, language } = useLanguage();
  const [translatedContent, setTranslatedContent] = useState<{
    subject: string;
    body: string;
    from_name: string;
    to_name: string;
  } | null>(null);
  const [translationLanguage, setTranslationLanguage] = useState<'ar' | 'en' | 'fr' | 'es' | 'de'>(
    language === 'ar' ? 'ar' : 'en'
  );
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (email && open) {
      setTranslatedContent(null);
    }
  }, [email, open]);

  const handleTranslate = async () => {
    if (!email || isTranslating) return;

    setIsTranslating(true);
    try {
      const translated = await translateEmailContent(
        {
          subject: email.subject,
          body: email.body,
          from_name: email.from_name,
          to_name: email.to_name,
        },
        translationLanguage
      );
      setTranslatedContent(translated);
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleExportPDF = async () => {
    if (!email) return;
    await exportEmailToPDF(email);
  };

  if (!email) return null;

  const displayContent = translatedContent || {
    subject: email.subject,
    body: email.body,
    from_name: email.from_name,
    to_name: email.to_name,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex-1">{displayContent.subject}</DialogTitle>
            <div className="flex items-center gap-2">
              {/* Export Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    {t({ ar: 'تصدير', en: 'Export' })}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={handleExportPDF}>
                    <FileText className="w-4 h-4 mr-2" />
                    {t({ ar: 'تصدير PDF', en: 'Export PDF' })}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Translation */}
              <div className="flex items-center gap-2">
                <Select
                  value={translationLanguage}
                  onValueChange={(value: any) => setTranslationLanguage(value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTranslate}
                  disabled={isTranslating}
                >
                  <Languages className="w-4 h-4 mr-2" />
                  {isTranslating
                    ? t({ ar: 'جاري الترجمة...', en: 'Translating...' })
                    : t({ ar: 'ترجمة', en: 'Translate' })}
                </Button>
              </div>
            </div>
          </div>
          <DialogDescription>
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm">
                  <strong>{t({ ar: 'من:', en: 'From:' })}</strong> {displayContent.from_name} &lt;
                  {email.from_email}&gt;
                </span>
                <span className="text-sm">
                  <strong>{t({ ar: 'إلى:', en: 'To:' })}</strong> {displayContent.to_name} &lt;
                  {email.to_email}&gt;
                </span>
                <span className="text-sm">
                  <strong>{t({ ar: 'التاريخ:', en: 'Date:' })}</strong>{' '}
                  {new Date(email.created_at).toLocaleString()}
                </span>
                {email.priority && (
                  <Badge
                    variant={
                      email.priority === 'high'
                        ? 'destructive'
                        : email.priority === 'low'
                        ? 'secondary'
                        : 'default'
                    }
                  >
                    {email.priority === 'high'
                      ? t({ ar: 'عاجل', en: 'High' })
                      : email.priority === 'low'
                      ? t({ ar: 'منخفضة', en: 'Low' })
                      : t({ ar: 'عادية', en: 'Normal' })}
                  </Badge>
                )}
              </div>
              {email.attachments && email.attachments.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      {t({ ar: `المرفقات (${email.attachments.length})`, en: `Attachments (${email.attachments.length})` })}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {email.attachments.map((attachment, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // يمكن إضافة منطق تنزيل المرفق هنا
                          window.open(attachment, '_blank');
                        }}
                        className="flex items-center gap-2"
                      >
                        <Paperclip className="w-3 h-3" />
                        <span className="text-xs">
                          {typeof attachment === 'string' ? attachment.split('/').pop() : `Attachment ${index + 1}`}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="prose max-w-none">
            <div
              dangerouslySetInnerHTML={{
                __html: email.body_html || displayContent.body.replace(/\n/g, '<br>'),
              }}
            />
          </div>

          <div className="flex items-center gap-2 pt-4 border-t">
            <Button variant="outline" size="sm">
              <Reply className="w-4 h-4 mr-2" />
              {t({ ar: 'رد', en: 'Reply' })}
            </Button>
            <Button variant="outline" size="sm">
              <Forward className="w-4 h-4 mr-2" />
              {t({ ar: 'إعادة توجيه', en: 'Forward' })}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

