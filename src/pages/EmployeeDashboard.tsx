import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingManagement } from "@/components/BookingManagement";
import { playNotificationSound } from "@/utils/notificationSound";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Clock, 
  CheckCircle,
  TrendingUp,
  TrendingDown,
  User,
  Home,
  LayoutDashboard,
  AlertCircle,
  XCircle
} from "lucide-react";

export default function EmployeeDashboard() {
  const { userRole, loading, user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [stats, setStats] = useState({
    totalAssigned: 0,
    pending: 0,
    confirmed: 0,
    pendingChange: 0
  });

  useEffect(() => {
    if (!loading) {
      if (userRole !== 'employee') {
        navigate('/');
      } else {
        fetchBookings();
        
        const channel = supabase
          .channel('employee-bookings')
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
        .limit(20);

      if (error) throw error;
      setBookings(data || []);
      
      // Calculate stats
      const pending = data?.filter(b => b.status === 'new' || b.status === 'pending').length || 0;
      const confirmed = data?.filter(b => b.status === 'confirmed').length || 0;
      
      setStats({
        totalAssigned: data?.length || 0,
        pending,
        confirmed,
        pendingChange: 5.2
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoadingBookings(false);
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
              {change !== undefined && change !== 0 && (
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
                <p className="text-sm text-gray-500 dark:text-gray-400">{t({ ar: "مرحباً، موظف", en: "Welcome, Employee" })}</p>
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
              icon={FileText} 
              label={t({ ar: "الحجوزات", en: "Bookings" })}
              onClick={() => navigate('/')}
            />
            <NavItem 
              icon={Home} 
              label={t({ ar: "الرئيسية", en: "Home" })}
              onClick={() => navigate('/')}
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
                  {t({ ar: "لوحة تحكم الموظف", en: "Employee Dashboard" })}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  {t({ ar: "إدارة الحجوزات المسندة", en: "Manage assigned bookings" })} | 
                  <span className="text-sm">{t({ ar: "آخر تحديث:", en: "Last update:" })} {new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                </p>
              </div>
            </div>

            {/* Big Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <BigStatCard
                title={t({ ar: "الحجوزات المسندة", en: "Assigned Bookings" })}
                value={stats.totalAssigned}
                subtitle={t({ ar: "إجمالي المهام المخصصة", en: "Total assigned tasks" })}
                icon={FileText}
                colorClass="bg-gradient-to-br from-blue-500 to-blue-600"
              />
              <BigStatCard
                title={t({ ar: "قيد الانتظار", en: "Pending" })}
                value={stats.pending}
                subtitle={t({ ar: "تحتاج إلى معالجة", en: "Needs processing" })}
                icon={Clock}
                change={stats.pendingChange}
                colorClass="bg-gradient-to-br from-amber-500 to-amber-600"
              />
              <BigStatCard
                title={t({ ar: "تم التأكيد", en: "Confirmed" })}
                value={stats.confirmed}
                subtitle={t({ ar: "الحجوزات المؤكدة", en: "Confirmed bookings" })}
                icon={CheckCircle}
                colorClass="bg-gradient-to-br from-green-500 to-green-600"
              />
            </div>

            {/* Status Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-0 shadow-lg rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t({ ar: "معدل الإنجاز", en: "Completion Rate" })}</p>
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white">87%</h3>
                    </div>
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </div>
                  <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full w-[87%] bg-green-500 rounded-full"></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t({ ar: "التنبيهات", en: "Alerts" })}</p>
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pending}</h3>
                    </div>
                    <AlertCircle className="w-12 h-12 text-amber-500" />
                  </div>
                  <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">{t({ ar: "يتطلب انتباهك", en: "Requires attention" })}</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg rounded-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t({ ar: "وقت الاستجابة", en: "Response Time" })}</p>
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white">1.5 {t({ ar: "س", en: "h" })}</h3>
                    </div>
                    <Clock className="w-12 h-12 text-blue-500" />
                  </div>
                  <p className="mt-4 text-sm text-blue-600 dark:text-blue-400">{t({ ar: "متوسط الوقت", en: "Average time" })}</p>
                </CardContent>
              </Card>
            </div>

            {/* Bookings Table */}
            <Card className="border-0 shadow-lg rounded-xl">
              <CardHeader className="border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{t({ ar: "الحجوزات المسندة إليك", en: "Your Assigned Bookings" })}</span>
                  </div>
                  <Button variant="outline" size="sm" className="text-green-600 border-green-600 hover:bg-green-50">
                    {t({ ar: "تصدير", en: "Export" })}
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