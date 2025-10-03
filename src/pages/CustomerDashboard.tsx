import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Home, FileText, User } from "lucide-react";

interface Booking {
  id: string;
  check_in: string;
  check_out: string;
  total_amount: number;
  status: string;
  hotels: {
    name_ar: string;
  };
}

export default function CustomerDashboard() {
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile'>('bookings');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchBookings();
    }
  }, [user, loading, navigate]);

  const fetchBookings = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('bookings')
      .select('*, hotels(name_ar)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data) setBookings(data as Booking[]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-status-new';
      case 'confirmed': return 'bg-status-confirmed';
      case 'cancelled': return 'bg-status-cancelled';
      case 'completed': return 'bg-status-completed';
      default: return 'bg-muted';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap = {
      new: { ar: 'جديد', en: 'New', fr: 'Nouveau', es: 'Nuevo', ru: 'Новый', id: 'Baru', ms: 'Baru' },
      confirmed: { ar: 'مؤكد', en: 'Confirmed', fr: 'Confirmé', es: 'Confirmado', ru: 'Подтверждено', id: 'Dikonfirmasi', ms: 'Disahkan' },
      cancelled: { ar: 'ملغي', en: 'Cancelled', fr: 'Annulé', es: 'Cancelado', ru: 'Отменено', id: 'Dibatalkan', ms: 'Dibatalkan' },
      completed: { ar: 'مكتمل', en: 'Completed', fr: 'Terminé', es: 'Completado', ru: 'Завершено', id: 'Selesai', ms: 'Selesai' }
    };
    return t(statusMap[status as keyof typeof statusMap] || { ar: status, en: status, fr: status, es: status, ru: status, id: status, ms: status });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">{t({ ar: "جاري التحميل...", en: "Loading...", fr: "Chargement...", es: "Cargando...", ru: "Загрузка...", id: "Memuat...", ms: "Memuatkan..." })}</div>;
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4 pt-28">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => navigate('/')}>
            <Home className="w-4 h-4 mr-2" />
            {t({ ar: "الرئيسية", en: "Home", fr: "Accueil", es: "Inicio", ru: "Главная", id: "Beranda", ms: "Laman Utama" })}
          </Button>
          <h1 className="text-3xl font-bold text-gradient-luxury">{t({ ar: "لوحة التحكم", en: "Dashboard", fr: "Tableau de bord", es: "Panel", ru: "Панель", id: "Dasbor", ms: "Papan Pemuka" })}</h1>
        </div>

        <div className="flex gap-4 mb-6">
          <Button 
            variant={activeTab === 'bookings' ? 'default' : 'outline'}
            onClick={() => setActiveTab('bookings')}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            {t({ ar: "حجوزاتي", en: "My Bookings", fr: "Mes réservations", es: "Mis reservas", ru: "Мои бронирования", id: "Pemesanan Saya", ms: "Tempahan Saya" })}
          </Button>
          <Button 
            variant={activeTab === 'profile' ? 'default' : 'outline'}
            onClick={() => setActiveTab('profile')}
            className="gap-2"
          >
            <User className="w-4 h-4" />
            {t({ ar: "معلوماتي", en: "My Profile", fr: "Mon profil", es: "Mi perfil", ru: "Мой профиль", id: "Profil Saya", ms: "Profil Saya" })}
          </Button>
        </div>

        {activeTab === 'bookings' ? (
          bookings.length === 0 ? (
            <Card className="card-luxury">
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">{t({ ar: "لا توجد حجوزات حتى الآن", en: "No bookings yet", fr: "Aucune réservation pour le moment", es: "Aún no hay reservas", ru: "Пока нет бронирований", id: "Belum ada pemesanan", ms: "Tiada tempahan lagi" })}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {bookings.map((booking) => (
                <Card key={booking.id} className="card-luxury">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{booking.hotels?.name_ar}</CardTitle>
                      <Badge className={getStatusColor(booking.status)}>
                        {getStatusText(booking.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t({ ar: "تاريخ الوصول:", en: "Check-in:", fr: "Arrivée:", es: "Entrada:", ru: "Заезд:", id: "Check-in:", ms: "Daftar masuk:" })}</span>
                        <span className="font-medium">{format(new Date(booking.check_in), 'yyyy-MM-dd')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t({ ar: "تاريخ المغادرة:", en: "Check-out:", fr: "Départ:", es: "Salida:", ru: "Выезд:", id: "Check-out:", ms: "Daftar keluar:" })}</span>
                        <span className="font-medium">{format(new Date(booking.check_out), 'yyyy-MM-dd')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t({ ar: "المبلغ الإجمالي:", en: "Total Amount:", fr: "Montant total:", es: "Monto total:", ru: "Общая сумма:", id: "Jumlah Total:", ms: "Jumlah Keseluruhan:" })}</span>
                        <span className="font-medium">{booking.total_amount} {t({ ar: "ر.س", en: "SAR", fr: "SAR", es: "SAR", ru: "SAR", id: "SAR", ms: "SAR" })}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : (
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle>{t({ ar: "معلوماتي الشخصية", en: "Personal Information", fr: "Informations personnelles", es: "Información personal", ru: "Личная информация", id: "Informasi Pribadi", ms: "Maklumat Peribadi" })}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{t({ ar: "البريد الإلكتروني", en: "Email", fr: "E-mail", es: "Correo electrónico", ru: "Электронная почта", id: "Email", ms: "E-mel" })}</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <Button onClick={() => navigate('/reset-password')} className="w-full btn-luxury">
                {t({ ar: "تغيير كلمة المرور", en: "Change Password", fr: "Changer le mot de passe", es: "Cambiar contraseña", ru: "Изменить пароль", id: "Ubah Kata Sandi", ms: "Tukar Kata Laluan" })}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
