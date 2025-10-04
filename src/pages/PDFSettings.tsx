import { useState, useEffect } from "react";
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
import { FileText, Plus, Trash2 } from "lucide-react";
import { logAuditEvent } from "@/utils/auditLogger";

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
        setSettings({
          ...data,
          responsible_persons: (data.responsible_persons as unknown as ResponsiblePerson[]) || [],
          contact_numbers: (data.contact_numbers as unknown as string[]) || []
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

  if (loading || loadingSettings) {
    return <div className="min-h-screen flex items-center justify-center">{t({ ar: "جاري التحميل...", en: "Loading..." })}</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-24">
        <Card className="card-luxury">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <FileText className="w-6 h-6" />
              {t({ ar: "إعدادات ملف PDF", en: "PDF Settings" })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
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
            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={saving} className="btn-luxury">
                {saving ? t({ ar: "جاري الحفظ...", en: "Saving..." }) : t({ ar: "حفظ الإعدادات", en: "Save Settings" })}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
