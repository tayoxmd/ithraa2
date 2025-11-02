import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type Language = "ar" | "en" | "fr" | "es" | "ru" | "id" | "ms" | "sw";

type TranslationObject = {
  ar: string;
  en: string;
  fr: string;
  es: string;
  ru: string;
  id: string;
  ms: string;
  sw: string;
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (translations: Partial<TranslationObject> | string, en?: string) => string;
  getHotelName: (nameAr: string, nameEn: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const languageNames: Record<Language, string> = {
  ar: "العربية",
  en: "English",
  fr: "Français",
  es: "Español",
  ru: "Русский",
  id: "Bahasa Indonesia",
  ms: "Bahasa Melayu",
  sw: "Kiswahili",
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("ar");

  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language;
    // تحميل اللغة المحفوظة إذا كانت صحيحة، وإلا استخدم العربية كافتراضية
    if (savedLang && languages.includes(savedLang)) {
      setLanguage(savedLang);
    } else {
      setLanguage("ar");
      localStorage.setItem("language", "ar");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = (translations: Partial<TranslationObject> | string, en?: string): string => {
    if (typeof translations === "string") {
      // Old format: t('ar text', 'en text')
      // للصيغة القديمة، إذا كانت اللغة غير العربية، استخدم الإنجليزية
      if (language === "ar") {
        return translations;
      } else {
        return en || translations;
      }
    }
    // New format: t({ ar: 'ar text', en: 'en text', fr: 'fr text', ... })
    // محاولة إرجاع الترجمة للغة المحددة
    if (translations[language]) {
      return translations[language];
    }
    // إذا لم تكن موجودة، جرب الإنجليزية
    if (translations.en) {
      return translations.en;
    }
    // إذا لم تكن موجودة، جرب العربية
    if (translations.ar) {
      return translations.ar;
    }
    // إذا لم تكن موجودة، جرب السواحلية
    if (translations.sw) {
      return translations.sw;
    }
    // في النهاية، جرب أي لغة متاحة
    const availableLanguages = Object.keys(translations) as Language[];
    if (availableLanguages.length > 0) {
      return translations[availableLanguages[0]] || "";
    }
    return "";
  };

  // دالة للحصول على اسم الفندق - تبقى بالإنجليزية عند اختيار أي لغة غير العربية
  const getHotelName = (nameAr: string, nameEn: string): string => {
    return language === "ar" ? nameAr : nameEn;
  };

  return <LanguageContext.Provider value={{ language, setLanguage, t, getHotelName }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export const languages: Language[] = ["ar", "en", "fr", "es", "ru", "id", "ms", "sw"];
export { languageNames };
export type { Language };
