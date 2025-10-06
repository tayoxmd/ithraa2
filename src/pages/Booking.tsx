import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { CreditCard, Calendar as CalendarIcon, Users, Hotel as HotelIcon } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { bookingSchema } from "@/lib/validations";

const paymentMethods = [
  { id: 'cash', name: 'نقدي', nameEn: 'Cash' },
  { id: 'cash-electronic', name: 'نقدي + دفع إلكتروني', nameEn: 'Cash + Electronic Payment' },
  { id: 'cash-transfer', name: 'نقدي + تحويل بنكي', nameEn: 'Cash + Bank Transfer' },
  { id: 'apple-pay', name: 'Apple Pay', nameEn: 'Apple Pay' },
  { id: 'stc-pay', name: 'STC Pay', nameEn: 'STC Pay' },
  { id: 'google-pay', name: 'Google Pay', nameEn: 'Google Pay' },
  { id: 'mada', name: 'مدى', nameEn: 'Mada' },
  { id: 'mada-pay', name: 'تطبيق مدى', nameEn: 'Mada Pay' },
  { id: 'visa', name: 'فيزا', nameEn: 'Visa' },
  { id: 'mastercard', name: 'ماستر كارد', nameEn: 'Mastercard' },
  { id: 'bank-transfer', name: 'تحويل بنكي', nameEn: 'Bank Transfer' },
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
  const [guestName, setGuestName] = useState("");
  const [useCustomerName, setUseCustomerName] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      // Store the current URL to redirect back after login
      const redirectUrl = `${location.pathname}${location.search}`;
      navigate(`/auth?redirect=${encodeURIComponent(redirectUrl)}`);
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
  }, [id, user, navigate, location]);

  const calculateTotal = () => {
    if (!hotel) return { subtotal: 0, extraGuestCharge: 0, tax: 0, total: 0, extraGuestsCount: 0 };
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    // Check for invalid dates
    if (nights <= 0) return { subtotal: 0, extraGuestCharge: 0, tax: 0, total: 0, extraGuestsCount: 0 };
    
    const roomsCount = parseInt(rooms) || 1;
    const guestsCount = parseInt(guests) || 1;
    
    // Get tax rate (0 means no tax)
    const taxRate = (hotel.tax_percentage && hotel.tax_percentage > 0) ? hotel.tax_percentage : 0;
    
    // Calculate base room price
    const basePrice = hotel.price_per_night * nights * roomsCount;
    
    // Calculate extra guests charge
    const maxGuestsIncluded = (hotel.max_guests_per_room || 2) * roomsCount;
    let extraGuestCharge = 0;
    let extraGuestsCount = 0;
    
    if (guestsCount > maxGuestsIncluded) {
      extraGuestsCount = guestsCount - maxGuestsIncluded;
      extraGuestCharge = extraGuestsCount * (hotel.extra_guest_price || 0) * nights;
    }
    
    // Calculate subtotal before tax
    const subtotalBeforeTax = basePrice + extraGuestCharge;
    
    // Calculate tax amount
    const tax = taxRate > 0 ? (subtotalBeforeTax * taxRate / 100) : 0;
    
    // Calculate total
    const total = subtotalBeforeTax + tax;
    
    return { subtotal: basePrice, extraGuestCharge, tax, total, extraGuestsCount };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate dates
    if (checkOut <= checkIn) {
      toast({
        title: t({ ar: "خطأ", en: "Error", fr: "Erreur", es: "Error", ru: "Ошибка", id: "Kesalahan", ms: "Ralat" }),
        description: t({ ar: "تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول", en: "Check-out date must be after check-in date", fr: "La date de départ doit être postérieure à la date d'arrivée", es: "La fecha de salida debe ser posterior a la fecha de entrada", ru: "Дата выезда должна быть позже даты заезда", id: "Tanggal check-out harus setelah tanggal check-in", ms: "Tarikh daftar keluar mesti selepas tarikh daftar masuk" }),
        variant: "destructive",
      });
      return;
    }
    
    if (!guestName.trim()) {
      toast({
        title: t({ ar: "خطأ", en: "Error", fr: "Erreur", es: "Error", ru: "Ошибка", id: "Kesalahan", ms: "Ralat" }),
        description: t({ ar: "يرجى إدخال اسم الضيف", en: "Please enter guest name", fr: "Veuillez entrer le nom de l'invité", es: "Por favor ingrese el nombre del huésped", ru: "Пожалуйста, введите имя гостя", id: "Silakan masukkan nama tamu", ms: "Sila masukkan nama tetamu" }),
        variant: "destructive",
      });
      return;
    }
    
    if (!paymentMethod) {
      toast({
        title: t({ ar: "خطأ", en: "Error", fr: "Erreur", es: "Error", ru: "Ошибка", id: "Kesalahan", ms: "Ralat" }),
        description: t({ ar: "يرجى اختيار طريقة الدفع", en: "Please select payment method", fr: "Veuillez sélectionner le mode de paiement", es: "Por favor seleccione el método de pago", ru: "Пожалуйста, выберите способ оплаты", id: "Silakan pilih metode pembayaran", ms: "Sila pilih kaedah pembayaran" }),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    const totalData = calculateTotal();
    
    // Format guest name: uppercase if English, keep as is if Arabic
    const formattedGuestName = /^[a-zA-Z\s]+$/.test(guestName.trim()) 
      ? guestName.trim().toUpperCase() 
      : guestName.trim();
    
    const { error } = await supabase
      .from('bookings')
      .insert([{
        user_id: user!.id,
        hotel_id: id!,
        check_in: format(checkIn, 'yyyy-MM-dd'),
        check_out: format(checkOut, 'yyyy-MM-dd'),
        guests: parseInt(guests),
        rooms: parseInt(rooms),
        total_amount: totalData.total,
        payment_method: paymentMethod,
        notes: notes || null,
        guest_name: formattedGuestName,
        status: 'new' as const,
        payment_status: 'unpaid',
        amount_paid: 0,
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
        description: t({ ar: "تم إرسال حجزك بنجاح وفي انتظار التأكيد", en: "Your booking has been sent successfully and is awaiting confirmation", fr: "Votre réservation a été envoyée avec succès et est en attente de confirmation", es: "Su reserva se ha enviado con éxito y está pendiente de confirmación", ru: "Ваше бронирование успешно отправлено и ожидает подтверждения", id: "Pemesanan Anda berhasil dikirim dan menunggu konfirmasi", ms: "Tempahan anda telah berjaya dihantar dan menunggu pengesahan" }),
      });
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);
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
        <h1 className="text-2xl md:text-3xl font-bold mb-8 text-white">
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
                      <span className="text-muted-foreground">{t({ ar: 'السعر لليلة', en: 'Price per night' })}</span>
                      <span>{hotel.price_per_night} {t({ ar: 'ر.س', en: 'SAR' })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t({ ar: 'عدد الليالي', en: 'Nights' })}</span>
                      <span>{nights}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t({ ar: 'عدد الغرف', en: 'Rooms' })}</span>
                      <span>{rooms}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{t({ ar: 'أساسي', en: 'Base guests' })}</span>
                      <span>
                        {(hotel.max_guests_per_room || 2) * parseInt(rooms)}{' '}
                        {((hotel.max_guests_per_room || 2) * parseInt(rooms)) === 1 
                          ? t({ ar: 'شخص', en: 'person' })
                          : ((hotel.max_guests_per_room || 2) * parseInt(rooms)) === 2
                          ? t({ ar: 'شخصان', en: 'persons' })
                          : t({ ar: 'أشخاص', en: 'persons' })
                        }
                      </span>
                    </div>
                    {calculateTotal().extraGuestsCount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {calculateTotal().extraGuestsCount === 1 
                            ? t({ ar: 'شخص إضافي واحد', en: 'One extra guest' })
                            : calculateTotal().extraGuestsCount === 2
                            ? t({ ar: `شخصين إضافيين`, en: 'Two extra guests' })
                            : t({ ar: `${calculateTotal().extraGuestsCount} أشخاص إضافيين`, en: `${calculateTotal().extraGuestsCount} extra guests` })
                          }
                        </span>
                        <span>+{Math.round(calculateTotal().extraGuestCharge)} {t({ ar: 'ر.س', en: 'SAR' })}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>{t({ ar: 'الإجمالي', en: 'Total' })}</span>
                      <div className="flex flex-col items-end">
                        <span className="text-primary">
                          {Math.round(calculateTotal().total)} {t({ ar: 'ر.س', en: 'SAR' })}
                        </span>
                        <span className="text-[10px] font-normal text-muted-foreground">{t({ ar: 'شامل الضريبة', en: 'incl. tax' })}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Guest Name */}
              <Card className="card-luxury">
                <CardHeader>
                  <CardTitle>{t({ ar: 'اسم الضيف', en: 'Guest Name' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="use-customer-name"
                      checked={useCustomerName}
                      onChange={(e) => {
                        setUseCustomerName(e.target.checked);
                        if (e.target.checked && user) {
                          // Get customer name from profile
                          supabase
                            .from('profiles')
                            .select('full_name')
                            .eq('id', user.id)
                            .single()
                            .then(({ data }) => {
                              if (data?.full_name) {
                                setGuestName(data.full_name);
                              }
                            });
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <label htmlFor="use-customer-name" className="text-sm text-muted-foreground cursor-pointer">
                      {t({ ar: 'هل اسم العميل هو نفسه اسم الضيف؟', en: 'Is the customer name the same as the guest name?' })}
                    </label>
                  </div>
                  <Input
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder={t({ ar: 'أدخل اسم الضيف', en: 'Enter guest name' })}
                    required
                    disabled={useCustomerName}
                  />
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
                    <span>{t({ ar: 'الإجمالي', en: 'Total' })}</span>
                    <span className="text-primary">
                      {Math.round(calculateTotal().total)} {t({ ar: 'ر.س', en: 'SAR' })}
                      <span className="text-xs font-normal text-muted-foreground mr-1 block">{t({ ar: 'شامل الضريبة', en: 'incl. tax' })}</span>
                    </span>
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
