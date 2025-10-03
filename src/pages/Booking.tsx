import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "@/hooks/use-toast";
import { CalendarIcon, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { cn } from "@/lib/utils";
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
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const [hotel, setHotel] = useState<any>(null);
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [guests, setGuests] = useState("2");
  const [rooms, setRooms] = useState("1");
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
    if (!checkIn || !checkOut || !hotel) return 0;
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const roomsCount = parseInt(rooms) || 1;
    return nights * hotel.price_per_night * roomsCount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من صحة المدخلات
    const validationResult = bookingSchema.safeParse({
      checkIn: checkIn ? format(checkIn, 'yyyy-MM-dd') : '',
      checkOut: checkOut ? format(checkOut, 'yyyy-MM-dd') : '',
      guests: parseInt(guests) || 0,
      paymentMethod,
      notes,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      toast({
        title: t("خطأ في البيانات", "Validation Error"),
        description: firstError.message,
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
        check_in: validationResult.data.checkIn,
        check_out: validationResult.data.checkOut,
        guests: validationResult.data.guests,
        total_amount: totalAmount,
        payment_method: validationResult.data.paymentMethod,
        notes: validationResult.data.notes || null,
        status: 'new' as const,
        payment_status: 'pending',
      }]);

    setLoading(false);

    if (error) {
      toast({
        title: t("خطأ", "Error"),
        description: t("حدث خطأ في الحجز", "Booking failed"),
        variant: "destructive",
      });
    } else {
      toast({
        title: t("تم بنجاح", "Success"),
        description: t("تم إرسال طلب الحجز بنجاح", "Booking request submitted successfully"),
      });
      navigate('/dashboard');
    }
  };

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t('جاري التحميل...', 'Loading...')}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-8">
          {t('إكمال الحجز', 'Complete Booking')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <Card className="card-luxury mb-6">
                <CardHeader>
                  <CardTitle>{t('تفاصيل الحجز', 'Booking Details')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>{t('تاريخ الوصول', 'Check-in')}</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-right",
                              !checkIn && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="ml-2 h-4 w-4" />
                            {checkIn ? format(checkIn, "PPP", { locale: language === 'ar' ? ar : undefined }) : t("اختر التاريخ", "Pick a date")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={checkIn}
                            onSelect={setCheckIn}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label>{t('تاريخ المغادرة', 'Check-out')}</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-right",
                              !checkOut && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="ml-2 h-4 w-4" />
                            {checkOut ? format(checkOut, "PPP", { locale: language === 'ar' ? ar : undefined }) : t("اختر التاريخ", "Pick a date")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={checkOut}
                            onSelect={setCheckOut}
                            disabled={(date) => !checkIn || date <= checkIn}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>{t('عدد الضيوف', 'Guests')}</Label>
                      <Select value={guests} onValueChange={setGuests}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                          <SelectItem value="custom">{t('أخرى', 'Other')}</SelectItem>
                        </SelectContent>
                      </Select>
                      {guests === 'custom' && (
                        <Input
                          type="number"
                          min="1"
                          placeholder={t('أدخل العدد', 'Enter number')}
                          className="mt-2"
                          onChange={(e) => setGuests(e.target.value)}
                        />
                      )}
                    </div>

                    <div>
                      <Label>{t('عدد الغرف', 'Rooms')}</Label>
                      <Select value={rooms} onValueChange={setRooms}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                          ))}
                          <SelectItem value="custom">{t('أكثر', 'More')}</SelectItem>
                        </SelectContent>
                      </Select>
                      {rooms === 'custom' && (
                        <Input
                          type="number"
                          min="1"
                          placeholder={t('أدخل العدد', 'Enter number')}
                          className="mt-2"
                          onChange={(e) => setRooms(e.target.value)}
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <Label>{t('ملاحظات إضافية', 'Additional Notes')}</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t('أي ملاحظات خاصة...', 'Any special requests...')}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-luxury">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="ml-2 w-5 h-5" />
                    {t('طريقة الدفع', 'Payment Method')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('اختر طريقة الدفع', 'Select payment method')} />
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

              <Button 
                type="submit" 
                className="w-full btn-luxury mt-6 h-14 text-lg"
                disabled={loading}
              >
                {loading ? t('جاري المعالجة...', 'Processing...') : t('تأكيد الحجز', 'Confirm Booking')}
              </Button>
            </form>
          </div>

          <div>
            <Card className="card-luxury sticky top-24">
              <CardHeader>
                <CardTitle>{t('ملخص الحجز', 'Booking Summary')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">
                    {language === 'ar' ? hotel.name_ar : hotel.name_en}
                  </h3>
                  <p className="text-sm text-muted-foreground">{hotel.location}</p>
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{t('السعر لليلة', 'Price per night')}</span>
                    <span>{hotel.price_per_night} {t('ر.س', 'SAR')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>{t('عدد الغرف', 'Rooms')}</span>
                    <span>{rooms === 'custom' ? '-' : rooms}</span>
                  </div>
                  {checkIn && checkOut && (
                    <div className="flex justify-between text-sm">
                      <span>{t('عدد الليالي', 'Nights')}</span>
                      <span>
                        {Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>{t('الإجمالي', 'Total')}</span>
                    <span className="text-primary">{calculateTotal()} {t('ر.س', 'SAR')}</span>
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
