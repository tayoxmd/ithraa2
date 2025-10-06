import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Star, MapPin, ArrowRight, Navigation } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ImageGallery } from "@/components/ImageGallery";

interface Hotel {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  location: string;
  location_url?: string;
  price_per_night: number;
  rating: number;
  images: any;
  city_name_ar?: string;
  city_name_en?: string;
}

export default function HotelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);

  // Get search parameters from URL or localStorage
  const searchParams = new URLSearchParams(location.search);
  const checkIn = searchParams.get('checkIn') || localStorage.getItem('searchCheckIn') || format(new Date(), 'yyyy-MM-dd');
  const checkOut = searchParams.get('checkOut') || localStorage.getItem('searchCheckOut') || format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');
  const guests = searchParams.get('guests') || localStorage.getItem('searchGuests') || '2';
  const rooms = searchParams.get('rooms') || localStorage.getItem('searchRooms') || '1';

  useEffect(() => {
    async function fetchHotel() {
      const { data, error } = await supabase.rpc('get_public_hotel', {
        p_hotel_id: id
      });

      if (error) {
        console.error('Error fetching hotel:', error);
      }
      
      if (data && data.length > 0) setHotel(data[0]);
      setLoading(false);
    }
    fetchHotel();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t('جاري التحميل...', 'Loading...')}
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t('الفندق غير موجود', 'Hotel not found')}
      </div>
    );
  }

  const mainImage = hotel.images && hotel.images[0] 
    ? hotel.images[0] 
    : "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000";

  const hotelImages = hotel.images && Array.isArray(hotel.images) && hotel.images.length > 0 
    ? hotel.images 
    : [mainImage];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4 text-white hover:text-primary"
        >
          <ArrowRight className="ml-2 w-4 h-4" />
          {t('العودة', 'Back')}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="relative group">
              <img
                src={mainImage}
                alt={language === 'ar' ? hotel.name_ar : hotel.name_en}
                className="w-full h-[400px] object-cover rounded-2xl shadow-luxury cursor-pointer"
                onClick={() => {
                  setGalleryIndex(0);
                  setGalleryOpen(true);
                }}
              />
              {hotelImages.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm backdrop-blur-sm">
                  {hotelImages.length} {t({ ar: 'صورة', en: 'images' })}
                </div>
              )}
            </div>
            {hotelImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {hotelImages.slice(1, 5).map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${language === 'ar' ? hotel.name_ar : hotel.name_en} ${idx + 2}`}
                    className="w-full h-20 object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      setGalleryIndex(idx + 1);
                      setGalleryOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              {language === 'ar' ? hotel.name_ar : hotel.name_en}
            </h1>
            
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <div className="flex items-center bg-white/10 px-3 py-1.5 rounded-full">
                <Star className="w-4 h-4 text-primary fill-primary ml-1" />
                <span className="font-semibold text-white text-sm">{hotel.rating}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="w-4 h-4 ml-1" />
                <span className="text-sm">{hotel.location}</span>
              </div>
              {hotel.location_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(hotel.location_url, '_blank')}
                  className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Navigation className="w-4 h-4" />
                  {t('عرض الموقع', 'View Location')}
                </Button>
              )}
            </div>

            <p className="text-sm md:text-base text-muted-foreground mb-6 leading-relaxed">
              {language === 'ar' ? hotel.description_ar : hotel.description_en}
            </p>

            <Card className="card-luxury mb-6">
              <CardContent className="p-4 md:p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      {hotel.price_per_night} {t('ر.س', 'SAR')}
                    </span>
                    <span className="text-muted-foreground">
                      {t('لليلة الواحدة', 'per night')}
                    </span>
                  </div>

                  {checkIn && checkOut && rooms && (() => {
                    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
                    const roomsCount = parseInt(rooms) || 1;
                    const guestsCount = parseInt(guests) || 2;
                    const maxGuestsIncluded = ((hotel as any).max_guests_per_room || 2) * roomsCount;
                    
                    // Get tax rate (0 means no tax)
                    const taxRate = ((hotel as any).tax_percentage && (hotel as any).tax_percentage > 0) ? (hotel as any).tax_percentage : 0;
                    
                    // Calculate base price
                    let subtotal = hotel.price_per_night * nights * roomsCount;
                    
                    let extraGuestCharge = 0;
                    let extraGuests = 0;
                    
                    // Calculate extra guests charge
                    if (guestsCount > maxGuestsIncluded) {
                      extraGuests = guestsCount - maxGuestsIncluded;
                      const extraGuestPrice = (hotel as any).extra_guest_price || 0;
                      extraGuestCharge = extraGuests * extraGuestPrice * nights;
                    }
                    
                    // Calculate tax on total before tax
                    const totalBeforeTax = subtotal + extraGuestCharge;
                    const tax = taxRate > 0 ? (totalBeforeTax * taxRate / 100) : 0;
                    const finalTotal = totalBeforeTax + tax;
                    
                    return (
                      <div className="pt-2 border-t space-y-1">
                        <p className="text-xs text-foreground/70">
                          {t('السعر الأساسي', 'Base Price')}: {Math.round(subtotal)} {t('ر.س', 'SAR')}
                        </p>
                        {extraGuests > 0 && (
                          <p className="text-xs text-foreground/70">
                            {t('أشخاص إضافيين', 'Extra Guests')}: +{Math.round(extraGuestCharge)} {t('ر.س', 'SAR')} ({extraGuests} {extraGuests === 1 ? t('شخص', 'person') : t('أشخاص', 'persons')})
                          </p>
                        )}
                        {tax > 0 && (
                          <p className="text-xs text-foreground/70">
                            {t('الضريبة', 'Tax')} ({taxRate}%): +{Math.round(tax)} {t('ر.س', 'SAR')}
                          </p>
                        )}
                        <p className="text-sm font-bold text-primary pt-1 border-t">
                          {t('الإجمالي', 'Total')}: {Math.round(finalTotal)} {t('ر.س', 'SAR')}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          ({nights} {t('ليلة', 'nights')} × {roomsCount} {t('غرفة', 'rooms')})
                        </p>
                      </div>
                    );
                  })()}
                </div>

                <Button 
                  className="w-full btn-luxury mt-4"
                  onClick={() => navigate(`/booking/${hotel.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&rooms=${rooms}`)}
                >
                  {t({ ar: 'احجز الآن', en: 'Book Now' })}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ImageGallery
        images={hotelImages}
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        initialIndex={galleryIndex}
      />

      <Footer />
    </div>
  );
}
