import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingManagement } from "@/components/BookingManagement";
import { Button } from "@/components/ui/button";
import { DollarSign, FileText, Clock, Users, UserCog, Hotel } from "lucide-react";
import { playNotificationSound } from "@/utils/notificationSound";

export default function AdminDashboard() {
  const { userRole, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (userRole !== 'admin') {
        navigate('/');
      } else {
        fetchBookings();
        
        // Set up real-time subscription for new bookings
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

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">{t({ ar: "جاري التحميل...", en: "Loading...", fr: "Chargement...", es: "Cargando...", ru: "Загрузка...", id: "Memuat...", ms: "Memuatkan..." })}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4 pt-28">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-gradient-luxury mb-8">{t({ ar: "لوحة تحكم المدير", en: "Admin Dashboard", fr: "Tableau de bord administrateur", es: "Panel de administración", ru: "Панель администратора", id: "Dasbor Admin", ms: "Papan Pemuka Admin" })}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="card-luxury hover-lift cursor-pointer" onClick={() => navigate('/manage-employees')}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserCog className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{t({ ar: "إدارة الموظفين", en: "Manage Employees" })}</h3>
                  <p className="text-sm text-muted-foreground">{t({ ar: "إضافة وتعديل الموظفين", en: "Add and edit employees" })}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-luxury hover-lift cursor-pointer" onClick={() => navigate('/manage-hotels')}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Hotel className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{t({ ar: "إدارة الفنادق", en: "Manage Hotels" })}</h3>
                  <p className="text-sm text-muted-foreground">{t({ ar: "إضافة وتعديل الفنادق", en: "Add and edit hotels" })}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-luxury hover-lift cursor-pointer" onClick={() => navigate('/site-settings')}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{t({ ar: "إعدادات الموقع", en: "Site Settings" })}</h3>
                  <p className="text-sm text-muted-foreground">{t({ ar: "تعديل ألوان وخطوط الموقع", en: "Edit site colors and fonts" })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <Card className="card-luxury">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t({ ar: "إجمالي الأرباح", en: "Total Revenue", fr: "Revenu total", es: "Ingresos totales", ru: "Общий доход", id: "Total Pendapatan", ms: "Jumlah Pendapatan" })}</CardTitle>
              <DollarSign className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">٥٠,٠٠٠ ر.س</div>
            </CardContent>
          </Card>

          <Card className="card-luxury">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t({ ar: "إجمالي الطلبات", en: "Total Bookings", fr: "Réservations totales", es: "Reservas totales", ru: "Всего бронирований", id: "Total Pemesanan", ms: "Jumlah Tempahan" })}</CardTitle>
              <FileText className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">١٢٣</div>
            </CardContent>
          </Card>

          <Card className="card-luxury">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t({ ar: "طلبات قيد الانتظار", en: "Pending Bookings", fr: "Réservations en attente", es: "Reservas pendientes", ru: "Ожидающие бронирования", id: "Pemesanan Tertunda", ms: "Tempahan Tertangguh" })}</CardTitle>
              <Clock className="w-4 h-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">١٥</div>
            </CardContent>
          </Card>

          <Card className="card-luxury">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t({ ar: "عدد العملاء", en: "Total Customers", fr: "Clients totaux", es: "Clientes totales", ru: "Всего клиентов", id: "Total Pelanggan", ms: "Jumlah Pelanggan" })}</CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">٨٧</div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle>{t({ ar: "الطلبات الأخيرة", en: "Recent Bookings", fr: "Réservations récentes", es: "Reservas recientes", ru: "Недавние бронирования", id: "Pemesanan Terbaru", ms: "Tempahan Terkini" })}</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingBookings ? (
                <p className="text-muted-foreground">{t({ ar: "جاري التحميل...", en: "Loading...", fr: "Chargement...", es: "Cargando...", ru: "Загрузка...", id: "Memuat...", ms: "Memuatkan..." })}</p>
              ) : (
                <BookingManagement bookings={bookings} onUpdate={fetchBookings} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
