import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { countries } from "@/data/countries";
import { Search, UserCircle, Apple, Chrome } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BookingAuthDialogProps {
  open: boolean;
  onClose: () => void;
  onGuestContinue: (phone: string, countryCode: string) => void;
}

export function BookingAuthDialog({ open, onClose, onGuestContinue }: BookingAuthDialogProps) {
  const { t, language } = useLanguage();
  const { signIn } = useAuth();
  const [mode, setMode] = useState<'main' | 'guest' | 'login' | 'signup'>('main');
  const [countryCode, setCountryCode] = useState('+966');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const selectedCountry = countries.find(c => c.dialCode === countryCode) || countries[0];

  const filteredCountries = countries.filter(country => 
    country.nameAr.includes(searchQuery) || 
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.dialCode.includes(searchQuery)
  );

  const validatePhoneNumber = (number: string) => {
    if (number.startsWith('0')) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: t({ ar: "الرجاء إدخال الرقم بدون الصفر في البداية", en: "Please enter the number without leading zero" }),
        variant: "destructive",
      });
      return false;
    }
    
    if (number.length !== selectedCountry.maxLength) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: t({ 
          ar: `رقم الهاتف يجب أن يكون ${selectedCountry.maxLength} أرقام`, 
          en: `Phone number must be ${selectedCountry.maxLength} digits` 
        }),
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleGuestSubmit = () => {
    if (!phoneNumber.trim()) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: t({ ar: "الرجاء إدخال رقم الهاتف", en: "Please enter phone number" }),
        variant: "destructive",
      });
      return;
    }

    if (validatePhoneNumber(phoneNumber)) {
      const fullPhone = `${countryCode}${phoneNumber}`;
      onGuestContinue(fullPhone, countryCode);
      onClose();
    }
  };

  const handleAppleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/booking`,
      }
    });
    
    if (error) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/booking`,
      }
    });
    
    if (error) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: t({ ar: "الرجاء ملء جميع الحقول", en: "Please fill all fields" }),
        variant: "destructive",
      });
      return;
    }

    const { error } = await signIn(email, password);
    if (error) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message,
        variant: "destructive",
      });
    } else {
      onClose();
    }
  };

  const handleSignup = async () => {
    if (!email || !password || !fullName || !phone) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: t({ ar: "الرجاء ملء جميع الحقول", en: "Please fill all fields" }),
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          full_name: fullName,
          phone: phone
        }
      }
    });

    if (error) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t({ ar: "تم بنجاح", en: "Success" }),
        description: t({ ar: "تم إنشاء الحساب بنجاح", en: "Account created successfully" }),
      });
      setMode('login');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            {mode === 'main' && t({ ar: "اختر طريقة المتابعة", en: "Choose how to continue" })}
            {mode === 'guest' && t({ ar: "الاستمرار كضيف", en: "Continue as Guest" })}
            {mode === 'login' && t({ ar: "تسجيل الدخول", en: "Login" })}
            {mode === 'signup' && t({ ar: "إنشاء حساب جديد", en: "Sign Up" })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {mode === 'main' && (
            <>
              <Button
                variant="outline"
                className="w-full h-14 text-lg gap-3"
                onClick={() => setMode('guest')}
              >
                <UserCircle className="w-6 h-6" />
                {t({ ar: "الاستمرار كضيف", en: "Continue as Guest" })}
              </Button>

              <Button
                variant="outline"
                className="w-full h-14 text-lg gap-3"
                onClick={handleAppleSignIn}
              >
                <Apple className="w-6 h-6" />
                {t({ ar: "الدخول عبر Apple", en: "Sign in with Apple" })}
              </Button>

              <Button
                variant="outline"
                className="w-full h-14 text-lg gap-3"
                onClick={handleGoogleSignIn}
              >
                <Chrome className="w-6 h-6" />
                {t({ ar: "الدخول عبر Google", en: "Sign in with Google" })}
              </Button>

              <Button
                variant="outline"
                className="w-full h-14 text-lg"
                onClick={() => setMode('login')}
              >
                {t({ ar: "تسجيل الدخول", en: "Login" })}
              </Button>

              <Button
                variant="default"
                className="w-full h-14 text-lg"
                onClick={() => setMode('signup')}
              >
                {t({ ar: "إنشاء حساب جديد", en: "Sign Up" })}
              </Button>
            </>
          )}

          {mode === 'guest' && (
            <>
              <div className="space-y-2">
                <Label>{t({ ar: "كود الدولة", en: "Country Code" })}</Label>
                <Select value={countryCode} onValueChange={setCountryCode}>
                  <SelectTrigger>
                    <SelectValue>
                      {selectedCountry.dialCode} - {language === 'ar' ? selectedCountry.nameAr : selectedCountry.name}
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
              </div>

              <div className="space-y-2">
                <Label>{t({ ar: "رقم الهاتف", en: "Phone Number" })}</Label>
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    if (value.length <= selectedCountry.maxLength) {
                      setPhoneNumber(value);
                    }
                  }}
                  placeholder={selectedCountry.placeholder}
                  maxLength={selectedCountry.maxLength}
                  dir="ltr"
                />
                <p className="text-xs text-muted-foreground">
                  {t({ 
                    ar: `يجب أن يكون ${selectedCountry.maxLength} رقم بدون الصفر`, 
                    en: `Must be ${selectedCountry.maxLength} digits without leading zero` 
                  })}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setMode('main')} className="flex-1">
                  {t({ ar: "رجوع", en: "Back" })}
                </Button>
                <Button onClick={handleGuestSubmit} className="flex-1">
                  {t({ ar: "متابعة", en: "Continue" })}
                </Button>
              </div>
            </>
          )}

          {mode === 'login' && (
            <>
              <div className="space-y-2">
                <Label>{t({ ar: "البريد الإلكتروني", en: "Email" })}</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label>{t({ ar: "كلمة المرور", en: "Password" })}</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setMode('main')} className="flex-1">
                  {t({ ar: "رجوع", en: "Back" })}
                </Button>
                <Button onClick={handleLogin} className="flex-1">
                  {t({ ar: "دخول", en: "Login" })}
                </Button>
              </div>
            </>
          )}

          {mode === 'signup' && (
            <>
              <div className="space-y-2">
                <Label>{t({ ar: "الاسم الكامل", en: "Full Name" })}</Label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t({ ar: "أدخل اسمك الكامل", en: "Enter your full name" })}
                />
              </div>

              <div className="space-y-2">
                <Label>{t({ ar: "رقم الجوال", en: "Phone" })}</Label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+966 5XX XXX XXX"
                />
              </div>

              <div className="space-y-2">
                <Label>{t({ ar: "البريد الإلكتروني", en: "Email" })}</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label>{t({ ar: "كلمة المرور", en: "Password" })}</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setMode('main')} className="flex-1">
                  {t({ ar: "رجوع", en: "Back" })}
                </Button>
                <Button onClick={handleSignup} className="flex-1">
                  {t({ ar: "تسجيل", en: "Sign Up" })}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
