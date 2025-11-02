import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Download, FileText, Database, Calendar, Filter, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { exportEmailsToCSV, exportEmailsToJSON } from '@/utils/emailExport';
import type { Email } from '@/types/email';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export function EmailImportExport() {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [exportFilter, setExportFilter] = useState({
    status: '' as '' | 'inbox' | 'sent' | 'draft' | 'trash' | 'spam',
    dateFrom: '',
    dateTo: '',
    bookingStatus: '' as '' | 'confirmed' | 'paid' | 'all',
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setIsExporting(true);
      let query = supabase.from('emails').select('*');

      // تطبيق الفلاتر
      if (exportFilter.status) {
        query = query.eq('status', exportFilter.status);
      }
      if (exportFilter.dateFrom) {
        query = query.gte('created_at', exportFilter.dateFrom);
      }
      if (exportFilter.dateTo) {
        query = query.lte('created_at', exportFilter.dateTo);
      }
      if (exportFilter.bookingStatus && exportFilter.bookingStatus !== 'all') {
        // ربط مع جدول bookings إذا لزم الأمر
        // query = query.eq('bookings.status', exportFilter.bookingStatus);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (format === 'csv') {
        exportEmailsToCSV(data as Email[]);
      } else {
        exportEmailsToJSON(data as Email[]);
      }

      toast.success(
        t({
          ar: `تم تصدير ${data?.length || 0} بريد`,
          en: `Exported ${data?.length || 0} email(s)`,
        })
      );
    } catch (error) {
      console.error('Export error:', error);
      toast.error(
        t({
          ar: 'خطأ في التصدير',
          en: 'Export error',
        })
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error(
        t({
          ar: 'يرجى اختيار ملف',
          en: 'Please select a file',
        })
      );
      return;
    }

    try {
      setIsImporting(true);
      const text = await importFile.text();
      const emails = JSON.parse(text) as Email[];

      // التحقق من صحة البيانات
      if (!Array.isArray(emails)) {
        throw new Error('Invalid file format');
      }

      if (emails.length === 0) {
        throw new Error('File is empty');
      }

      // التحقق من البنية الأساسية للبريد
      const validEmails = emails.filter(email => 
        email.subject && email.from_email && email.to_email && email.body
      );

      if (validEmails.length === 0) {
        throw new Error('No valid emails found in file');
      }

      // إدراج البريد بشكل مجمع
      const batchSize = 100;
      let imported = 0;
      
      for (let i = 0; i < validEmails.length; i += batchSize) {
        const batch = validEmails.slice(i, i + batchSize);
        const { error } = await supabase.from('emails').insert(batch);
        
        if (error) {
          console.error('Batch import error:', error);
          throw error;
        }
        
        imported += batch.length;
      }

      toast.success(
        t({
          ar: `تم استيراد ${imported} بريد بنجاح`,
          en: `Successfully imported ${imported} email(s)`,
        })
      );

      setImportFile(null);
      // إعادة تحميل الصفحة لتحديث البيانات
      window.location.reload();
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(
        t({
          ar: `خطأ في الاستيراد: ${error.message || 'خطأ غير معروف'}`,
          en: `Import error: ${error.message || 'Unknown error'}`,
        })
      );
    } finally {
      setIsImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            {t({ ar: 'تصدير البريد', en: 'Export Emails' })}
          </CardTitle>
          <CardDescription>
            {t({
              ar: 'تصدير البريد حسب الفلاتر المحددة',
              en: 'Export emails based on selected filters',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                {t({ ar: 'حالة البريد', en: 'Email Status' })}
              </Label>
              <Select
                value={exportFilter.status}
                onValueChange={(value: any) =>
                  setExportFilter({ ...exportFilter, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t({ ar: 'الكل', en: 'All' })} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t({ ar: 'الكل', en: 'All' })}</SelectItem>
                  <SelectItem value="inbox">{t({ ar: 'وارد', en: 'Inbox' })}</SelectItem>
                  <SelectItem value="sent">{t({ ar: 'مرسل', en: 'Sent' })}</SelectItem>
                  <SelectItem value="draft">{t({ ar: 'مسودات', en: 'Drafts' })}</SelectItem>
                  <SelectItem value="trash">{t({ ar: 'مهملات', en: 'Trash' })}</SelectItem>
                  <SelectItem value="spam">{t({ ar: 'جنك', en: 'Spam' })}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t({ ar: 'من تاريخ', en: 'From Date' })}
              </Label>
              <Input
                type="date"
                value={exportFilter.dateFrom}
                onChange={(e) =>
                  setExportFilter({ ...exportFilter, dateFrom: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {t({ ar: 'إلى تاريخ', en: 'To Date' })}
              </Label>
              <Input
                type="date"
                value={exportFilter.dateTo}
                onChange={(e) =>
                  setExportFilter({ ...exportFilter, dateTo: e.target.value })
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              {t({ ar: 'حالة الحجز', en: 'Booking Status' })}
            </Label>
            <Select
              value={exportFilter.bookingStatus}
              onValueChange={(value: any) =>
                setExportFilter({ ...exportFilter, bookingStatus: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t({ ar: 'الكل', en: 'All' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ ar: 'الكل', en: 'All' })}</SelectItem>
                <SelectItem value="confirmed">{t({ ar: 'مؤكد', en: 'Confirmed' })}</SelectItem>
                <SelectItem value="paid">{t({ ar: 'مدفوع', en: 'Paid' })}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => handleExport('csv')}
              disabled={isExporting}
              className="flex-1"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              {isExporting 
                ? t({ ar: 'جاري التصدير...', en: 'Exporting...' })
                : t({ ar: 'تصدير CSV', en: 'Export CSV' })
              }
            </Button>
            <Button
              onClick={() => handleExport('json')}
              disabled={isExporting}
              variant="outline"
              className="flex-1"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              {isExporting 
                ? t({ ar: 'جاري التصدير...', en: 'Exporting...' })
                : t({ ar: 'تصدير JSON', en: 'Export JSON' })
              }
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            {t({ ar: 'استيراد البريد', en: 'Import Emails' })}
          </CardTitle>
          <CardDescription>
            {t({
              ar: 'استيراد البريد من ملف JSON',
              en: 'Import emails from JSON file',
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t({ ar: 'اختر الملف', en: 'Select File' })}</Label>
            <Input
              type="file"
              accept=".json"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            />
            <p className="text-xs text-muted-foreground">
              {t({
                ar: 'يدعم ملفات JSON فقط',
                en: 'JSON files only',
              })}
            </p>
          </div>
          <Button onClick={handleImport} disabled={!importFile || isImporting} className="w-full">
            {isImporting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {isImporting 
              ? t({ ar: 'جاري الاستيراد...', en: 'Importing...' })
              : t({ ar: 'استيراد', en: 'Import' })
            }
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

