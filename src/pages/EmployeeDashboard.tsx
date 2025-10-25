import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingManagement } from "@/components/BookingManagement";
import { playNotificationSound } from "@/utils/notificationSound";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { 
  FileText, 
  Clock, 
  CheckCircle,
  TrendingUp,
  TrendingDown,
  User,
  Home,
  LayoutDashboard,
  ListTodo
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
      if (userRole !== 'staff') {
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
          hotels:hotel_id (name_ar, name_en, location, location_url, price_per_night, max_guests_per_room, extra_guest_price, tax_percentage, room_type)
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
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  const StatCard = ({ title, value, icon: Icon, change, colorClass }: any) => (
    <Card className="card-luxury hover-lift transition-all rounded-md">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-bold">{value}</h3>
              {change !== undefined && change !== 0 && (
                <div className={`flex items-center text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {change >= 0 ? <TrendingUp className="w-4 h-4 ml-1" /> : <TrendingDown className="w-4 h-4 ml-1" />}
                  <span>{Math.abs(change)}%</span>
                </div>
              )}
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
                <p className="text-xs text-muted-foreground">{t({ ar: "لوحة الموظف", en: "Employee Panel" })}</p>
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
              icon={ListTodo} 
              label={t({ ar: "إدارة المهام", en: "Task Manager" })}
              onClick={() => navigate('/task-manager')}
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
                {t({ ar: "لوحة تحكم الموظف", en: "Employee Dashboard" })}
              </h1>
              <p className="text-muted-foreground">
                {t({ ar: "إدارة الطلبات المسندة إليك", en: "Manage your assigned bookings" })}
              </p>
            </div>

            {/* Quick Actions - Mobile Only */}
            <div className="lg:hidden grid grid-cols-3 gap-3 mb-6">
              <Button onClick={() => navigate('/')} variant="outline" className="h-20 flex-col gap-2 rounded-md">
                <Home className="w-5 h-5" />
                <span className="text-xs">{t({ ar: "الرئيسية", en: "Home" })}</span>
              </Button>
              <Button onClick={() => navigate('/task-manager')} variant="outline" className="h-20 flex-col gap-2 rounded-md">
                <ListTodo className="w-5 h-5" />
                <span className="text-xs">{t({ ar: "المهام", en: "Tasks" })}</span>
              </Button>
              <Button onClick={() => navigate('/profile')} variant="outline" className="h-20 flex-col gap-2 rounded-md">
                <User className="w-5 h-5" />
                <span className="text-xs">{t({ ar: "الملف", en: "Profile" })}</span>
              </Button>
            </div>

            {/* Interactive Stats Dashboard - Mobile */}
            <div className="lg:hidden grid grid-cols-2 gap-3 mb-6">
              <Card className="rounded-md hover-lift transition-all bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center mb-2">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">{t({ ar: "قيد الانتظار", en: "Pending" })}</p>
                  <p className="text-sm font-bold text-center">{stats.pending}</p>
                </CardContent>
              </Card>
              <Card className="rounded-md hover-lift transition-all bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-2">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">{t({ ar: "مؤكد", en: "Confirmed" })}</p>
                  <p className="text-sm font-bold text-center">{stats.confirmed}</p>
                </CardContent>
              </Card>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8">
              <StatCard
                title={t({ ar: "الطلبات المسندة", en: "Assigned Bookings" })}
                value={stats.totalAssigned}
                icon={FileText}
                change={undefined}
                colorClass="bg-gradient-to-br from-blue-500 to-blue-600"
              />
              <StatCard
                title={t({ ar: "قيد الانتظار", en: "Pending" })}
                value={stats.pending}
                icon={Clock}
                change={stats.pendingChange}
                colorClass="bg-gradient-to-br from-orange-500 to-orange-600"
              />
              <StatCard
                title={t({ ar: "تم التأكيد", en: "Confirmed" })}
                value={stats.confirmed}
                icon={CheckCircle}
                change={undefined}
                colorClass="bg-gradient-to-br from-green-500 to-green-600"
              />
            </div>

            {/* Bookings Table */}
            <Card className="card-luxury rounded-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {t({ ar: "الطلبات المسندة إليك", en: "Assigned Bookings" })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingBookings ? (
                  <div className="flex justify-center py-8"><LoadingSpinner size="md" /></div>
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
