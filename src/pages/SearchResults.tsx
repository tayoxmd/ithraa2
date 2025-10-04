import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Star, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { SearchBox } from "@/components/SearchBox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface Hotel {
  id: string;
  name_ar: string;
  name_en: string;
  location: string;
  price_per_night: number;
  rating: number;
  images: any;
  description_ar: string;
  description_en: string;
}

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const cityId = searchParams.get('city');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const guests = searchParams.get('guests');
  const rooms = searchParams.get('rooms');
  
  // Store search params in localStorage for persistence
  useEffect(() => {
    if (checkIn) localStorage.setItem('searchCheckIn', checkIn);
    if (checkOut) localStorage.setItem('searchCheckOut', checkOut);
    if (guests) localStorage.setItem('searchGuests', guests);
    if (rooms) localStorage.setItem('searchRooms', rooms);
  }, [checkIn, checkOut, guests, rooms]);

  useEffect(() => {
    async function fetchHotels() {
      const { data, error } = await supabase.rpc('get_public_hotels', {
        p_city_id: cityId || null,
        p_active_only: true
      });

      if (error) {
        console.error('Error fetching hotels:', error);
      }
      
      if (data) setHotels(data);
      setLoading(false);
    }
    fetchHotels();
  }, [cityId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {t({ ar: 'جاري التحميل...', en: 'Loading...', fr: 'Chargement...', es: 'Cargando...', ru: 'Загрузка...', id: 'Memuat...', ms: 'Memuatkan...' })}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-6">
          <Collapsible open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {t({ ar: 'نتائج البحث', en: 'Search Results', fr: 'Résultats de recherche', es: 'Resultados de búsqueda', ru: 'Результаты поиска', id: 'Hasil Pencarian', ms: 'Hasil Carian' })}
                </h1>
                <p className="text-muted-foreground">
                  {t({ ar: `تم العثور على ${hotels.length} فندق`, en: `Found ${hotels.length} hotels`, fr: `${hotels.length} hôtels trouvés`, es: `Se encontraron ${hotels.length} hoteles`, ru: `Найдено отелей: ${hotels.length}`, id: `Ditemukan ${hotels.length} hotel`, ms: `Ditemui ${hotels.length} hotel` })}
                </p>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  {isSearchOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {t({ ar: 'تعديل خيارات البحث', en: 'Edit Search Options' })}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="mb-8">
              <div className="scale-95 origin-top">
                <SearchBox initialValues={{ 
                  city: cityId,
                  checkIn,
                  checkOut,
                  guests,
                  rooms
                }} />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map((hotel) => {
            const mainImage = hotel.images && hotel.images[0] 
              ? hotel.images[0] 
              : "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000";

            return (
              <Card key={hotel.id} className="card-luxury hover-lift cursor-pointer overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={mainImage}
                    alt={language === 'ar' ? hotel.name_ar : hotel.name_en}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                    <Star className="w-3 h-3 ml-1 fill-current" />
                    {hotel.rating}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-xl font-bold mb-2">
                    {language === 'ar' ? hotel.name_ar : hotel.name_en}
                  </h3>
                  <div className="flex items-center text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4 ml-1" />
                    <span className="text-sm">{hotel.location}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {language === 'ar' ? hotel.description_ar : hotel.description_en}
                  </p>
                  <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-primary">
                        {(() => {
                          const taxRate = (hotel as any).tax_percentage || 15;
                          const priceWithTax = hotel.price_per_night * (1 + taxRate / 100);
                          return Math.round(priceWithTax);
                        })()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {t({ ar: 'ر.س / ليلة', en: 'SAR / night' })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {t({ ar: 'السعر شامل الضريبة', en: 'Price includes tax' })}
                    </p>
                    {checkIn && checkOut && rooms && guests && (
                      <p className="text-xs text-foreground/80 mt-1 font-medium">
                        {(() => {
                          const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
                          const roomsCount = parseInt(rooms) || 1;
                          const guestsCount = parseInt(guests) || 2;
                          const maxGuestsIncluded = ((hotel as any).max_guests_per_room || 2) * roomsCount;
                          
                          const taxRate = (hotel as any).tax_percentage || 15;
                          const priceWithTax = hotel.price_per_night * (1 + taxRate / 100);
                          let subtotal = priceWithTax * nights * roomsCount;
                          
                          // Add extra guests charge
                          if (guestsCount > maxGuestsIncluded) {
                            const extraGuests = guestsCount - maxGuestsIncluded;
                            const extraGuestPrice = (hotel as any).extra_guest_price || 0;
                            const extraCharge = extraGuests * extraGuestPrice * nights * (1 + taxRate / 100);
                            subtotal += extraCharge;
                          }
                          
                          return `${t({ ar: 'الإجمالي', en: 'Total' })}: ${Math.round(subtotal).toLocaleString()} ${t({ ar: 'ر.س', en: 'SAR' })} (${nights} ${t({ ar: 'ليلة', en: 'nights' })} × ${roomsCount} ${t({ ar: 'غرفة', en: 'rooms' })})`;
                        })()}
                      </p>
                    )}
                  </div>
                    <Button 
                      className="btn-luxury"
                      onClick={() => {
                        const params = new URLSearchParams();
                        if (checkIn) params.set('checkIn', checkIn);
                        if (checkOut) params.set('checkOut', checkOut);
                        if (guests) params.set('guests', guests);
                        if (rooms) params.set('rooms', rooms);
                        navigate(`/hotel/${hotel.id}?${params.toString()}`);
                      }}
                    >
                      {t({ ar: 'عرض التفاصيل', en: 'View Details', fr: 'Voir les détails', es: 'Ver detalles', ru: 'Подробности', id: 'Lihat Detail', ms: 'Lihat Butiran' })}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {hotels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {t({ ar: 'لم يتم العثور على نتائج', en: 'No results found', fr: 'Aucun résultat trouvé', es: 'No se encontraron resultados', ru: 'Результаты не найдены', id: 'Tidak ada hasil ditemukan', ms: 'Tiada hasil ditemui' })}
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
