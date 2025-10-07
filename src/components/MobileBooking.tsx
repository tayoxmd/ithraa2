import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { Calendar, Users, Minus, Plus, CreditCard, ArrowLeft } from "lucide-react";
import { countries } from "@/data/countries";

interface MobileBookingProps {
  hotel: any;
  checkIn: Date;
  checkOut: Date;
  guests: string;
  rooms: string;
  avgPricePerNight: number | null;
  guestName: string;
  setGuestName: (name: string) => void;
  guestPhone: string;
  setGuestPhone: (phone: string) => void;
  guestCountryCode: string;
  setGuestCountryCode: (code: string) => void;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  extraMeals: number;
  setExtraMeals: (meals: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  fieldErrors: {[key: string]: boolean};
  paymentMethods: any[];
}

export function MobileBooking({
  hotel,
  checkIn,
  checkOut,
  guests,
  rooms,
  avgPricePerNight,
  guestName,
  setGuestName,
  guestPhone,
  setGuestPhone,
  guestCountryCode,
  setGuestCountryCode,
  paymentMethod,
  setPaymentMethod,
  notes,
  setNotes,
  extraMeals,
  setExtraMeals,
  onSubmit,
  loading,
  fieldErrors,
  paymentMethods,
}: MobileBookingProps) {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [numGuests, setNumGuests] = useState(parseInt(guests) || 2);
  const [numChildren, setNumChildren] = useState(0);
  const [numRooms, setNumRooms] = useState(parseInt(rooms) || 1);

  const calculateTotal = () => {
    if (!hotel) return { total: 0, nights: 0 };
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    if (nights <= 0) return { total: 0, nights: 0 };
    
    const roomsCount = numRooms;
    const guestsCount = numGuests + numChildren;
    const taxRate = (hotel.tax_percentage && hotel.tax_percentage > 0) ? hotel.tax_percentage : 0;
    const pricePerNight = avgPricePerNight !== null ? avgPricePerNight : hotel.price_per_night;
    const basePrice = pricePerNight * nights * roomsCount;
    
    const maxGuestsIncluded = (hotel.max_guests_per_room || 2) * roomsCount;
    let extraGuestCharge = 0;
    
    if (guestsCount > maxGuestsIncluded) {
      const extraGuestsCount = guestsCount - maxGuestsIncluded;
      extraGuestCharge = extraGuestsCount * (hotel.extra_guest_price || 0) * nights;
    }
    
    let extraMealCharge = 0;
    if (hotel.meal_plans && extraMeals > 0) {
      const extraMealPrice = hotel.meal_plans.extra_meal_price || 0;
      extraMealCharge = extraMeals * extraMealPrice * nights;
    }
    
    const subtotalBeforeTax = basePrice + extraGuestCharge + extraMealCharge;
    const tax = taxRate > 0 ? (subtotalBeforeTax * taxRate / 100) : 0;
    const total = subtotalBeforeTax + tax;
    
    return { total, nights };
  };

  const { total, nights } = calculateTotal();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary-glow pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">
            {t({ ar: 'تفاصيل الحجز', en: 'Booking Details' })}
          </h1>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Hotel Card */}
        <Card className="overflow-hidden shadow-lg">
          <CardContent className="p-0">
            <div className="flex gap-3 p-4">
              <img
                src={hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945"}
                alt={language === 'ar' ? hotel.name_ar : hotel.name_en}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-bold text-sm mb-1">
                  {language === 'ar' ? hotel.name_ar : hotel.name_en}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">{hotel.location}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-primary font-bold">
                    ${avgPricePerNight !== null ? Math.round(avgPricePerNight) : hotel.price_per_night}
                  </span>
                  <span className="text-muted-foreground">
                    {t({ ar: '٣ ليالي', en: '3 nights' })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Schedule */}
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-3">
              {t({ ar: 'جدول الحجز', en: 'Booking Schedule' })}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/30 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">
                  {t({ ar: 'تسجيل الدخول', en: 'Check In' })}
                </p>
                <p className="text-sm font-semibold">{format(checkIn, "dd MMM yyyy")}</p>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">
                  {t({ ar: 'تسجيل الخروج', en: 'Check Out' })}
                </p>
                <p className="text-sm font-semibold">{format(checkOut, "dd MMM yyyy")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guest & Room */}
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-3">
              {t({ ar: 'الضيوف والغرف', en: 'Guest & Room' })}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {t({ ar: 'البالغون', en: 'Adults' })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t({ ar: 'فوق 14 سنة', en: 'Over 14 years' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setNumGuests(Math.max(1, numGuests - 1))}
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-semibold">{numGuests}</span>
                  <button
                    type="button"
                    onClick={() => setNumGuests(numGuests + 1)}
                    className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {t({ ar: 'الأطفال', en: 'Child' })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t({ ar: 'تحت 14 سنة', en: 'Under 14 years' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setNumChildren(Math.max(0, numChildren - 1))}
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-semibold">{numChildren}</span>
                  <button
                    type="button"
                    onClick={() => setNumChildren(numChildren + 1)}
                    className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {t({ ar: 'الغرف', en: 'Room' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setNumRooms(Math.max(1, numRooms - 1))}
                    className="w-8 h-8 rounded-full bg-muted flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-semibold">{numRooms}</span>
                  <button
                    type="button"
                    onClick={() => setNumRooms(numRooms + 1)}
                    className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Details */}
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-3">
              {t({ ar: 'تفاصيل الاتصال', en: 'Contact Details' })}
            </h3>
            <div className="space-y-3">
              <div>
                <Label className="text-xs mb-1.5 block">
                  {t({ ar: 'الاسم الكامل', en: 'Full Name' })}
                </Label>
                <Input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className={`h-10 ${fieldErrors.guestName ? 'border-destructive' : ''}`}
                  placeholder={language === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                />
              </div>

              <div>
                <Label className="text-xs mb-1.5 block">
                  {t({ ar: 'رقم الهاتف', en: 'Phone Number' })}
                </Label>
                <div className="flex gap-2">
                  <Select value={guestCountryCode} onValueChange={setGuestCountryCode}>
                    <SelectTrigger className="w-24 h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.dialCode}>
                          {country.dialCode}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="flex-1 h-10"
                    placeholder="123456789"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-3">
              {t({ ar: 'طريقة الدفع', en: 'Payment Method' })}
            </h3>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className={`h-10 ${fieldErrors.paymentMethod ? 'border-destructive' : ''}`}>
                <SelectValue placeholder={language === 'ar' ? 'اختر طريقة الدفع' : 'Select payment method'} />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    {language === 'ar' ? method.name : method.nameEn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card className="shadow-lg">
          <CardContent className="p-4">
            <Label className="text-xs mb-1.5 block">
              {t({ ar: 'ملاحظات إضافية', en: 'Additional Notes' })}
            </Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-20 resize-none"
              placeholder={language === 'ar' ? 'أضف أي ملاحظات...' : 'Add any notes...'}
            />
          </CardContent>
        </Card>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">
            {t({ ar: 'المجموع', en: 'Total' })}
          </span>
          <span className="text-xl font-bold text-primary">
            ${Math.round(total)}
          </span>
        </div>
        <Button
          onClick={onSubmit}
          disabled={loading}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl"
        >
          {loading ? t({ ar: 'جاري الحجز...', en: 'Booking...' }) : t({ ar: 'احجز الآن', en: 'Book Now' })}
        </Button>
      </div>
    </div>
  );
}
