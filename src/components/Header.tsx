import { Button } from "@/components/ui/button";
import { Globe, Menu, X } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const languages = [
  { code: "ar", name: "العربية", dir: "rtl" },
  { code: "en", name: "English", dir: "ltr" },
  { code: "id", name: "Bahasa Indonesia", dir: "ltr" },
  { code: "fr", name: "Français", dir: "ltr" },
  { code: "es", name: "Español", dir: "ltr" },
  { code: "ru", name: "Русский", dir: "ltr" },
  { code: "ms", name: "Bahasa Melayu", dir: "ltr" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(languages[0]);

  const handleLanguageChange = (lang: typeof languages[0]) => {
    setCurrentLang(lang);
    document.documentElement.setAttribute("dir", lang.dir);
    document.documentElement.setAttribute("lang", lang.code);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-elegant">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-luxury flex items-center justify-center shadow-luxury">
              <span className="text-2xl font-bold text-white">إ</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gradient-luxury">إثراء</span>
              <span className="text-xs text-muted-foreground tracking-wider">ITHRAA</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-foreground hover:text-primary transition-colors font-medium">
              الرئيسية
            </a>
            <a href="#hotels" className="text-foreground hover:text-primary transition-colors font-medium">
              الفنادق
            </a>
            <a href="#offers" className="text-foreground hover:text-primary transition-colors font-medium">
              العروض
            </a>
            <a href="#about" className="text-foreground hover:text-primary transition-colors font-medium">
              من نحن
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">{currentLang.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {languages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang)}
                    className={currentLang.code === lang.code ? "bg-accent" : ""}
                  >
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              تسجيل الدخول
            </Button>

            <Button size="sm" className="btn-luxury hidden sm:inline-flex">
              سجل الآن
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="outline"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <nav className="flex flex-col gap-4">
              <a href="#" className="text-foreground hover:text-primary transition-colors font-medium py-2">
                الرئيسية
              </a>
              <a href="#hotels" className="text-foreground hover:text-primary transition-colors font-medium py-2">
                الفنادق
              </a>
              <a href="#offers" className="text-foreground hover:text-primary transition-colors font-medium py-2">
                العروض
              </a>
              <a href="#about" className="text-foreground hover:text-primary transition-colors font-medium py-2">
                من نحن
              </a>
              <div className="flex gap-2 pt-2 border-t border-border">
                <Button variant="outline" size="sm" className="flex-1">
                  تسجيل الدخول
                </Button>
                <Button size="sm" className="btn-luxury flex-1">
                  سجل الآن
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
