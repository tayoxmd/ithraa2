import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import logo from "@/assets/logo.jpg";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut, userRole } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (userRole === 'admin') return '/admin';
    if (userRole === 'employee') return '/employee';
    return '/dashboard';
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border shadow-elegant">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="ITHRAA Logo" 
              className="w-12 h-12 object-contain"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gradient-luxury">
                {t('إثراء', 'ITHRAA')}
              </span>
              <span className="text-xs text-muted-foreground tracking-wider">
                {language === 'ar' ? 'ITHRAA' : 'إثراء'}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium">
              {t('الرئيسية', 'Home')}
            </Link>
            <a href="/#hotels" className="text-foreground hover:text-primary transition-colors font-medium">
              {t('الفنادق', 'Hotels')}
            </a>
            <a href="/#offers" className="text-foreground hover:text-primary transition-colors font-medium">
              {t('العروض', 'Offers')}
            </a>
            <a href="/#about" className="text-foreground hover:text-primary transition-colors font-medium">
              {t('من نحن', 'About')}
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="hidden sm:block">
              <LanguageSelector />
            </div>

            {user ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex gap-2"
                  onClick={() => navigate(getDashboardPath())}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {t('لوحة التحكم', 'Dashboard')}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex gap-2"
                  onClick={() => signOut()}
                >
                  <LogOut className="w-4 h-4" />
                  {t('تسجيل الخروج', 'Sign Out')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex"
                  onClick={() => navigate('/auth')}
                >
                  {t('تسجيل الدخول', 'Sign In')}
                </Button>

                <Button
                  size="sm"
                  className="btn-luxury hidden sm:inline-flex"
                  onClick={() => navigate('/auth')}
                >
                  {t('سجل الآن', 'Sign Up')}
                </Button>
              </>
            )}

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
              <div className="mb-4">
                <LanguageSelector />
              </div>
              <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium py-2">
                {t('الرئيسية', 'Home')}
              </Link>
              <a href="/#hotels" className="text-foreground hover:text-primary transition-colors font-medium py-2">
                {t('الفنادق', 'Hotels')}
              </a>
              <a href="/#offers" className="text-foreground hover:text-primary transition-colors font-medium py-2">
                {t('العروض', 'Offers')}
              </a>
              <a href="/#about" className="text-foreground hover:text-primary transition-colors font-medium py-2">
                {t('من نحن', 'About')}
              </a>
              {user ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="justify-start gap-2"
                    onClick={() => navigate(getDashboardPath())}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {t('لوحة التحكم', 'Dashboard')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="justify-start gap-2"
                    onClick={() => signOut()}
                  >
                    <LogOut className="w-4 h-4" />
                    {t('تسجيل الخروج', 'Sign Out')}
                  </Button>
                </>
              ) : (
                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate('/auth')}
                  >
                    {t('تسجيل الدخول', 'Sign In')}
                  </Button>
                  <Button 
                    size="sm" 
                    className="btn-luxury flex-1"
                    onClick={() => navigate('/auth')}
                  >
                    {t('سجل الآن', 'Sign Up')}
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
