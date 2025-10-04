import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingManagement } from "@/components/BookingManagement";
import { Button } from "@/components/ui/button";
import { 
  DollarSign, 
  FileText, 
  Clock, 
  Users, 
  UserCog, 
  Hotel,
  TrendingUp,
  TrendingDown,
  Settings,
  User,
  Home,
  LayoutDashboard
} from "lucide-react";
import { playNotificationSound } from "@/utils/notificationSound";

export default function AdminDashboard() {
  const { userRole, loading, user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [stats, setStats] = useState({
    totalProfits: 0,
    awaitingPayment: 0,
    unpaidBookings: 0,
    totalBookings: 0,
    totalSales: 0,
    cancelledLosses: 0,
    pendingBookings: 0,
    totalCustomers: 0,
  });

  useEffect(() => {
    if (!loading) {
      if (userRole !== 'admin') {
        navigate('/');
      } else {
        fetchBookings();
        fetchStats();
        
        const channel = supabase
          .channel('admin-bookings')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'bookings'
            },
            (payload) => {
              console.log('New booking received:', payload);
              playNotificationSound();
              fetchBookings();
              fetchStats();
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    }
  }, [userRole, loading, navigate]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles:user_id (full_name, phone),
          hotels:hotel_id (name_ar, name_en, location, price_per_night, max_guests_per_room, extra_guest_price)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch all bookings
      const { data: allBookings } = await supabase
        .from('bookings')
        .select('total_amount, status, payment_status, amount_paid');

      const bookingsArray = allBookings || [];

      // Calculate statistics
      const totalProfits = bookingsArray
        .filter(b => b.payment_status === 'paid')
        .reduce((sum, b) => sum + (parseFloat(b.total_amount?.toString() || '0')), 0);

      const awaitingPayment = bookingsArray
        .filter(b => b.payment_status === 'partially_paid')
        .reduce((sum, b) => sum + (parseFloat(b.total_amount?.toString() || '0') - parseFloat(b.amount_paid?.toString() || '0')), 0);

      const unpaidBookings = bookingsArray
        .filter(b => b.payment_status === 'unpaid' && b.status !== 'cancelled' && b.status !== 'rejected')
        .reduce((sum, b) => sum + (parseFloat(b.total_amount?.toString() || '0')), 0);

      const totalBookingsAmount = bookingsArray
        .filter(b => b.status !== 'cancelled' && b.status !== 'rejected')
        .reduce((sum, b) => sum + (parseFloat(b.total_amount?.toString() || '0')), 0);

      const totalSales = bookingsArray
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + (parseFloat(b.total_amount?.toString() || '0')), 0);

      const cancelledLosses = bookingsArray
        .filter(b => b.status === 'cancelled' || b.status === 'rejected')
        .reduce((sum, b) => sum + (parseFloat(b.total_amount?.toString() || '0')), 0);

      // Pending bookings count
      const { count: newCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');

      const { count: pendingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      const pendingBookings = (newCount || 0) + (pendingCount || 0);

      // Total customers
      const { data: customerRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'customer');

      const totalCustomers = customerRoles?.length || 0;

      setStats({
        totalProfits: Math.round(totalProfits),
        awaitingPayment: Math.round(awaitingPayment),
        unpaidBookings: Math.round(unpaidBookings),
        totalBookings: Math.round(totalBookingsAmount),
        totalSales: Math.round(totalSales),
        cancelledLosses: Math.round(cancelledLosses),
        pendingBookings,
        totalCustomers,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">{t({ ar: "جاري التحميل...", en: "Loading..." })}</div>;
  }

  const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <Card className="card-luxury hover-lift transition-all">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl lg:text-3xl font-bold">{value}</h3>
            </div>
          </div>
          <div className={`p-3 rounded-xl ${colorClass}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const NavItem = ({ icon: Icon, label, onClick }: any) => (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-primary/10 transition-colors text-right"
    >
      <Icon className="w-5 h-5 text-primary" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-card border-l border-border shadow-xl">
          <div className="p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-lg">{t({ ar: "إثراء", en: "ITHRAA" })}</h2>
                <p className="text-xs text-muted-foreground">{t({ ar: "لوحة التحكم", en: "Dashboard" })}</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <NavItem 
              icon={Home} 
              label={t({ ar: "الرئيسية", en: "Home" })}
              onClick={() => navigate('/')}
            />
            <NavItem 
              icon={UserCog} 
              label={t({ ar: "إدارة الموظفين", en: "Manage Employees" })}
              onClick={() => navigate('/manage-employees')}
            />
            <NavItem 
              icon={Hotel} 
              label={t({ ar: "إدارة الفنادق", en: "Manage Hotels" })}
              onClick={() => navigate('/manage-hotels')}
            />
            <NavItem 
              icon={FileText} 
              label={t({ ar: "سجل الأحداث", en: "Audit Logs" })}
              onClick={() => navigate('/audit-logs')}
            />
            <NavItem 
              icon={Settings} 
              label={t({ ar: "إعدادات الموقع", en: "Site Settings" })}
              onClick={() => navigate('/site-settings')}
            />
            <NavItem 
              icon={FileText} 
              label={t({ ar: "إعدادات PDF", en: "PDF Settings" })}
              onClick={() => navigate('/pdf-settings')}
            />
            <NavItem 
              icon={User} 
              label={t({ ar: "الملف الشخصي", en: "Profile" })}
              onClick={() => navigate('/profile')}
            />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8 pt-24 lg:pt-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2 text-gradient-luxury">
                {t({ ar: "مرحباً بك في لوحة التحكم", en: "Welcome to Dashboard" })}
              </h1>
              <p className="text-muted-foreground">
                {t({ ar: "نظرة عامة على أداء نظامك", en: "Overview of your system performance" })}
              </p>
            </div>

            {/* Quick Actions - Mobile Only */}
            <div className="lg:hidden grid grid-cols-2 gap-3 mb-6">
              <Button onClick={() => navigate('/audit-logs')} variant="outline" className="h-20 flex-col gap-2">
                <FileText className="w-5 h-5" />
                <span className="text-xs">{t({ ar: "سجل الأحداث", en: "Audit Logs" })}</span>
              </Button>
              <Button onClick={() => navigate('/manage-employees')} variant="outline" className="h-20 flex-col gap-2">
                <UserCog className="w-5 h-5" />
                <span className="text-xs">{t({ ar: "الموظفين", en: "Employees" })}</span>
              </Button>
              <Button onClick={() => navigate('/manage-hotels')} variant="outline" className="h-20 flex-col gap-2">
                <Hotel className="w-5 h-5" />
                <span className="text-xs">{t({ ar: "الفنادق", en: "Hotels" })}</span>
              </Button>
              <Button onClick={() => navigate('/site-settings')} variant="outline" className="h-20 flex-col gap-2">
                <Settings className="w-5 h-5" />
                <span className="text-xs">{t({ ar: "الإعدادات", en: "Settings" })}</span>
              </Button>
              <Button onClick={() => navigate('/profile')} variant="outline" className="h-20 flex-col gap-2">
                <User className="w-5 h-5" />
                <span className="text-xs">{t({ ar: "الملف الشخصي", en: "Profile" })}</span>
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
              <StatCard
                title={t({ ar: "إجمالي الأرباح", en: "Total Profits" })}
                value={`${stats.totalProfits.toLocaleString()} ${t({ ar: "ر.س", en: "SAR" })}`}
                icon={DollarSign}
                colorClass="bg-gradient-to-br from-amber-500 to-amber-600"
              />
              <StatCard
                title={t({ ar: "أموال في انتظار الدفع", en: "Awaiting Payment" })}
                value={`${stats.awaitingPayment.toLocaleString()} ${t({ ar: "ر.س", en: "SAR" })}`}
                icon={Clock}
                colorClass="bg-gradient-to-br from-slate-500 to-slate-600"
              />
              <StatCard
                title={t({ ar: "طلبات غير مدفوعة", en: "Unpaid Bookings" })}
                value={`${stats.unpaidBookings.toLocaleString()} ${t({ ar: "ر.س", en: "SAR" })}`}
                icon={FileText}
                colorClass="bg-gradient-to-br from-gray-900 to-gray-800"
              />
              <StatCard
                title={t({ ar: "إجمالي الطلبات", en: "Total Bookings" })}
                value={`${stats.totalBookings.toLocaleString()} ${t({ ar: "ر.س", en: "SAR" })}`}
                icon={TrendingUp}
                colorClass="bg-gradient-to-br from-purple-500 to-purple-600"
              />
              <StatCard
                title={t({ ar: "إجمالي المبيعات", en: "Total Sales" })}
                value={`${stats.totalSales.toLocaleString()} ${t({ ar: "ر.س", en: "SAR" })}`}
                icon={DollarSign}
                colorClass="bg-gradient-to-br from-green-500 to-green-600"
              />
              <StatCard
                title={t({ ar: "خسائر الطلبات الملغاة", en: "Cancelled Losses" })}
                value={`${stats.cancelledLosses.toLocaleString()} ${t({ ar: "ر.س", en: "SAR" })}`}
                icon={TrendingDown}
                colorClass="bg-gradient-to-br from-red-500 to-red-600"
              />
              <StatCard
                title={t({ ar: "قيد الانتظار", en: "Pending" })}
                value={stats.pendingBookings}
                icon={Clock}
                colorClass="bg-gradient-to-br from-orange-500 to-orange-600"
              />
              <StatCard
                title={t({ ar: "عدد العملاء", en: "Customers" })}
                value={stats.totalCustomers}
                icon={Users}
                colorClass="bg-gradient-to-br from-blue-500 to-blue-600"
              />
            </div>

            {/* Recent Bookings */}
            <Card className="card-luxury">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {t({ ar: "الطلبات الأخيرة", en: "Recent Bookings" })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingBookings ? (
                  <p className="text-muted-foreground text-center py-8">{t({ ar: "جاري التحميل...", en: "Loading..." })}</p>
                ) : (
                  <BookingManagement bookings={bookings} onUpdate={fetchBookings} />
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
