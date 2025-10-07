import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useIsMobile } from "@/hooks/use-mobile";
import logo from "@/assets/logo.svg";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut, userRole } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobileOrTablet = useIsMobile() || (typeof window !== 'undefined' && window.innerWidth <= 1024);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getDashboardPath = () => {
    if (userRole === 'admin') return '/admin';
    if (userRole === 'employee') return '/employee';
    return '/dashboard';
  };

  return (
    <>
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
            <div className="flex items-center gap-2">
              {/* Language Selector - Always visible, scaled down on mobile */}
              <div className="scale-75 sm:scale-90 md:scale-100">
                <LanguageSelector />
              </div>

              {user ? (
                <>
                  <div className="hidden sm:flex items-center gap-2">
                    {(userRole === 'admin' || userRole === 'employee') && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        style={{ backgroundColor: '#237bff', color: 'white', borderColor: '#237bff' }}
                        onClick={() => navigate(getDashboardPath())}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        {t('الإدارة', 'Management')}
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => navigate('/dashboard')}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      {t({ ar: "الحجوزات ولوحة التحكم", en: "Bookings & Dashboard" })}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => signOut()}
                    >
                      <LogOut className="w-4 h-4" />
                      {t('تسجيل الخروج', 'Sign Out')}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="hidden sm:inline-flex"
                    onClick={() => navigate('/auth?mode=login')}
                  >
                    {t('تسجيل الدخول', 'Sign In')}
                  </Button>

                  <Button
                    size="sm"
                    className="btn-luxury hidden sm:inline-flex"
                    onClick={() => navigate('/auth?mode=signup')}
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
                {/* Language Selector for Mobile - placed at top */}
                <div className="pb-2 border-b border-border">
                  <LanguageSelector />
                </div>

                {user && (
                  <div className="grid grid-cols-2 gap-2 pb-2 border-b border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start gap-2"
                      onClick={() => navigate('/customer-dashboard')}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      {t({ ar: "الحجوزات", en: "Bookings" })}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="justify-start gap-2"
                      onClick={() => navigate('/dashboard')}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      {t({ ar: "لوحة التحكم", en: "Dashboard" })}
                    </Button>
                  </div>
                )}
                
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
                    {(userRole === 'admin' || userRole === 'employee') && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="justify-start gap-2"
                        style={{ backgroundColor: '#237bff', color: 'white', borderColor: '#237bff' }}
                        onClick={() => navigate(getDashboardPath())}
                      >
                        <LayoutDashboard className="w-4 h-4" />
                        {t('الإدارة', 'Management')}
                      </Button>
                    )}
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
                      onClick={() => navigate('/auth?mode=login')}
                    >
                      {t('تسجيل الدخول', 'Sign In')}
                    </Button>
                    <Button 
                      size="sm" 
                      className="btn-luxury flex-1"
                      onClick={() => navigate('/auth?mode=signup')}
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

      {/* Fixed Booking Button for Mobile/Tablet - Only show for logged in users and not in dashboard pages */}
      {user && isMobileOrTablet && 
       !location.pathname.includes('/dashboard') && 
       !location.pathname.includes('/admin') && 
       !location.pathname.includes('/employee') && (
        <div 
          className={`fixed ${isScrolled ? 'top-24' : 'top-20'} ${language === 'ar' ? 'right-2' : 'left-2'} z-40 transition-all duration-300 lg:hidden scale-75`}
        >
          <Button
            onClick={() => navigate('/dashboard')}
            size="sm"
            className="h-7 px-2 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-lg hover:shadow-xl transition-all text-xs"
          >
            <LayoutDashboard className="w-3 h-3 ml-1" />
            {t({ ar: "الحجوزات", en: "Bookings" })}
          </Button>
        </div>
      )}
    </>
  );
}
