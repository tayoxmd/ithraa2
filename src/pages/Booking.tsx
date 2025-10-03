import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { CreditCard, Calendar as CalendarIcon, Users, Hotel as HotelIcon } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { bookingSchema } from "@/lib/validations";

const paymentMethods = [
  { id: 'apple-pay', name: 'Apple Pay', nameEn: 'Apple Pay' },
  { id: 'stc-pay', name: 'STC Pay', nameEn: 'STC Pay' },
  { id: 'google-pay', name: 'Google Pay', nameEn: 'Google Pay' },
  { id: 'mada', name: 'مدى', nameEn: 'Mada' },
  { id: 'visa', name: 'فيزا', nameEn: 'Visa' },
  { id: 'mastercard', name: 'ماستر كارد', nameEn: 'Mastercard' },
];

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [hotel, setHotel] = useState<any>(null);
  
  // Get booking details from URL params
  const searchParams = new URLSearchParams(location.search);
  const checkIn = searchParams.get('checkIn') ? new Date(searchParams.get('checkIn')!) : new Date();
  const checkOut = searchParams.get('checkOut') ? new Date(searchParams.get('checkOut')!) : new Date(Date.now() + 86400000);
  const guests = searchParams.get('guests') || "2";
  const rooms = searchParams.get('rooms') || "1";
  
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    async function fetchHotel() {
      const { data, error } = await supabase.rpc('get_public_hotel', {
        p_hotel_id: id
      });

      if (error) {
        console.error('Error fetching hotel:', error);
      }
      
      if (data && data.length > 0) setHotel(data[0]);
    }
    fetchHotel();
  }, [id, user, navigate]);

  const calculateTotal = () => {
    if (!hotel) return 0;
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const roomsCount = parseInt(rooms) || 1;
    return nights * hotel.price_per_night * roomsCount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentMethod) {
      toast({
        title: t({ ar: "خطأ", en: "Error", fr: "Erreur", es: "Error", ru: "Ошибка", id: "Kesalahan", ms: "Ralat" }),
        description: t({ ar: "يرجى اختيار طريقة الدفع", en: "Please select payment method", fr: "Veuillez sélectionner le mode de paiement", es: "Por favor seleccione el método de pago", ru: "Пожалуйста, выберите способ оплаты", id: "Silakan pilih metode pembayaran", ms: "Sila pilih kaedah pembayaran" }),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const totalAmount = calculateTotal();
    
    const { error } = await supabase
      .from('bookings')
      .insert([{
        user_id: user!.id,
        hotel_id: id!,
        check_in: format(checkIn, 'yyyy-MM-dd'),
        check_out: format(checkOut, 'yyyy-MM-dd'),
        guests: parseInt(guests),
        total_amount: totalAmount,
        payment_method: paymentMethod,
        notes: notes || null,
        status: 'new' as const,
        payment_status: 'pending',
      }]);

    setLoading(false);

    if (error) {
      toast({
        title: t({ ar: "خطأ", en: "Error", fr: "Erreur", es: "Error", ru: "Ошибка", id: "Kesalahan", ms: "Ralat" }),
        description: t({ ar: "حدث خطأ في الحجز", en: "Booking failed", fr: "Échec de la réservation", es: "Reserva fallida", ru: "Бронирование не удалось", id: "Pemesanan gagal", ms: "Tempahan gagal" }),
        variant: "destructive",
      });
    } else {
      toast({
        title: t({ ar: "تم بنجاح", en: "Success", fr: "Succès", es: "Éxito", ru: "Успех", id: "Berhasil", ms: "Berjaya" }),
        description: t({ ar: "تم إرسال طلب الحجز بنجاح", en: "Booking request submitted successfully", fr: "Demande de réservation soumise avec succès", es: "Solicitud de reserva enviada con éxito", ru: "Запрос на бронирование отправлен успешно", id: "Permintaan pemesanan berhasil dikirim", ms: "Permintaan tempahan berjaya dihantar" }),
      });
      navigate('/dashboard');
    }
  };

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t({ ar: 'جاري التحميل...', en: 'Loading...', fr: 'Chargement...', es: 'Cargando...', ru: 'Загрузка...', id: 'Memuat...', ms: 'Memuatkan...' })}
      </div>
    );
  }

  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-8">
          {t({ ar: 'إكمال الحجز', en: 'Complete Booking', fr: 'Finaliser la réservation', es: 'Completar reserva', ru: 'Завершить бронирование', id: 'Selesaikan Pemesanan', ms: 'Lengkapkan Tempahan' })}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Booking Summary Card */}
              <Card className="card-luxury">
                <CardHeader>
                  <CardTitle>{t({ ar: 'ملخص الحجز', en: 'Booking Summary', fr: 'Résumé de la réservation', es: 'Resumen de reserva', ru: 'Резюме бронирования', id: 'Ringkasan Pemesanan', ms: 'Ringkasan Tempahan' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Hotel Info */}
                  <div className="flex items-start gap-4 pb-4 border-b">
                    <HotelIcon className="w-10 h-10 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">
                        {language === 'ar' ? hotel.name_ar : hotel.name_en}
                      </h3>
                      <p className="text-sm text-muted-foreground">{hotel.location}</p>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <CalendarIcon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t({ ar: 'تاريخ الوصول', en: 'Check-in', fr: 'Arrivée', es: 'Entrada', ru: 'Заезд', id: 'Check-in', ms: 'Daftar masuk' })}</p>
                        <p className="font-semibold">{format(checkIn, "dd/MM/yyyy")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <CalendarIcon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t({ ar: 'تاريخ المغادرة', en: 'Check-out', fr: 'Départ', es: 'Salida', ru: 'Выезд', id: 'Check-out', ms: 'Daftar keluar' })}</p>
                        <p className="font-semibold">{format(checkOut, "dd/MM/yyyy")}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Users className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t({ ar: 'عدد النزلاء', en: 'Guests', fr: 'Invités', es: 'Huéspedes', ru: 'Гости', id: 'Tamu', ms: 'Tetamu' })}</p>
                        <p className="font-semibold">{guests} {t({ ar: 'نزيل', en: 'Guest(s)', fr: 'Invité(s)', es: 'Huésped(es)', ru: 'Гость(и)', id: 'Tamu', ms: 'Tetamu' })}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <HotelIcon className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">{t({ ar: 'عدد الغرف', en: 'Rooms', fr: 'Chambres', es: 'Habitaciones', ru: 'Номера', id: 'Kamar', ms: 'Bilik' })}</p>
                        <p className="font-semibold">{rooms} {t({ ar: 'غرفة', en: 'Room(s)', fr: 'Chambre(s)', es: 'Habitación(es)', ru: 'Номер(а)', id: 'Kamar', ms: 'Bilik' })}</p>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t({ ar: 'السعر لليلة', en: 'Price per night', fr: 'Prix par nuit', es: 'Precio por noche', ru: 'Цена за ночь', id: 'Harga per malam', ms: 'Harga setiap malam' })}</span>
                      <span>{hotel.price_per_night} {t({ ar: 'ر.س', en: 'SAR', fr: 'SAR', es: 'SAR', ru: 'САР', id: 'SAR', ms: 'SAR' })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t({ ar: 'عدد الليالي', en: 'Nights', fr: 'Nuits', es: 'Noches', ru: 'Ночи', id: 'Malam', ms: 'Malam' })}</span>
                      <span>{nights}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t({ ar: 'عدد الغرف', en: 'Rooms', fr: 'Chambres', es: 'Habitaciones', ru: 'Номера', id: 'Kamar', ms: 'Bilik' })}</span>
                      <span>{rooms}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>{t({ ar: 'الإجمالي', en: 'Total', fr: 'Total', es: 'Total', ru: 'Итого', id: 'Total', ms: 'Jumlah' })}</span>
                      <span className="text-primary">{calculateTotal()} {t({ ar: 'ر.س', en: 'SAR', fr: 'SAR', es: 'SAR', ru: 'САР', id: 'SAR', ms: 'SAR' })}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Notes */}
              <Card className="card-luxury">
                <CardHeader>
                  <CardTitle>{t({ ar: 'ملاحظات إضافية', en: 'Additional Notes', fr: 'Notes supplémentaires', es: 'Notas adicionales', ru: 'Дополнительные заметки', id: 'Catatan Tambahan', ms: 'Nota Tambahan' })}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t({ ar: 'أي ملاحظات خاصة...', en: 'Any special requests...', fr: 'Demandes spéciales...', es: 'Solicitudes especiales...', ru: 'Особые пожелания...', id: 'Permintaan khusus...', ms: 'Permintaan khas...' })}
                    rows={4}
                  />
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="card-luxury">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="ml-2 w-5 h-5" />
                    {t({ ar: 'طريقة الدفع', en: 'Payment Method', fr: 'Mode de paiement', es: 'Método de pago', ru: 'Способ оплаты', id: 'Metode Pembayaran', ms: 'Kaedah Pembayaran' })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod} required>
                    <SelectTrigger>
                      <SelectValue placeholder={t({ ar: 'اختر طريقة الدفع', en: 'Select payment method', fr: 'Sélectionner le mode de paiement', es: 'Seleccionar método de pago', ru: 'Выберите способ оплаты', id: 'Pilih metode pembayaran', ms: 'Pilih kaedah pembayaran' })} />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map(method => (
                        <SelectItem key={method.id} value={method.id}>
                          {language === 'ar' ? method.name : method.nameEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Confirm Button */}
              <Button 
                type="submit" 
                className="w-full btn-luxury h-14 text-lg"
                disabled={loading}
              >
                {loading ? t({ ar: 'جاري المعالجة...', en: 'Processing...', fr: 'Traitement...', es: 'Procesando...', ru: 'Обработка...', id: 'Memproses...', ms: 'Memproses...' }) : t({ ar: 'تأكيد الحجز', en: 'Confirm Booking', fr: 'Confirmer la réservation', es: 'Confirmar reserva', ru: 'Подтвердить бронирование', id: 'Konfirmasi Pemesanan', ms: 'Sahkan Tempahan' })}
              </Button>
            </form>
          </div>

          {/* Side Summary (Desktop) */}
          <div className="hidden lg:block">
            <Card className="card-luxury sticky top-24">
              <CardHeader>
                <CardTitle>{t({ ar: 'معلومات الفندق', en: 'Hotel Information', fr: 'Informations sur l\'hôtel', es: 'Información del hotel', ru: 'Информация об отеле', id: 'Informasi Hotel', ms: 'Maklumat Hotel' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    {language === 'ar' ? hotel.name_ar : hotel.name_en}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">{hotel.location}</p>
                  {hotel.images && hotel.images[0] && (
                    <img 
                      src={hotel.images[0]} 
                      alt={hotel.name_en}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  )}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="w-4 h-4 text-primary" />
                    <span>{format(checkIn, "dd/MM/yyyy")} - {format(checkOut, "dd/MM/yyyy")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{guests} {t({ ar: 'نزيل', en: 'Guest(s)', fr: 'Invité(s)', es: 'Huésped(es)', ru: 'Гость(и)', id: 'Tamu', ms: 'Tetamu' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <HotelIcon className="w-4 h-4 text-primary" />
                    <span>{rooms} {t({ ar: 'غرفة', en: 'Room(s)', fr: 'Chambre(s)', es: 'Habitación(es)', ru: 'Номер(а)', id: 'Kamar', ms: 'Bilik' })}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-xl">
                    <span>{t({ ar: 'الإجمالي', en: 'Total', fr: 'Total', es: 'Total', ru: 'Итого', id: 'Total', ms: 'Jumlah' })}</span>
                    <span className="text-primary">{calculateTotal()} {t({ ar: 'ر.س', en: 'SAR', fr: 'SAR', es: 'SAR', ru: 'САР', id: 'SAR', ms: 'SAR' })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
