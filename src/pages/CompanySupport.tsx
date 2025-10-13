import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building2, FileText, Mail, Phone, User } from "lucide-react";

export default function CompanySupport() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyNameAr: "",
    companyNameEn: "",
    commercialRegister: "",
    taxNumber: "",
    contactPerson: "",
    contactEmail: "",
    contactPhone: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      navigate('/auth?redirect=/company-support');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('company_requests')
        .insert({
          user_id: user.id,
          company_name_ar: formData.companyNameAr,
          company_name_en: formData.companyNameEn,
          commercial_register: formData.commercialRegister,
          tax_number: formData.taxNumber || null,
          contact_person: formData.contactPerson,
          contact_email: formData.contactEmail,
          contact_phone: formData.contactPhone,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: t({ ar: "تم إرسال الطلب", en: "Request Sent" }),
        description: t({ ar: "سيتم مراجعة طلبك قريباً", en: "Your request will be reviewed soon" }),
      });

      setFormData({
        companyNameAr: "",
        companyNameEn: "",
        commercialRegister: "",
        taxNumber: "",
        contactPerson: "",
        contactEmail: "",
        contactPhone: "",
      });
    } catch (error: any) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              {t({ ar: "دعم الشركات", en: "Company Support" })}
            </CardTitle>
            <CardDescription>
              {t({ ar: "تقديم طلب تسجيل شركة", en: "Submit Company Registration Request" })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyNameAr">
                  {t({ ar: "اسم الشركة (عربي)", en: "Company Name (Arabic)" })} *
                </Label>
                <Input
                  id="companyNameAr"
                  value={formData.companyNameAr}
                  onChange={(e) => setFormData({ ...formData, companyNameAr: e.target.value })}
                  required
                  placeholder={t({ ar: "أدخل اسم الشركة بالعربي", en: "Enter company name in Arabic" })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyNameEn">
                  {t({ ar: "اسم الشركة (إنجليزي)", en: "Company Name (English)" })} *
                </Label>
                <Input
                  id="companyNameEn"
                  value={formData.companyNameEn}
                  onChange={(e) => setFormData({ ...formData, companyNameEn: e.target.value })}
                  required
                  placeholder={t({ ar: "Enter company name in English", en: "Enter company name in English" })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="commercialRegister" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  {t({ ar: "رقم السجل التجاري", en: "Commercial Register" })} *
                </Label>
                <Input
                  id="commercialRegister"
                  value={formData.commercialRegister}
                  onChange={(e) => setFormData({ ...formData, commercialRegister: e.target.value })}
                  required
                  placeholder={t({ ar: "أدخل رقم السجل التجاري", en: "Enter commercial register number" })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxNumber">
                  {t({ ar: "الرقم الضريبي", en: "Tax Number" })}
                </Label>
                <Input
                  id="taxNumber"
                  value={formData.taxNumber}
                  onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                  placeholder={t({ ar: "أدخل الرقم الضريبي (اختياري)", en: "Enter tax number (optional)" })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPerson" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {t({ ar: "الشخص المسؤول", en: "Contact Person" })} *
                </Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  required
                  placeholder={t({ ar: "أدخل اسم الشخص المسؤول", en: "Enter contact person name" })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {t({ ar: "البريد الإلكتروني", en: "Email" })} *
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  required
                  placeholder="example@company.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {t({ ar: "رقم الجوال", en: "Phone Number" })} *
                </Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  required
                  placeholder="+966XXXXXXXXX"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading 
                  ? t({ ar: "جاري الإرسال...", en: "Sending..." })
                  : t({ ar: "إرسال الطلب", en: "Submit Request" })
                }
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}