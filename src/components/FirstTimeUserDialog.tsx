import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countries } from "@/data/countries";
import { Search } from "lucide-react";

interface FirstTimeUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  defaultPhone?: string;
}

export function FirstTimeUserDialog({ open, onOpenChange, userId, defaultPhone }: FirstTimeUserDialogProps) {
  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState("+966");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const selectedCountry = countries.find(c => c.dialCode === countryCode) || countries[0];
  const filteredCountries = countries.filter(country => 
    country.nameAr.includes(searchQuery) || 
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dialCode.includes(searchQuery)
  );

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: t({ ar: "الرجاء إدخال الاسم", en: "Please enter your name" }),
        variant: "destructive",
      });
      return;
    }

    if (!whatsappNumber.trim()) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: t({ ar: "الرجاء إدخال رقم واتساب", en: "Please enter WhatsApp number" }),
        variant: "destructive",
      });
      return;
    }

    if (whatsappNumber.length !== selectedCountry.maxLength) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: t({ 
          ar: `رقم واتساب يجب أن يكون ${selectedCountry.maxLength} أرقام`, 
          en: `WhatsApp number must be ${selectedCountry.maxLength} digits` 
        }),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const fullWhatsapp = `${countryCode}${whatsappNumber}`;
      
      // Update profile with name and WhatsApp
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          phone: fullWhatsapp
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: t({ ar: "تم الحفظ", en: "Saved" }),
        description: t({ ar: "تم حفظ معلوماتك بنجاح", en: "Your information has been saved successfully" }),
      });

      onOpenChange(false);
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t({ ar: "أكمل معلوماتك", en: "Complete Your Information" })}
          </DialogTitle>
          <DialogDescription>
            {t({ ar: "أدخل اسمك ورقم واتساب لإكمال التسجيل", en: "Enter your name and WhatsApp number to complete registration" })}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">{t({ ar: "الاسم الكامل", en: "Full Name" })}</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t({ ar: "أدخل اسمك الكامل", en: "Enter your full name" })}
            />
          </div>

          <div className="space-y-2">
            <Label>{t({ ar: "رقم واتساب", en: "WhatsApp Number" })}</Label>
            <div className="flex gap-2" dir="ltr">
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue>
                    {selectedCountry.dialCode}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2 sticky top-0 bg-background z-10">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder={t({ ar: "بحث...", en: "Search..." })}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  {filteredCountries.map((country) => (
                    <SelectItem key={country.code} value={country.dialCode}>
                      {country.dialCode} - {language === 'ar' ? country.nameAr : country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="tel"
                className="flex-1"
                value={whatsappNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= selectedCountry.maxLength) {
                    setWhatsappNumber(value);
                  }
                }}
                placeholder={selectedCountry.placeholder}
                maxLength={selectedCountry.maxLength}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t({ 
                ar: `يجب أن يكون ${selectedCountry.maxLength} رقم بدون الصفر`, 
                en: `Must be ${selectedCountry.maxLength} digits without leading zero` 
              })}
            </p>
          </div>

          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading ? t({ ar: "جاري الحفظ...", en: "Saving..." }) : t({ ar: "حفظ", en: "Save" })}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
