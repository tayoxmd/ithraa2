import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Home, FileText, User, Download } from "lucide-react";
import { downloadBookingPDF } from "@/utils/pdfGenerator";
import { generateCustomerPageUrl, validateCustomerAccess } from "@/utils/customerLinks";

interface Booking {
  id: string;
  check_in: string;
  check_out: string;
  guests: number;
  rooms: number;
  total_amount: number;
  status: string;
  payment_status: 'paid' | 'partially_paid' | 'unpaid';
  amount_paid: number;
  payment_method: string;
  guest_name?: string;
  hotel_confirmation_number?: string;
  booking_number?: number;
  discount_amount?: number;
  manual_total?: number;
  notes?: string;
  user_id: string;
  hotels: {
    name_ar: string;
    name_en: string;
    location: string;
    location_url?: string;
    price_per_night: number;
    max_guests_per_room: number;
    tax_percentage: number;
    room_type?: 'hotel_rooms' | 'owner_rooms';
  };
  profiles?: {
    full_name: string;
    phone: string;
  };
}

export default function CustomerDashboard() {
  const { user, loading } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile'>('bookings');

  useEffect(() => {
    const checkAccess = async () => {
      // Check if accessing via permanent link
      const requestedUserId = searchParams.get('uid');
      
      if (requestedUserId) {
        const hasAccess = await validateCustomerAccess(requestedUserId);
        if (!hasAccess) {
          navigate('/auth');
          return;
        }
        fetchBookings(requestedUserId);
      } else if (!loading && !user) {
        navigate('/auth');
      } else if (user) {
        fetchBookings(user.id);
      }
    };
    
    checkAccess();
  }, [user, loading, navigate, searchParams]);

  const fetchBookings = async (userId: string) => {
    const { data } = await supabase
      .from('bookings')
      .select('*, hotels(name_ar, name_en, location, location_url, price_per_night, max_guests_per_room, tax_percentage, room_type), profiles(full_name, phone)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (data) setBookings(data as Booking[]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-500/20';
      case 'new':
        return 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 border-red-500/20';
      case 'rejected':
        return 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 border-gray-500/20';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 border-green-500/20';
      case 'partially_paid':
        return 'bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 border-orange-500/20';
      case 'unpaid':
        return 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 border-gray-500/20';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: { ar: string; en: string } } = {
      'new': { ar: 'جديد', en: 'New' },
      'confirmed': { ar: 'مؤكد', en: 'Confirmed' },
      'pending': { ar: 'قيد المعالجة', en: 'Pending' },
      'cancelled': { ar: 'ملغي', en: 'Cancelled' },
      'rejected': { ar: 'مرفوض', en: 'Rejected' },
    };
    return statusMap[status] || { ar: status, en: status };
  };

  const getPaymentStatusText = (status: string) => {
    const statusMap: { [key: string]: { ar: string; en: string } } = {
      'paid': { ar: 'مدفوع', en: 'Paid' },
      'partially_paid': { ar: 'مدفوع جزئياً', en: 'Partially Paid' },
      'unpaid': { ar: 'غير مدفوع', en: 'Unpaid' },
    };
    return statusMap[status] || { ar: status, en: status };
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

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Button 
            variant={activeTab === 'bookings' ? 'default' : 'outline'}
            onClick={() => setActiveTab('bookings')}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            {t({ ar: "حجوزاتي", en: "My Bookings", fr: "Mes réservations", es: "Mis reservas", ru: "Мои бронирования", id: "Pemesanan Saya", ms: "Tempahan Saya" })}
          </Button>
          <Button 
            variant="outline"
            onClick={() => navigate('/profile')}
            className="gap-2"
          >
            <User className="w-4 h-4" />
            {t({ ar: "الملف الشخصي", en: "Profile", fr: "Profil", es: "Perfil", ru: "Профиль", id: "Profil", ms: "Profil" })}
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
                    <div className="flex justify-between items-start flex-wrap gap-3">
                      <CardTitle className="text-lg sm:text-xl flex-1 min-w-0">
                        {language === 'ar' ? booking.hotels?.name_ar : booking.hotels?.name_en}
                      </CardTitle>
                      <div className="flex gap-2 flex-wrap items-center">
                        <Badge className={`${getStatusColor(booking.status)} px-3 py-1.5 min-w-[100px] justify-center border text-xs sm:text-sm`}>
                          {language === 'ar' ? getStatusText(booking.status).ar : getStatusText(booking.status).en}
                        </Badge>
                        <Badge className={`${getPaymentStatusColor(booking.payment_status)} px-3 py-1.5 min-w-[100px] justify-center border text-xs sm:text-sm`}>
                          {language === 'ar' ? getPaymentStatusText(booking.payment_status).ar : getPaymentStatusText(booking.payment_status).en}
                        </Badge>
                      </div>
                    </div>
                    {booking.hotel_confirmation_number && (
                      <div className="mt-3">
                        <div className="inline-block px-3 py-1.5 bg-white border-2 border-purple-600 rounded-md">
                          <span className="text-xs font-semibold text-black">
                            {t({ ar: "رقم حجز الفندق:", en: "Hotel Booking#:" })} {booking.hotel_confirmation_number}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t({ ar: "تاريخ الوصول:", en: "Check-in:", fr: "Arrivée:", es: "Entrada:", ru: "Заезд:", id: "Check-in:", ms: "Daftar masuk:" })}</span>
                        <span className="font-medium">{format(new Date(booking.check_in), 'yyyy-MM-dd')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t({ ar: "تاريخ المغادرة:", en: "Check-out:", fr: "Départ:", es: "Salida:", ru: "Выезد:", id: "Check-out:", ms: "Daftar keluar:" })}</span>
                        <span className="font-medium">{format(new Date(booking.check_out), 'yyyy-MM-dd')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t({ ar: "عدد النزلاء:", en: "Guests:", fr: "Invités:", es: "Huéspedes:", ru: "Гости:", id: "Tamu:", ms: "Tetamu:" })}</span>
                        <span className="font-medium">{booking.guests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t({ ar: "عدد الغرف:", en: "Rooms:", fr: "Chambres:", es: "Habitaciones:", ru: "Номера:", id: "Kamar:", ms: "Bilik:" })}</span>
                        <span className="font-medium">{booking.rooms}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t({ ar: "المبلغ الإجمالي:", en: "Total Amount:", fr: "Montant total:", es: "Monto total:", ru: "Общая сумма:", id: "Jumlah Total:", ms: "Jumlah Keseluruhan:" })}</span>
                        <span className="font-medium">{booking.total_amount} {t({ ar: "ر.س", en: "SAR", fr: "SAR", es: "SAR", ru: "SAR", id: "SAR", ms: "SAR" })}</span>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          const customerPageUrl = generateCustomerPageUrl(booking.user_id);
                          const nights = Math.ceil((new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / (1000 * 60 * 60 * 24));
                          const taxRate = booking.hotels?.tax_percentage || 0;
                          
                          // Calculate amounts correctly
                          // total_amount already includes tax, so we need to reverse calculate
                          const totalAfterDiscount = (booking.manual_total || booking.total_amount) - (booking.discount_amount || 0);
                          const subtotalBeforeTax = taxRate > 0 ? totalAfterDiscount / (1 + taxRate / 100) : totalAfterDiscount;
                          const vatAmount = totalAfterDiscount - subtotalBeforeTax;
                          
                          downloadBookingPDF({
                            bookingNumber: booking.booking_number || 0,
                            hotelConfirmationNumber: booking.hotel_confirmation_number,
                            guestName: booking.guest_name || booking.profiles?.full_name || '',
                            clientName: booking.profiles?.full_name || '',
                            clientEmail: user?.email || '',
                            clientPhone: booking.profiles?.phone || '',
                            hotelNameEn: booking.hotels?.name_en || '',
                            hotelNameAr: booking.hotels?.name_ar || '',
                            hotelLocation: booking.hotels?.location || '',
                            hotelLocationUrl: booking.hotels?.location_url,
                            checkIn: new Date(booking.check_in),
                            checkOut: new Date(booking.check_out),
                            nights,
                            rooms: booking.rooms,
                            guests: booking.guests,
                            baseGuests: (booking.hotels?.max_guests_per_room || 2) * booking.rooms,
                            extraGuests: Math.max(0, booking.guests - ((booking.hotels?.max_guests_per_room || 2) * booking.rooms)),
                            roomType: booking.hotels?.room_type === 'owner_rooms' ? 'Owner Room' : 'Hotel Room',
                            pricePerNight: booking.hotels?.price_per_night || 0,
                            subtotal: subtotalBeforeTax,
                            extraGuestCharge: 0,
                            discountAmount: booking.discount_amount,
                            netAmount: subtotalBeforeTax - (booking.discount_amount || 0),
                            vatAmount,
                            totalAmount: booking.total_amount,
                            paymentMethod: booking.payment_method || '',
                            notes: booking.notes,
                            customerPageUrl,
                          });
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {t({ ar: "تحميل PDF", en: "Download PDF", fr: "Télécharger PDF", es: "Descargar PDF", ru: "Скачать PDF", id: "Unduh PDF", ms: "Muat turun PDF" })}
                      </Button>
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
