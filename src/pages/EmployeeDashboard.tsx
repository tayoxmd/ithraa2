import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EmployeeDashboard() {
  const { userRole, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && userRole !== 'employee') {
      navigate('/');
    }
  }, [userRole, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">{t({ ar: "جاري التحميل...", en: "Loading...", fr: "Chargement...", es: "Cargando...", ru: "Загрузка...", id: "Memuat...", ms: "Memuatkan..." })}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4 pt-28">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-3xl font-bold text-gradient-luxury mb-8">{t({ ar: "لوحة تحكم الموظف", en: "Employee Dashboard", fr: "Tableau de bord employé", es: "Panel de empleado", ru: "Панель сотрудника", id: "Dasbor Karyawan", ms: "Papan Pemuka Pekerja" })}</h1>
        
        <div className="grid grid-cols-1 gap-6">
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle>{t({ ar: "الطلبات المسندة إليك", en: "Assigned Bookings", fr: "Réservations assignées", es: "Reservas asignadas", ru: "Назначенные бронирования", id: "Pemesanan yang Ditugaskan", ms: "Tempahan yang Diberikan" })}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{t({ ar: "قريباً...", en: "Coming soon...", fr: "Bientôt...", es: "Próximamente...", ru: "Скоро...", id: "Segera hadir...", ms: "Akan datang..." })}</p>
            </CardContent>
          </Card>

          <Card className="card-luxury">
            <CardHeader>
              <CardTitle>{t({ ar: "الشكاوى", en: "Complaints", fr: "Plaintes", es: "Quejas", ru: "Жалобы", id: "Keluhan", ms: "Aduan" })}</CardTitle>
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
