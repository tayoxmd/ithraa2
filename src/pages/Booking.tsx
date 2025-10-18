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
import { CreditCard, Calendar as CalendarIcon, Users, Hotel as HotelIcon, Utensils } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { bookingSchema } from "@/lib/validations";
import { BookingAuthDialog } from "@/components/BookingAuthDialog";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { PostBookingAuthDialog } from "@/components/PostBookingAuthDialog";
import { useRef } from "react";
import { countries } from "@/data/countries";
import { calculateSeasonalPrice } from "@/utils/seasonalPricing";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileBooking } from "@/components/MobileBooking";
import { useTheme } from "@/contexts/ThemeContext";

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
  const isMobile = useIsMobile();
  const { userTheme } = useTheme();
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
  const [useCustomerName, setUseCustomerName] = useState(user ? true : false);
  const [loading, setLoading] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showPostBookingDialog, setShowPostBookingDialog] = useState(false);
  const [guestPhone, setGuestPhone] = useState("");
  const [guestCountryCode, setGuestCountryCode] = useState("+966");
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: boolean}>({});
  const guestNameRef = useRef<HTMLInputElement>(null);
  const paymentMethodRef = useRef<HTMLButtonElement>(null);
  const [extraMeals, setExtraMeals] = useState(0);
  const [savedGuests, setSavedGuests] = useState<any[]>([]);
  const [selectedGuestId, setSelectedGuestId] = useState<string>("");
  const [showNewGuestInput, setShowNewGuestInput] = useState(false);
  const [avgPricePerNight, setAvgPricePerNight] = useState<number | null>(null);
  const [loadingHotel, setLoadingHotel] = useState(true);
  const [customerFullName, setCustomerFullName] = useState("");

  // Fetch customer's full name if logged in
  useEffect(() => {
    async function fetchCustomerName() {
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
        
        if (data?.full_name) {
          setCustomerFullName(data.full_name);
          if (useCustomerName) {
            setGuestName(data.full_name);
          }
        }
      }
    }
    fetchCustomerName();
  }, [user]);

  // Update guest name when useCustomerName changes
  useEffect(() => {
    if (useCustomerName && customerFullName) {
      setGuestName(customerFullName);
    } else if (!useCustomerName) {
      setGuestName("");
    }
  }, [useCustomerName, customerFullName]);

  useEffect(() => {
    let mounted = true;
    
    async function fetchHotel() {
      if (!id) {
        navigate('/');
        return;
      }
      
      setLoadingHotel(true);
      
      try {
        const { data, error } = await supabase.rpc('get_public_hotel', {
          p_hotel_id: id
        });

        if (!mounted) return;

        if (error) {
          console.error('Error fetching hotel:', error);
          setLoadingHotel(false);
          navigate('/');
          return;
        }
        
        if (data && data.length > 0) {
          setHotel(data[0]);
          
          // Calculate seasonal pricing
          const avgPrice = await calculateSeasonalPrice(
            id!,
            checkIn,
            checkOut,
            data[0].price_per_night
          );
          
          if (mounted) {
            setAvgPricePerNight(avgPrice);
            setLoadingHotel(false);
          }
        } else {
          setLoadingHotel(false);
          navigate('/');
        }
      } catch (err) {
        console.error('Unexpected error fetching hotel:', err);
        if (mounted) {
          setLoadingHotel(false);
          navigate('/');
        }
      }
    }
    
    async function fetchSavedGuests() {
      if (user) {
        const { data, error } = await supabase
          .from('user_guests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (!error && data && mounted) {
          setSavedGuests(data);
        }
      }
    }
    
    fetchHotel();
    fetchSavedGuests();
    
    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  const calculateTotal = () => {
    if (!hotel) return { subtotal: 0, extraGuestCharge: 0, extraMealCharge: 0, tax: 0, total: 0, extraGuestsCount: 0 };
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    // Check for invalid dates
    if (nights <= 0) return { subtotal: 0, extraGuestCharge: 0, extraMealCharge: 0, tax: 0, total: 0, extraGuestsCount: 0 };
    
    const roomsCount = parseInt(rooms) || 1;
    const guestsCount = parseInt(guests) || 1;
    
    // Get tax rate (0 means no tax)
    const taxRate = (hotel.tax_percentage && hotel.tax_percentage > 0) ? hotel.tax_percentage : 0;
    
    // Calculate base room price using seasonal pricing if available
    const pricePerNight = avgPricePerNight !== null ? avgPricePerNight : hotel.price_per_night;
    const basePrice = pricePerNight * nights * roomsCount;
    
    // Calculate extra guests charge
    const maxGuestsIncluded = (hotel.max_guests_per_room || 2) * roomsCount;
    let extraGuestCharge = 0;
    let extraGuestsCount = 0;
    
    if (guestsCount > maxGuestsIncluded) {
      extraGuestsCount = guestsCount - maxGuestsIncluded;
      extraGuestCharge = extraGuestsCount * (hotel.extra_guest_price || 0) * nights;
    }
    
    // Calculate extra meals charge
    let extraMealCharge = 0;
    if (hotel.meal_plans && extraMeals > 0) {
      const extraMealPrice = hotel.meal_plans.extra_meal_price || 0;
      extraMealCharge = extraMeals * extraMealPrice * nights;
    }
    
    // Calculate subtotal before tax
    const subtotalBeforeTax = basePrice + extraGuestCharge + extraMealCharge;
    
    // Calculate tax amount
    const tax = taxRate > 0 ? (subtotalBeforeTax * taxRate / 100) : 0;
    
    // Calculate total
    const total = subtotalBeforeTax + tax;
    
    return { subtotal: basePrice, extraGuestCharge, extraMealCharge, tax, total, extraGuestsCount };
  };

  const initiateBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    
    // Validate dates
    if (checkOut <= checkIn) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: t({ ar: "تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول", en: "Check-out date must be after check-in date" }),
        variant: "destructive",
      });
      return;
    }
    
    if (!guestName.trim()) {
      setFieldErrors({ guestName: true });
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: t({ ar: "لم تقم بإدخال اسم الضيف", en: "Guest name is required" }),
        variant: "destructive",
      });
      // Scroll to the error field
      setTimeout(() => {
        guestNameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        guestNameRef.current?.focus();
      }, 100);
      return;
    }
    
    if (!paymentMethod) {
      setFieldErrors({ paymentMethod: true });
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: t({ ar: "يرجى اختيار طريقة الدفع", en: "Please select payment method" }),
        variant: "destructive",
      });
      // Scroll to the error field
      setTimeout(() => {
        paymentMethodRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return;
    }

    // إذا كان المستخدم مسجل دخول، قم بالحجز مباشرة
    if (user) {
      handleSubmit();
    } else {
      // إظهار نافذة خيارات المصادقة
      setShowAuthDialog(true);
    }
  };

  const handleGuestContinue = (phone: string, countryCode: string) => {
    setGuestPhone(phone);
    setGuestCountryCode(countryCode);
    // Use setTimeout to ensure state is updated before submission
    setTimeout(() => {
      handleSubmit(phone, countryCode);
    }, 0);
  };

  const handleSubmit = async (phone?: string, countryCode?: string) => {
    setLoading(true);

    const totalData = calculateTotal();
    
    // Format guest name: uppercase if English, keep as is if Arabic
    const formattedGuestName = /^[a-zA-Z\s]+$/.test(guestName.trim()) 
      ? guestName.trim().toUpperCase() 
      : guestName.trim();
    
    const bookingData: any = {
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
      extra_meals: extraMeals,
      meal_plan_name_ar: hotel?.meal_plans?.regular_ar || null,
      meal_plan_name_en: hotel?.meal_plans?.regular_en || null,
      meal_plan_price: hotel?.meal_plans?.price || 0,
      meal_plan_max_persons: hotel?.meal_plans?.max_persons || 0,
      meal_plan_extra_price: hotel?.meal_plans?.extra_meal_price || 0,
    };

    // إضافة معلومات المستخدم أو الضيف
    if (user) {
      bookingData.user_id = user.id;
    } else {
      // Use parameters if provided (from handleGuestContinue), otherwise use state
      const phoneToUse = phone || guestPhone;
      const countryCodeToUse = countryCode || guestCountryCode;
      
      if (phoneToUse) {
        bookingData.guest_phone = phoneToUse;
        bookingData.guest_country_code = countryCodeToUse;
      }
    }
    
    let data: any = null;
    let error: any = null;
    let bookingId: string | null = null;
    
    if (user) {
      const res = await supabase
        .from('bookings')
        .insert([bookingData])
        .select('id')
        .single();
      data = res.data;
      error = res.error;
      bookingId = res.data?.id || null;
    } else {
      // Guest booking - insert without returning ID (RLS limitation)
      const res = await supabase
        .from('bookings')
        .insert([bookingData]);
      error = res.error;
      // For guests, we won't have the booking ID immediately
      bookingId = null;
    }

    setLoading(false);

    if (error) {
      toast({
        title: t({ ar: "خطأ", en: "Error" }),
        description: t({ ar: "حدث خطأ في الحجز", en: "Booking failed" }),
        variant: "destructive",
      });
    } else {
      toast({
        title: t({ ar: "تم بنجاح", en: "Success" }),
        description: t({ ar: "تم إرسال حجزك بنجاح وفي انتظار التأكيد", en: "Your booking has been sent successfully and is awaiting confirmation" }),
      });
      
      // Send WhatsApp notification for authenticated user bookings only
      if (user && bookingId) {
        try {
          await supabase.functions.invoke('notify-whatsapp-group', {
            body: { bookingId }
          });
        } catch (whatsappError) {
          console.error('WhatsApp notification error:', whatsappError);
        }
      }
      
      // التوجيه بناءً على نوع المستخدم
      if (user) {
        // للمستخدمين المسجلين - توجيه فوري
        setTimeout(() => {
          navigate('/customer-dashboard');
        }, 1500);
      } else {
        // للضيوف - عرض dialog لتشجيعهم على إنشاء حساب
        setTimeout(() => {
          setShowPostBookingDialog(true);
        }, 1000);
      }
    }
  };

  if (loadingHotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

  // Render mobile version if on mobile device and theme is design2
  if (isMobile && userTheme === 'design2') {
    return (
      <MobileBooking
        hotel={hotel}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
        rooms={rooms}
        avgPricePerNight={avgPricePerNight}
        guestName={guestName}
        setGuestName={setGuestName}
        guestPhone={guestPhone}
        setGuestPhone={setGuestPhone}
        guestCountryCode={guestCountryCode}
        setGuestCountryCode={setGuestCountryCode}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        notes={notes}
        setNotes={setNotes}
        extraMeals={extraMeals}
        setExtraMeals={setExtraMeals}
        onSubmit={initiateBooking}
        loading={loading}
        fieldErrors={fieldErrors}
        paymentMethods={paymentMethods}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-8">
          {t({ ar: 'إكمال الحجز', en: 'Complete Booking', fr: 'Finaliser la réservation', es: 'Completar reserva', ru: 'Завершить бронирование', id: 'Selesaikan Pemesanan', ms: 'Lengkapkan Tempahan' })}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={initiateBooking} className="space-y-6">
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

                  {/* Booking Details - Redesigned */}
                  <div className="space-y-3">
                    {/* Dates Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <CalendarIcon className="w-5 h-5 text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground truncate">{t({ ar: 'تاريخ الوصول', en: 'Check-in' })}</p>
                          <p className="font-semibold text-sm">{format(checkIn, "dd/MM/yyyy")}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <CalendarIcon className="w-5 h-5 text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground truncate">{t({ ar: 'تاريخ المغادرة', en: 'Check-out' })}</p>
                          <p className="font-semibold text-sm">{format(checkOut, "dd/MM/yyyy")}</p>
                        </div>
                      </div>
                    </div>

                    {/* Guests Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Users className="w-5 h-5 text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground truncate">{t({ ar: 'عدد البالغين', en: 'Adults' })}</p>
                          <p className="font-semibold text-sm">{guests} {t({ ar: 'بالغ', en: 'Adult(s)' })}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Users className="w-5 h-5 text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground truncate">{t({ ar: 'عدد الأطفال', en: 'Children' })}</p>
                          <p className="font-semibold text-sm">0 {t({ ar: 'طفل', en: 'Child(ren)' })}</p>
                        </div>
                      </div>
                    </div>

                    {/* Rooms & Meals Included */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <HotelIcon className="w-5 h-5 text-primary flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground truncate">{t({ ar: 'عدد الغرف', en: 'Rooms' })}</p>
                          <p className="font-semibold text-sm">{rooms} {t({ ar: 'غرفة', en: 'Room(s)' })}</p>
                        </div>
                      </div>

                      {hotel?.meal_plans && (
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <Utensils className="w-5 h-5 text-primary flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs text-muted-foreground truncate">{t({ ar: 'الوجبات المشمولة', en: 'Meals Included' })}</p>
                            <p className="font-semibold text-sm">
                              {hotel.meal_plans.max_persons || 0} {t({ ar: 'شخص', en: 'Person(s)' })}
                            </p>
                          </div>
                        </div>
                      )}
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
                    {calculateTotal().extraMealCharge > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {t({ ar: `${extraMeals} ${extraMeals === 1 ? 'وجبة إضافية' : extraMeals === 2 ? 'وجبتين إضافيتين' : 'وجبات إضافية'}`, en: `${extraMeals} extra meal${extraMeals > 1 ? 's' : ''}` })}
                        </span>
                        <span>+{Math.round(calculateTotal().extraMealCharge)} {t({ ar: 'ر.س', en: 'SAR' })}</span>
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

              {/* Extra Meals Section - Enhanced */}
              {hotel.meal_plans && hotel.meal_plans.max_persons && (
                <Card className="card-luxury">
                  <CardHeader>
                    <CardTitle>{t({ ar: 'الوجبات', en: 'Meals' })}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">
                          {language === 'ar' ? hotel.meal_plans.regular_ar : hotel.meal_plans.regular_en}
                        </span>
                        {hotel.meal_plans.price > 0 && (
                          <span className="text-sm text-muted-foreground">
                            +{hotel.meal_plans.price} {t({ ar: 'ر.س/لليلة', en: 'SAR/night' })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t({ 
                          ar: `يشمل ${hotel.meal_plans.max_persons === 1 ? 'شخص واحد' : hotel.meal_plans.max_persons === 2 ? 'شخصين' : `${hotel.meal_plans.max_persons} أشخاص`}`, 
                          en: `Includes ${hotel.meal_plans.max_persons} ${hotel.meal_plans.max_persons === 1 ? 'person' : 'persons'}`
                        })}
                      </p>
                      
                      {hotel.meal_plans.extra_meal_price > 0 && (
                        <div className="pt-3 border-t space-y-3">
                          <Label className="block">
                            {t({ ar: 'هل تريد إضافة وجبات للأشخاص الإضافيين؟', en: 'Add extra meals for additional guests?' })}
                          </Label>
                          <Select 
                            value={extraMeals > 6 ? "custom" : extraMeals.toString()} 
                            onValueChange={(value) => {
                              if (value !== "custom") {
                                setExtraMeals(parseInt(value));
                              }
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">
                                {t({ ar: 'لا توجد وجبات إضافية', en: 'No extra meals' })}
                              </SelectItem>
                              <SelectItem value="1">
                                {t({ ar: '1 وجبة', en: '1 meal' })} (+{1 * hotel.meal_plans.extra_meal_price * nights} {t({ ar: 'ر.س', en: 'SAR' })})
                              </SelectItem>
                              <SelectItem value="2">
                                {t({ ar: '2 وجبة', en: '2 meals' })} (+{2 * hotel.meal_plans.extra_meal_price * nights} {t({ ar: 'ر.س', en: 'SAR' })})
                              </SelectItem>
                              <SelectItem value="3">
                                {t({ ar: '3 وجبات', en: '3 meals' })} (+{3 * hotel.meal_plans.extra_meal_price * nights} {t({ ar: 'ر.س', en: 'SAR' })})
                              </SelectItem>
                              <SelectItem value="4">
                                {t({ ar: '4 وجبات', en: '4 meals' })} (+{4 * hotel.meal_plans.extra_meal_price * nights} {t({ ar: 'ر.س', en: 'SAR' })})
                              </SelectItem>
                              <SelectItem value="5">
                                {t({ ar: '5 وجبات', en: '5 meals' })} (+{5 * hotel.meal_plans.extra_meal_price * nights} {t({ ar: 'ر.س', en: 'SAR' })})
                              </SelectItem>
                              <SelectItem value="6">
                                {t({ ar: '6 وجبات', en: '6 meals' })} (+{6 * hotel.meal_plans.extra_meal_price * nights} {t({ ar: 'ر.س', en: 'SAR' })})
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          
                          {/* Custom input for more than 6 meals */}
                          <div className="space-y-2">
                            <Label className="text-sm">{t({ ar: 'أو أدخل رقم آخر:', en: 'Or enter another number:' })}</Label>
                            <Input
                              type="number"
                              min="0"
                              placeholder={t({ ar: 'أدخل عدد الوجبات', en: 'Enter number of meals' })}
                              value={extraMeals > 6 ? extraMeals : ''}
                              onChange={(e) => {
                                const value = parseInt(e.target.value) || 0;
                                if (value >= 0) {
                                  setExtraMeals(value);
                                }
                              }}
                              className="w-full"
                            />
                          </div>
                          
                          <p className="text-xs text-muted-foreground">
                            {t({ 
                              ar: `${hotel.meal_plans.extra_meal_price} ر.س للوجبة الواحدة لليلة`, 
                              en: `${hotel.meal_plans.extra_meal_price} SAR per meal per night` 
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Guest Name */}
              <Card className="card-luxury">
                <CardHeader>
                  <CardTitle>{t({ ar: 'اسم الضيف', en: 'Guest Name' })}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="use-customer-name"
                          checked={useCustomerName}
                          onChange={(e) => {
                            setUseCustomerName(e.target.checked);
                            setShowNewGuestInput(false);
                            setSelectedGuestId("");
                          }}
                          className="w-4 h-4"
                        />
                        <label htmlFor="use-customer-name" className="text-sm text-muted-foreground cursor-pointer">
                          {t({ ar: 'هل اسم العميل هو نفسه اسم الضيف؟', en: 'Is the customer name the same as the guest name?' })}
                        </label>
                      </div>
                      
                      {useCustomerName && guestName && (
                        <div className="px-4 py-3 bg-primary/10 border border-primary/20 rounded-lg">
                          <p className="text-base font-semibold text-foreground">{guestName}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {user && !useCustomerName && savedGuests.length > 0 && (
                    <div className="space-y-2">
                      <Label>{t({ ar: 'اختر ضيف', en: 'Select Guest' })}</Label>
                      <Select
                        value={selectedGuestId}
                        onValueChange={(value) => {
                          if (value === "new") {
                            setShowNewGuestInput(true);
                            setSelectedGuestId("");
                            setGuestName("");
                          } else {
                            setShowNewGuestInput(false);
                            setSelectedGuestId(value);
                            const guest = savedGuests.find(g => g.id === value);
                            if (guest) {
                              setGuestName(guest.guest_name);
                              setGuestPhone(guest.guest_phone || "");
                              setGuestCountryCode(guest.guest_country_code || "+966");
                            }
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t({ ar: 'اختر ضيف', en: 'Select guest' })} />
                        </SelectTrigger>
                        <SelectContent>
                          {savedGuests.map((guest) => (
                            <SelectItem key={guest.id} value={guest.id}>
                              {guest.guest_name}
                            </SelectItem>
                          ))}
                          <SelectItem value="new">
                            {t({ ar: '+ إضافة ضيف جديد', en: '+ Add new guest' })}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {(!user || !useCustomerName) && (user ? showNewGuestInput || savedGuests.length === 0 : true) && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="guestName">
                          {t({ ar: 'اسم الضيف', en: 'Guest Name' })}
                        </Label>
                        <Input
                          ref={guestNameRef}
                          id="guestName"
                          value={guestName}
                          onChange={(e) => {
                            setGuestName(e.target.value);
                            if (fieldErrors.guestName) {
                              setFieldErrors({ ...fieldErrors, guestName: false });
                            }
                          }}
                          placeholder={t({ ar: 'أدخل اسم الضيف', en: 'Enter guest name' })}
                          required
                          className={fieldErrors.guestName ? "border-2 border-destructive focus-visible:ring-destructive" : ""}
                        />
                      </div>
                      
                      {user && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="guestPhone">
                              {t({ ar: 'رقم جوال الضيف', en: 'Guest Phone Number' })}
                            </Label>
                            <span className="text-xs text-muted-foreground">
                              ({t({ ar: 'اختياري', en: 'Optional' })})
                            </span>
                          </div>
                          <div className="flex gap-2" dir="ltr">
                            <Select
                              value={guestCountryCode}
                              onValueChange={setGuestCountryCode}
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {countries.map((country) => (
                                  <SelectItem key={country.dialCode} value={country.dialCode}>
                                    {country.dialCode}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Input
                              id="guestPhone"
                              className="flex-1"
                              value={guestPhone}
                              onChange={(e) => setGuestPhone(e.target.value)}
                              placeholder={t({ ar: 'رقم الجوال', en: 'Phone number' })}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
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
                  <Select 
                    value={paymentMethod} 
                    onValueChange={(value) => {
                      setPaymentMethod(value);
                      if (fieldErrors.paymentMethod) {
                        setFieldErrors({ ...fieldErrors, paymentMethod: false });
                      }
                    }} 
                    required
                  >
                    <SelectTrigger 
                      ref={paymentMethodRef}
                      className={fieldErrors.paymentMethod ? "border-2 border-destructive focus:ring-destructive" : ""}
                    >
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
                {loading ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" className="text-white" />
                  </div>
                ) : t({ ar: 'تأكيد الحجز', en: 'Confirm Booking' })}
              </Button>
            </form>
          </div>

          {/* Side Summary (Desktop) */}
...
        </div>
      </div>

      <BookingAuthDialog 
        open={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        onGuestContinue={handleGuestContinue}
      />

      <PostBookingAuthDialog
        open={showPostBookingDialog}
        onOpenChange={setShowPostBookingDialog}
        onSkip={() => navigate('/guest-dashboard')}
      />

      <Footer />
    </div>
  );
}
