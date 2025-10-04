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
  LayoutDashboard,
  BarChart3,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { playNotificationSound } from "@/utils/notificationSound";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
    profitsChange: 0,
    bookingsChange: 0,
  });
  
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

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
      // Fetch all bookings with dates
      const { data: allBookings } = await supabase
        .from('bookings')
        .select('total_amount, status, payment_status, amount_paid, created_at');

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

      // Calculate monthly revenue for chart (last 6 months)
      const monthlyRevenue: any = {};
      const now = new Date();
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toISOString().slice(0, 7);
        monthlyRevenue[monthKey] = 0;
      }

      bookingsArray.forEach(booking => {
        if (booking.payment_status === 'paid' && booking.created_at) {
          const monthKey = booking.created_at.slice(0, 7);
          if (monthlyRevenue[monthKey] !== undefined) {
            monthlyRevenue[monthKey] += parseFloat(booking.total_amount?.toString() || '0');
          }
        }
      });

      const chartData = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
        month: new Date(month + '-01').toLocaleDateString('ar-SA', { month: 'short' }),
        revenue: Math.round(revenue as number)
      }));

      setMonthlyData(chartData);

      // Calculate changes (mock data for now - in production, compare with previous period)
      const profitsChange = 8.5;
      const bookingsChange = 12.3;

      setStats({
        totalProfits: Math.round(totalProfits),
        awaitingPayment: Math.round(awaitingPayment),
        unpaidBookings: Math.round(unpaidBookings),
        totalBookings: Math.round(totalBookingsAmount),
        totalSales: Math.round(totalSales),
        cancelledLosses: Math.round(cancelledLosses),
        pendingBookings,
        totalCustomers,
        profitsChange,
        bookingsChange,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">{t({ ar: "جاري التحميل...", en: "Loading..." })}</div>;
  }

  const BigStatCard = ({ title, value, subtitle, icon: Icon, change, colorClass }: any) => (
    <Card className="hover-lift transition-all border-0 shadow-lg rounded-xl">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-3">
              <h2 className="text-4xl font-bold">{value}</h2>
              {change !== undefined && (
                <span className={`text-sm font-semibold flex items-center gap-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {Math.abs(change)}%
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={`p-4 rounded-xl ${colorClass}`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const NavItem = ({ icon: Icon, label, onClick }: any) => (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full px-4 py-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-xl text-gray-900 dark:text-white">{t({ ar: "إثراء", en: "ITHRAA" })}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t({ ar: "مرحباً، مدير النظام", en: "Welcome, Admin" })}</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-1">
            <button
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium transition-colors"
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>{t({ ar: "لوحة التحكم", en: "Dashboard" })}</span>
            </button>
            <NavItem 
              icon={Hotel} 
              label={t({ ar: "الفنادق", en: "Hotels" })}
              onClick={() => navigate('/manage-hotels')}
            />
            <NavItem 
              icon={FileText} 
              label={t({ ar: "الحجوزات", en: "Bookings" })}
              onClick={() => navigate('/')}
            />
            <NavItem 
              icon={Users} 
              label={t({ ar: "العملاء", en: "Customers" })}
              onClick={() => navigate('/')}
            />
            <NavItem 
              icon={UserCog} 
              label={t({ ar: "الموظفين", en: "Employees" })}
              onClick={() => navigate('/manage-employees')}
            />
            <NavItem 
              icon={DollarSign} 
              label={t({ ar: "المالية", en: "Finance" })}
              onClick={() => navigate('/')}
            />
            <NavItem 
              icon={BarChart3} 
              label={t({ ar: "الإحصائيات", en: "Statistics" })}
              onClick={() => navigate('/audit-logs')}
            />
            <NavItem 
              icon={Settings} 
              label={t({ ar: "الإعدادات", en: "Settings" })}
              onClick={() => navigate('/site-settings')}
            />
          </nav>
          
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <NavItem 
              icon={User} 
              label={t({ ar: "الملف الشخصي", en: "Profile" })}
              onClick={() => navigate('/profile')}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-6 lg:p-8 pt-24 lg:pt-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {t({ ar: "لوحة تحكم إثراء", en: "ITHRAA Dashboard" })}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  {t({ ar: "مرحباً، مدير النظام", en: "Welcome, Admin" })} | 
                  <span className="text-sm">{t({ ar: "آخر مزامنة:", en: "Last sync:" })} {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                </p>
              </div>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <DollarSign className="w-4 h-4 ml-2" />
                {t({ ar: "إضافة معاملة", en: "Add Transaction" })}
              </Button>
            </div>

            {/* Big Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <BigStatCard
                title={t({ ar: "الإيرادات الشهرية", en: "Monthly Revenue" })}
                value={`${stats.totalProfits.toLocaleString()} ${t({ ar: "ر.س", en: "SAR" })}`}
                subtitle={t({ ar: "إجمالي الأرباح المحصلة", en: "Total collected profits" })}
                icon={DollarSign}
                change={stats.profitsChange}
                colorClass="bg-gradient-to-br from-green-500 to-green-600"
              />
              <div className="grid grid-cols-2 gap-4">
                <Card className="hover-lift transition-all border-0 shadow-lg rounded-xl bg-green-50 dark:bg-green-900/20">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t({ ar: "الحجوزات", en: "Bookings" })}</p>
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.pendingBookings}</h3>
                      <p className="text-xs text-green-600 dark:text-green-400">{t({ ar: "قيد الانتظار", en: "Pending" })}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="hover-lift transition-all border-0 shadow-lg rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{t({ ar: "العملاء", en: "Customers" })}</p>
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stats.totalCustomers}</h3>
                      <p className="text-xs text-gray-500">{t({ ar: "إجمالي", en: "Total" })}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="hover-lift transition-all border-0 shadow-lg rounded-xl bg-amber-50 dark:bg-amber-900/20 col-span-2">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{t({ ar: "في الانتظار", en: "Awaiting" })}</p>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stats.awaitingPayment.toLocaleString()} {t({ ar: "ر.س", en: "SAR" })}</h3>
                      </div>
                      <AlertCircle className="w-8 h-8 text-amber-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
              <BigStatCard
                title={t({ ar: "إجمالي الحجوزات", en: "Total Bookings" })}
                value={stats.totalBookings.toLocaleString()}
                subtitle={t({ ar: "جميع الحجوزات النشطة", en: "All active bookings" })}
                icon={FileText}
                change={stats.bookingsChange}
                colorClass="bg-gradient-to-br from-blue-500 to-blue-600"
              />
            </div>

            {/* Chart and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Revenue Chart */}
              <Card className="lg:col-span-2 border-0 shadow-lg rounded-xl">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{t({ ar: "الإيرادات الشهرية", en: "Monthly Revenue" })}</span>
                    <div className="flex gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-gray-600 dark:text-gray-400">2024</span>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="month" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Status Summary */}
              <Card className="border-0 shadow-lg rounded-xl">
                <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                  <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                    {t({ ar: "ملخص الحالة", en: "Status Summary" })}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{t({ ar: "مؤكد", en: "Confirmed" })}</p>
                        <p className="text-xs text-gray-500">{t({ ar: "الحجوزات المؤكدة", en: "Confirmed bookings" })}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-green-600">{Math.floor(stats.totalCustomers * 0.7)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-amber-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{t({ ar: "قيد الانتظار", en: "Pending" })}</p>
                        <p className="text-xs text-gray-500">{t({ ar: "تحتاج مراجعة", en: "Needs review" })}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-amber-600">{stats.pendingBookings}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{t({ ar: "ملغاة", en: "Cancelled" })}</p>
                        <p className="text-xs text-gray-500">{t({ ar: "خسائر محتملة", en: "Potential losses" })}</p>
                      </div>
                    </div>
                    <span className="text-lg font-bold text-red-600">{Math.floor(stats.cancelledLosses / 1000)}</span>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white mt-4">
                    {t({ ar: "عرض التفاصيل", en: "View Details" })}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Bookings Table */}
            <Card className="border-0 shadow-lg rounded-xl">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{t({ ar: "الحجوزات الأخيرة", en: "Recent Bookings" })}</span>
                  </div>
                  <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50">
                    {t({ ar: "عرض الكل", en: "View All" })}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {loadingBookings ? (
                  <p className="text-gray-500 text-center py-8">{t({ ar: "جاري التحميل...", en: "Loading..." })}</p>
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
