import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingManagement } from "@/components/BookingManagement";

export default function EmployeeDashboard() {
  const { userRole, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (userRole !== 'employee') {
        navigate('/');
      } else {
        fetchBookings();
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
          hotels:hotel_id (name_ar, name_en, location)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

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
        <h1 className="text-3xl font-bold text-gradient-luxury mb-8">{t({ ar: "لوحة تحكم الموظف", en: "Employee Dashboard", fr: "Tableau de bord employé", es: "Panel de empleado", ru: "Панель сотрудника", id: "Dasbor Karyawan", ms: "Papan Pemuka Pekerja" })}</h1>
        
        <div className="grid grid-cols-1 gap-6">
          <Card className="card-luxury">
            <CardHeader>
              <CardTitle>{t({ ar: "الطلبات المسندة إليك", en: "Assigned Bookings", fr: "Réservations assignées", es: "Reservas asignadas", ru: "Назначенные бронирования", id: "Pemesanan yang Ditugaskan", ms: "Tempahan yang Diberikan" })}</CardTitle>
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
