import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { FileText, Plus, Trash2, Eye, RefreshCw } from "lucide-react";
import { logAuditEvent } from "@/utils/auditLogger";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { generateBookingPDF } from "@/utils/pdfGenerator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ResponsiblePerson {
  name: string;
  email: string;
  phone: string;
  position: string;
}

interface PDFSettings {
  id?: string;
  company_logo_url?: string;
  company_description_ar?: string;
  company_description_en?: string;
  terms_ar?: string;
  terms_en?: string;
  cancellation_policy_ar?: string;
  cancellation_policy_en?: string;
  bank_name?: string;
  bank_account_number?: string;
  iban?: string;
  bank_location?: string;
  responsible_persons?: ResponsiblePerson[];
  contact_numbers?: string[];
}

export default function PDFSettings() {
  const { userRole, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<PDFSettings>({
    responsible_persons: [],
    contact_numbers: []
  });
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!loading) {
      if (userRole !== 'admin') {
        navigate('/');
        return;
      }
      fetchSettings();
    }
  }, [userRole, loading, navigate]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('pdf_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        // Parse JSON strings from database
        const parseJsonField = (field: any, defaultValue: any) => {
          if (!field) return defaultValue;
          if (typeof field === 'string') {
            try {
              return JSON.parse(field);
            } catch {
              return defaultValue;
            }
          }
          return Array.isArray(field) ? field : defaultValue;
        };

        setSettings({
          ...data,
          responsible_persons: parseJsonField(data.responsible_persons, []),
          contact_numbers: parseJsonField(data.contact_numbers, [])
        });
      }
    } catch (error) {
      console.error('Error fetching PDF settings:', error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { id, ...settingsData } = settings;
      
      // Convert arrays to JSON
      const dataToSave = {
        ...settingsData,
        responsible_persons: JSON.stringify(settingsData.responsible_persons || []),
        contact_numbers: JSON.stringify(settingsData.contact_numbers || [])
      };

      if (id) {
        const { error } = await supabase
          .from('pdf_settings')
          .update(dataToSave as any)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('pdf_settings')
          .insert([dataToSave as any]);

        if (error) throw error;
      }

      await logAuditEvent('UPDATE', 'pdf_settings', id, { settings: settingsData });

      toast({
        title: t({ ar: "تم الحفظ بنجاح", en: "Saved Successfully" }),
        description: t({ ar: "تم حفظ إعدادات PDF بنجاح", en: "PDF settings saved successfully" }),
      });

      fetchSettings();
    } catch (error) {
      console.error('Error saving PDF settings:', error);
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: t({ ar: "حدث خطأ أثناء الحفظ", en: "An error occurred while saving" }),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const addResponsiblePerson = () => {
    setSettings({
      ...settings,
      responsible_persons: [
        ...(settings.responsible_persons || []),
        { name: '', email: '', phone: '', position: 'Reservation' }
      ]
    });
  };

  const removeResponsiblePerson = (index: number) => {
    const persons = [...(settings.responsible_persons || [])];
    persons.splice(index, 1);
    setSettings({ ...settings, responsible_persons: persons });
  };

  const updateResponsiblePerson = (index: number, field: keyof ResponsiblePerson, value: string) => {
    const persons = [...(settings.responsible_persons || [])];
    persons[index] = { ...persons[index], [field]: value };
    setSettings({ ...settings, responsible_persons: persons });
  };

  const addContactNumber = () => {
    setSettings({
      ...settings,
      contact_numbers: [...(settings.contact_numbers || []), '']
    });
  };

  const removeContactNumber = (index: number) => {
    const numbers = [...(settings.contact_numbers || [])];
    numbers.splice(index, 1);
    setSettings({ ...settings, contact_numbers: numbers });
  };

  const updateContactNumber = (index: number, value: string) => {
    const numbers = [...(settings.contact_numbers || [])];
    numbers[index] = value;
    setSettings({ ...settings, contact_numbers: numbers });
  };

  const generatePreview = () => {
    try {
      // Create sample booking data for preview
      const sampleData = {
        bookingNumber: 12345,
        hotelConfirmationNumber: "HTL-2024-001",
        guestName: settings.responsible_persons?.[0]?.name || "John Doe",
        clientName: "Sample Client",
        clientEmail: settings.responsible_persons?.[0]?.email || "client@example.com",
        clientPhone: settings.contact_numbers?.[0] || "+966501234567",
        hotelNameEn: "Sample Hotel",
        hotelNameAr: "فندق نموذجي",
        hotelLocation: "Riyadh, Saudi Arabia",
        hotelLocationUrl: "https://maps.google.com",
        checkIn: new Date(),
        checkOut: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        nights: 3,
        rooms: 2,
        guests: 4,
        baseGuests: 4,
        extraGuests: 0,
        roomType: "Standard",
        pricePerNight: 500,
        subtotal: 3000,
        extraGuestCharge: 0,
        discountAmount: 0,
        netAmount: 3000,
        vatAmount: 450,
        totalAmount: 3450,
        paymentMethod: "Bank Transfer",
        notes: "Sample booking for preview",
        confirmedBy: settings.responsible_persons?.[0] || {
          name: "Reservation Department",
          email: "reservations@example.com",
          phone: "+966501234567",
          position: "Reservation"
        },
        customerPageUrl: window.location.origin + "/customer-dashboard"
      };

      const pdf = generateBookingPDF(sampleData);
      const pdfBlob = pdf.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      setPreviewUrl(url);
      setShowPreview(true);
      
      toast({
        title: t({ ar: "تم إنشاء المعاينة", en: "Preview Generated" }),
        description: t({ ar: "يمكنك الآن مشاهدة نموذج PDF", en: "You can now view the PDF preview" }),
      });
    } catch (error) {
      console.error('Error generating preview:', error);
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: t({ ar: "حدث خطأ أثناء إنشاء المعاينة", en: "An error occurred while generating preview" }),
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (loading || loadingSettings) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="w-8 h-8" />
            {t({ ar: "إعدادات ملف PDF", en: "PDF Settings" })}
          </h1>
          <Button
            onClick={generatePreview}
            variant="outline"
            className="flex items-center gap-2"
          >
            {showPreview ? <RefreshCw className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {t({ ar: showPreview ? "تحديث المعاينة" : "معاينة PDF", en: showPreview ? "Refresh Preview" : "Preview PDF" })}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settings Form */}
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle className="text-xl">
                {t({ ar: "تعديل الإعدادات", en: "Edit Settings" })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-280px)] pr-4">
                <div className="space-y-8">
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t({ ar: "معلومات الشركة", en: "Company Information" })}</h3>
              
              <div>
                <Label>{t({ ar: "رابط شعار الشركة", en: "Company Logo URL" })}</Label>
                <Input
                  value={settings.company_logo_url || ''}
                  onChange={(e) => setSettings({ ...settings, company_logo_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              <div>
                <Label>{t({ ar: "وصف الشركة (عربي)", en: "Company Description (Arabic)" })}</Label>
                <Textarea
                  value={settings.company_description_ar || ''}
                  onChange={(e) => setSettings({ ...settings, company_description_ar: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <Label>{t({ ar: "وصف الشركة (إنجليزي)", en: "Company Description (English)" })}</Label>
                <Textarea
                  value={settings.company_description_en || ''}
                  onChange={(e) => setSettings({ ...settings, company_description_en: e.target.value })}
                  rows={2}
                />
              </div>
            </div>

            {/* Bank Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t({ ar: "تفاصيل البنك", en: "Bank Details" })}</h3>
              
              <div>
                <Label>{t({ ar: "اسم البنك", en: "Bank Name" })}</Label>
                <Input
                  value={settings.bank_name || ''}
                  onChange={(e) => setSettings({ ...settings, bank_name: e.target.value })}
                />
              </div>

              <div>
                <Label>{t({ ar: "رقم الحساب", en: "Account Number" })}</Label>
                <Input
                  value={settings.bank_account_number || ''}
                  onChange={(e) => setSettings({ ...settings, bank_account_number: e.target.value })}
                />
              </div>

              <div>
                <Label>{t({ ar: "رقم الآيبان", en: "IBAN" })}</Label>
                <Input
                  value={settings.iban || ''}
                  onChange={(e) => setSettings({ ...settings, iban: e.target.value })}
                />
              </div>

              <div>
                <Label>{t({ ar: "موقع البنك", en: "Bank Location" })}</Label>
                <Input
                  value={settings.bank_location || ''}
                  onChange={(e) => setSettings({ ...settings, bank_location: e.target.value })}
                />
              </div>
            </div>

            {/* Terms & Conditions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t({ ar: "الشروط والأحكام", en: "Terms & Conditions" })}</h3>
              
              <div>
                <Label>{t({ ar: "الشروط (عربي)", en: "Terms (Arabic)" })}</Label>
                <Textarea
                  value={settings.terms_ar || ''}
                  onChange={(e) => setSettings({ ...settings, terms_ar: e.target.value })}
                  rows={4}
                />
              </div>

              <div>
                <Label>{t({ ar: "الشروط (إنجليزي)", en: "Terms (English)" })}</Label>
                <Textarea
                  value={settings.terms_en || ''}
                  onChange={(e) => setSettings({ ...settings, terms_en: e.target.value })}
                  rows={4}
                />
              </div>
            </div>

            {/* Cancellation Policy */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{t({ ar: "سياسة الإلغاء", en: "Cancellation Policy" })}</h3>
              
              <div>
                <Label>{t({ ar: "سياسة الإلغاء (عربي)", en: "Cancellation Policy (Arabic)" })}</Label>
                <Textarea
                  value={settings.cancellation_policy_ar || ''}
                  onChange={(e) => setSettings({ ...settings, cancellation_policy_ar: e.target.value })}
                  rows={4}
                />
              </div>

              <div>
                <Label>{t({ ar: "سياسة الإلغاء (إنجليزي)", en: "Cancellation Policy (English)" })}</Label>
                <Textarea
                  value={settings.cancellation_policy_en || ''}
                  onChange={(e) => setSettings({ ...settings, cancellation_policy_en: e.target.value })}
                  rows={4}
                />
              </div>
            </div>

            {/* Responsible Persons */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t({ ar: "الأشخاص المسؤولين", en: "Responsible Persons" })}</h3>
                <Button onClick={addResponsiblePerson} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  {t({ ar: "إضافة شخص", en: "Add Person" })}
                </Button>
              </div>

              {settings.responsible_persons?.map((person, index) => (
                <Card key={index} className="p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">{t({ ar: "شخص", en: "Person" })} {index + 1}</h4>
                    <Button
                      onClick={() => removeResponsiblePerson(index)}
                      size="sm"
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>{t({ ar: "الاسم", en: "Name" })}</Label>
                      <Input
                        value={person.name}
                        onChange={(e) => updateResponsiblePerson(index, 'name', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>{t({ ar: "البريد الإلكتروني", en: "Email" })}</Label>
                      <Input
                        type="email"
                        value={person.email}
                        onChange={(e) => updateResponsiblePerson(index, 'email', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>{t({ ar: "رقم الجوال", en: "Phone" })}</Label>
                      <Input
                        value={person.phone}
                        onChange={(e) => updateResponsiblePerson(index, 'phone', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>{t({ ar: "المسمى الوظيفي", en: "Position" })}</Label>
                      <Input
                        value={person.position}
                        onChange={(e) => updateResponsiblePerson(index, 'position', e.target.value)}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Contact Numbers */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t({ ar: "أرقام التواصل", en: "Contact Numbers" })}</h3>
                <Button onClick={addContactNumber} size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  {t({ ar: "إضافة رقم", en: "Add Number" })}
                </Button>
              </div>

              {settings.contact_numbers?.map((number, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={number}
                    onChange={(e) => updateContactNumber(index, e.target.value)}
                    placeholder="+966..."
                  />
                  <Button
                    onClick={() => removeContactNumber(index)}
                    size="icon"
                    variant="destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-4">
                    <Button onClick={handleSave} disabled={saving} className="btn-luxury w-full">
                      {saving ? <LoadingSpinner size="sm" /> : t({ ar: "حفظ الإعدادات", en: "Save Settings" })}
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* PDF Preview */}
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Eye className="w-5 h-5" />
                {t({ ar: "معاينة PDF", en: "PDF Preview" })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {showPreview && previewUrl ? (
                <div className="h-[calc(100vh-280px)] border rounded-lg overflow-hidden bg-gray-100">
                  <iframe
                    ref={iframeRef}
                    src={previewUrl}
                    className="w-full h-full"
                    title="PDF Preview"
                  />
                </div>
              ) : (
                <div className="h-[calc(100vh-280px)] border rounded-lg flex items-center justify-center bg-muted/30">
                  <div className="text-center space-y-4">
                    <FileText className="w-16 h-16 mx-auto text-muted-foreground/50" />
                    <div>
                      <p className="text-lg font-medium text-muted-foreground">
                        {t({ ar: "لا توجد معاينة", en: "No Preview" })}
                      </p>
                      <p className="text-sm text-muted-foreground/70">
                        {t({ 
                          ar: "اضغط على زر 'معاينة PDF' لإنشاء نموذج", 
                          en: "Click 'Preview PDF' to generate a sample" 
                        })}
                      </p>
                    </div>
                    <Button onClick={generatePreview} variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      {t({ ar: "إنشاء المعاينة", en: "Generate Preview" })}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
