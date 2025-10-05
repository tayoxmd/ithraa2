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

  const BigStatCard = ({ title, value, icon: Icon, gradient, change, chartData }: any) => (
    <Card className={`overflow-hidden hover-lift transition-all rounded-xl border-2 ${gradient}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${gradient.replace('border-', 'bg-').replace('from-', 'from-').replace('to-', 'to-')}`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          {change && (
            <div className={`flex items-center gap-1 text-sm font-medium px-3 py-1 rounded-full ${change >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
              {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-bold">{value}</h3>
        </div>
        {chartData && (
          <div className="mt-4 h-2 bg-muted rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${gradient.replace('border-', 'bg-gradient-to-r ')}`} style={{ width: `${chartData}%` }}></div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <Card className="card-luxury hover-lift transition-all rounded-md">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl lg:text-3xl font-bold">{value}</h3>
            </div>
          </div>
          <div className={`p-3 rounded-md ${colorClass}`}>
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
            <div className="lg:hidden grid grid-cols-2 gap-2 mb-6">
              <Button onClick={() => navigate('/audit-logs')} variant="outline" className="h-12 flex-col gap-1 rounded-md text-xs">
                <FileText className="w-4 h-4" />
                <span>{t({ ar: "سجل الأحداث", en: "Audit Logs" })}</span>
              </Button>
              <Button onClick={() => navigate('/manage-employees')} variant="outline" className="h-12 flex-col gap-1 rounded-md text-xs">
                <UserCog className="w-4 h-4" />
                <span>{t({ ar: "الموظفين", en: "Employees" })}</span>
              </Button>
              <Button onClick={() => navigate('/manage-hotels')} variant="outline" className="h-12 flex-col gap-1 rounded-md text-xs">
                <Hotel className="w-4 h-4" />
                <span>{t({ ar: "الفنادق", en: "Hotels" })}</span>
              </Button>
              <Button onClick={() => navigate('/site-settings')} variant="outline" className="h-12 flex-col gap-1 rounded-md text-xs">
                <Settings className="w-4 h-4" />
                <span>{t({ ar: "الإعدادات", en: "Settings" })}</span>
              </Button>
              <Button onClick={() => navigate('/pdf-settings')} variant="outline" className="h-12 flex-col gap-1 rounded-md text-xs">
                <FileText className="w-4 h-4" />
                <span>{t({ ar: "PDF", en: "PDF" })}</span>
              </Button>
              <Button onClick={() => navigate('/profile')} variant="outline" className="h-12 flex-col gap-1 rounded-md text-xs">
                <User className="w-4 h-4" />
                <span>{t({ ar: "الملف", en: "Profile" })}</span>
              </Button>
            </div>

            {/* Interactive Stats Dashboard - Mobile */}
            <div className="lg:hidden grid grid-cols-2 gap-3 mb-6">
              <Card className="rounded-md hover-lift transition-all bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center mb-2">
                    <DollarSign className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">{t({ ar: "الأرباح", en: "Profits" })}</p>
                  <p className="text-sm font-bold text-center">{stats.totalProfits.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="rounded-md hover-lift transition-all bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-purple-500 flex items-center justify-center mb-2">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">{t({ ar: "الطلبات", en: "Bookings" })}</p>
                  <p className="text-sm font-bold text-center">{stats.totalBookings.toLocaleString()}</p>
                </CardContent>
              </Card>
            </div>

            {/* Big Stats Dashboard - Desktop */}
            <div className="hidden lg:grid grid-cols-4 gap-6 mb-8">
              <BigStatCard
                title={t({ ar: 'إجمالي الأرباح', en: 'Total Revenue' })}
                value={`${stats.totalProfits.toLocaleString()} ${t({ ar: 'ر.س', en: 'SAR' })}`}
                icon={DollarSign}
                gradient="border-gradient-to-br from-emerald-400 to-emerald-600 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900"
                change={12.5}
                chartData={85}
              />
              <BigStatCard
                title={t({ ar: 'إجمالي الحجوزات', en: 'Total Bookings' })}
                value={stats.totalBookings.toLocaleString()}
                icon={FileText}
                gradient="border-gradient-to-br from-blue-400 to-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900"
                change={8.2}
                chartData={72}
              />
              <BigStatCard
                title={t({ ar: 'حجوزات معلقة', en: 'Pending Bookings' })}
                value={stats.pendingBookings}
                icon={Clock}
                gradient="border-gradient-to-br from-orange-400 to-orange-600 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900"
                change={-3.1}
                chartData={45}
              />
              <BigStatCard
                title={t({ ar: 'إجمالي العملاء', en: 'Total Customers' })}
                value={stats.totalCustomers}
                icon={Users}
                gradient="border-gradient-to-br from-purple-400 to-purple-600 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900"
                change={15.3}
                chartData={92}
              />
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

            {/* Task Manager - Bookings Table */}
            <Card className="card-luxury rounded-xl border-2">
              <CardHeader className="border-b bg-gradient-to-r from-primary/5 to-transparent">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    {t({ ar: "مدير المهام - الطلبات", en: "Task Manager - Bookings" })}
                  </CardTitle>
                  <Button variant="outline" size="sm" className="gap-2">
                    <FileText className="w-4 h-4" />
                    {t({ ar: 'عرض الكل', en: 'View All' })}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {loadingBookings ? (
                  <p className="text-muted-foreground text-center py-12">{t({ ar: "جاري التحميل...", en: "Loading..." })}</p>
                ) : bookings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-muted/30">
                        <tr>
                          <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {t({ ar: '#', en: '#' })}
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {t({ ar: 'رقم الطلب', en: 'Booking #' })}
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {t({ ar: 'العميل', en: 'Customer' })}
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {t({ ar: 'التاريخ', en: 'Date' })}
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {t({ ar: 'حالة الطلب', en: 'Status' })}
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            {t({ ar: 'حالة الدفع', en: 'Payment' })}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-background divide-y divide-border">
                        {bookings.slice(0, 10).map((booking, index) => (
                          <tr key={booking.id} className="hover:bg-muted/20 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-bold text-primary">#{booking.booking_number}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium">{booking.guest_name || booking.profiles?.full_name}</div>
                              <div className="text-xs text-muted-foreground">{booking.profiles?.phone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                              {new Date(booking.created_at).toLocaleDateString('ar-SA')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {booking.status === 'new' && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 dark:from-yellow-900 dark:to-yellow-800 dark:text-yellow-200 border border-yellow-300 dark:border-yellow-700">
                                  {t({ ar: 'جديد', en: 'New' })}
                                </span>
                              )}
                              {booking.status === 'pending' && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 dark:from-orange-900 dark:to-orange-800 dark:text-orange-200 border border-orange-300 dark:border-orange-700">
                                  {t({ ar: 'قيد المعالجة', en: 'Pending' })}
                                </span>
                              )}
                              {booking.status === 'confirmed' && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-800 dark:from-green-900 dark:to-green-800 dark:text-green-200 border border-green-300 dark:border-green-700">
                                  {t({ ar: 'مؤكد', en: 'Confirmed' })}
                                </span>
                              )}
                              {booking.status === 'cancelled' && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-100 to-red-200 text-red-800 dark:from-red-900 dark:to-red-800 dark:text-red-200 border border-red-300 dark:border-red-700">
                                  {t({ ar: 'ملغي', en: 'Cancelled' })}
                                </span>
                              )}
                              {booking.status === 'rejected' && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 dark:from-gray-900 dark:to-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-700">
                                  {t({ ar: 'مرفوض', en: 'Rejected' })}
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {booking.payment_status === 'paid' && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 dark:from-emerald-900 dark:to-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                                  {t({ ar: 'مدفوع', en: 'Paid' })}
                                </span>
                              )}
                              {booking.payment_status === 'partially_paid' && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 dark:from-blue-900 dark:to-blue-800 dark:text-blue-200 border border-blue-300 dark:border-blue-700">
                                  {t({ ar: 'دفع جزئي', en: 'Partial' })}
                                </span>
                              )}
                              {booking.payment_status === 'unpaid' && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-rose-100 to-rose-200 text-rose-800 dark:from-rose-900 dark:to-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-700">
                                  {t({ ar: 'غير مدفوع', en: 'Unpaid' })}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-12">{t({ ar: 'لا توجد طلبات', en: 'No bookings' })}</p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
