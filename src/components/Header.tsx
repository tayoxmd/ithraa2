import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, LayoutDashboard, Hotel, Users, Settings, Tag, Gift, Calendar, FileText, MessageSquare, DollarSign, Briefcase } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { NotificationBell } from "./NotificationBell";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useIsMobile } from "@/hooks/use-mobile";
import logo from "@/assets/logo.svg";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, signOut, userRole } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobileOrTablet = useIsMobile() || (typeof window !== 'undefined' && window.innerWidth <= 1024);

  const adminMenuItems = [
    { icon: Hotel, label: t({ ar: 'إدارة الفنادق', en: 'Manage Hotels' }), path: '/manage-hotels' },
    { icon: Users, label: t({ ar: 'إدارة الموظفين', en: 'Manage Employees' }), path: '/manage-employees' },
    { icon: MessageSquare, label: t({ ar: 'الدردشة المباشرة', en: 'Live Chat' }), path: '/live-chat' },
    { icon: Tag, label: t({ ar: 'الكوبونات', en: 'Coupons' }), path: '/coupons' },
    { icon: Gift, label: t({ ar: 'العروض الخاصة', en: 'Special Offers' }), path: '/special-offers' },
    { icon: Calendar, label: t({ ar: 'الأسعار الموسمية', en: 'Seasonal Pricing' }), path: '/seasonal-pricing' },
    { icon: Briefcase, label: t({ ar: 'برنامج الولاء', en: 'Loyalty Program' }), path: '/loyalty-program' },
    { icon: Settings, label: t({ ar: 'إعدادات الموقع', en: 'Site Settings' }), path: '/site-settings' },
    { icon: DollarSign, label: t({ ar: 'إعدادات API', en: 'API Settings' }), path: '/api-settings' },
    { icon: FileText, label: t({ ar: 'إعدادات PDF', en: 'PDF Settings' }), path: '/pdf-settings' },
    { icon: FileText, label: t({ ar: 'سجل التدقيق', en: 'Audit Logs' }), path: '/audit-logs' },
  ];

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
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/40 backdrop-blur-lg border-b border-border/30 shadow-elegant">
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
              
              {/* Notification Bell */}
              <NotificationBell />

              {user ? (
                <>
                  <div className="hidden lg:flex items-center gap-2">
                    {(userRole === 'admin' || userRole === 'employee') && (
                      <>
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
                      </>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => navigate('/customer-dashboard')}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      {t({ ar: "الحجوزات", en: "Bookings" })}
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
                  
                  {/* Mobile/Tablet Quick Actions - Outside Menu */}
                  <div className="lg:hidden flex items-center gap-1">
                    {(userRole === 'admin' || userRole === 'employee') && (
                      <Sheet open={adminMenuOpen} onOpenChange={setAdminMenuOpen}>
                        <SheetTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs gap-1"
                            style={{ backgroundColor: '#237bff', color: 'white', borderColor: '#237bff' }}
                          >
                            <Settings className="w-3 h-3" />
                            {t({ ar: "إدارة الموقع", en: "Management" })}
                          </Button>
                        </SheetTrigger>
                        <SheetContent side={language === 'ar' ? 'right' : 'left'} className="w-[280px] sm:w-[320px]">
                          <SheetHeader>
                            <SheetTitle>{t({ ar: 'إدارة الموقع', en: 'Site Management' })}</SheetTitle>
                          </SheetHeader>
                          <div className="mt-6 space-y-2">
                            {adminMenuItems.map((item) => (
                              <Button
                                key={item.path}
                                variant="ghost"
                                className="w-full justify-start gap-3"
                                onClick={() => {
                                  navigate(item.path);
                                  setAdminMenuOpen(false);
                                }}
                              >
                                <item.icon className="w-4 h-4" />
                                {item.label}
                              </Button>
                            ))}
                          </div>
                        </SheetContent>
                      </Sheet>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-xs"
                      onClick={() => navigate('/customer-dashboard')}
                    >
                      {t({ ar: "الحجوزات", en: "Bookings" })}
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
                className="lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 animate-fade-in">
              <nav className="flex flex-col gap-4">
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
                      onClick={() => navigate('/dashboard')}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      {t({ ar: "لوحة التحكم", en: "Dashboard" })}
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

    </>
  );
}
