import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, FileText, Clock, Users, UserCog, Hotel } from "lucide-react";

export default function AdminDashboard() {
  const { userRole, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && userRole !== 'admin') {
      navigate('/');
    }
  }, [userRole, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">{t({ ar: "جاري التحميل...", en: "Loading...", fr: "Chargement...", es: "Cargando...", ru: "Загрузка...", id: "Memuat...", ms: "Memuatkan..." })}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4 pt-28">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-gradient-luxury mb-8">{t({ ar: "لوحة تحكم المدير", en: "Admin Dashboard", fr: "Tableau de bord administrateur", es: "Panel de administración", ru: "Панель администратора", id: "Dasbor Admin", ms: "Papan Pemuka Admin" })}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Button onClick={() => navigate('/manage-employees')} className="h-auto p-4 md:p-6">
            <div className="flex flex-col items-center gap-2">
              <UserCog className="w-6 h-6 md:w-8 md:h-8" />
              <span className="text-xs md:text-sm">{t({ ar: "إدارة الموظفين", en: "Manage Employees", fr: "Gérer les employés", es: "Gestionar empleados", ru: "Управление сотрудниками", id: "Kelola Karyawan", ms: "Urus Pekerja" })}</span>
            </div>
          </Button>
          <Button onClick={() => navigate('/manage-hotels')} variant="outline" className="h-auto p-4 md:p-6">
            <div className="flex flex-col items-center gap-2">
              <Hotel className="w-6 h-6 md:w-8 md:h-8" />
              <span className="text-xs md:text-sm">{t({ ar: "إدارة الفنادق", en: "Manage Hotels", fr: "Gérer les hôtels", es: "Gestionar hoteles", ru: "Управление отелями", id: "Kelola Hotel", ms: "Urus Hotel" })}</span>
            </div>
          </Button>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle>{t({ ar: "الطلبات الأخيرة", en: "Recent Bookings", fr: "Réservations récentes", es: "Reservas recientes", ru: "Недавние бронирования", id: "Pemesanan Terbaru", ms: "Tempahan Terkini" })}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t({ ar: "قريباً...", en: "Coming soon...", fr: "Bientôt...", es: "Próximamente...", ru: "Скоро...", id: "Segera hadir...", ms: "Akan datang..." })}</p>
            </CardContent>
          </Card>

          <Card className="card-luxury">
            <CardHeader>
              <CardTitle>{t({ ar: "الإحصائيات", en: "Statistics", fr: "Statistiques", es: "Estadísticas", ru: "Статистика", id: "Statistik", ms: "Statistik" })}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t({ ar: "قريباً...", en: "Coming soon...", fr: "Bientôt...", es: "Próximamente...", ru: "Скоро...", id: "Segera hadir...", ms: "Akan datang..." })}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
