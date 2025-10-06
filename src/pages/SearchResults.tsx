import { useEffect, useState, useRef } from "react";
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
  const searchBoxRef = useRef<HTMLDivElement>(null);

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
        <div className="mb-6" ref={searchBoxRef}>
          <Collapsible open={isSearchOpen} onOpenChange={setIsSearchOpen}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-2 text-white">
                  {t({ ar: 'نتائج البحث', en: 'Search Results', fr: 'Résultats de recherche', es: 'Resultados de búsqueda', ru: 'Результаты поиска', id: 'Hasil Pencarian', ms: 'Hasil Carian' })}
                </h1>
                <p className="text-sm md:text-base text-muted-foreground">
                  {t({ ar: `تم العثور على ${hotels.length} فندق`, en: `Found ${hotels.length} hotels`, fr: `${hotels.length} hôtels trouvés`, es: `Se encontraron ${hotels.length} hoteles`, ru: `Найдено отелей: ${hotels.length}`, id: `Ditemukan ${hotels.length} hotel`, ms: `Ditemui ${hotels.length} hotel` })}
                </p>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2 bg-white/10 border-white/20 text-white">
                  {isSearchOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {t({ ar: 'تعديل البحث', en: 'Edit Search' })}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="mb-8">
              <div className="scale-95 origin-top">
                <SearchBox 
                  initialValues={{ 
                    city: cityId,
                    checkIn,
                    checkOut,
                    guests,
                    rooms
                  }}
                  onSearch={() => {
                    // Scroll to the search box (top of collapsible)
                    searchBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                />
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
              <Card key={hotel.id} className="card-luxury hover-lift cursor-pointer overflow-hidden rounded-2xl group">
                <div className="relative h-56">
                  <img
                    src={mainImage}
                    alt={language === 'ar' ? hotel.name_ar : hotel.name_en}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <Badge className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm border-0 text-white">
                    <Star className="w-3 h-3 ml-1 fill-primary text-primary" />
                    {hotel.rating}
                  </Badge>
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-base md:text-lg font-bold text-white mb-1">
                      {language === 'ar' ? hotel.name_ar : hotel.name_en}
                    </h3>
                    <div className="flex items-center text-white/90 text-sm">
                      <MapPin className="w-3 h-3 ml-1" />
                      <span>{hotel.location}</span>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl md:text-2xl font-bold text-white">
                        {Math.round(hotel.price_per_night)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t({ ar: 'ر.س / ليلة', en: 'SAR / night' })}
                      </span>
                    </div>
                    {checkIn && checkOut && rooms && guests && (() => {
                      const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
                      const roomsCount = parseInt(rooms) || 1;
                      const guestsCount = parseInt(guests) || 2;
                      const maxGuestsIncluded = ((hotel as any).max_guests_per_room || 2) * roomsCount;
                      
                      const taxRate = (hotel as any).tax_percentage || 0;
                      let subtotal = hotel.price_per_night * nights * roomsCount;
                      
                      let extraGuestCharge = 0;
                      let extraGuests = 0;
                      
                      // Calculate extra guests charge
                      if (guestsCount > maxGuestsIncluded) {
                        extraGuests = guestsCount - maxGuestsIncluded;
                        const extraGuestPrice = (hotel as any).extra_guest_price || 0;
                        extraGuestCharge = extraGuests * extraGuestPrice * nights;
                        subtotal += extraGuestCharge;
                      }
                      
                      // Add tax only if tax_percentage > 0
                      const tax = taxRate > 0 ? subtotal * (taxRate / 100) : 0;
                      const total = subtotal + tax;
                      
                      return (
                        <>
                          {extraGuests > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              +{Math.round(extraGuestCharge)} {t({ ar: 'ريال', en: 'SAR' })} ({extraGuests} {extraGuests === 1 ? t({ ar: 'شخص إضافي', en: 'extra guest' }) : t({ ar: 'أشخاص إضافيين', en: 'extra guests' })})
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1 font-medium">
                            {t({ ar: 'الإجمالي', en: 'Total' })}: {Math.round(total).toLocaleString()} {t({ ar: 'ر.س', en: 'SAR' })} ({nights} {t({ ar: 'ليلة', en: 'nights' })} × {roomsCount} {t({ ar: 'غرفة', en: 'rooms' })})
                          </p>
                          {taxRate > 0 && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {t({ ar: 'شامل ضريبة', en: 'Including tax' })} {taxRate}%
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>
                    <Button 
                      size="sm"
                      className="btn-luxury rounded-lg"
                      onClick={() => {
                        const params = new URLSearchParams();
                        if (checkIn) params.set('checkIn', checkIn);
                        if (checkOut) params.set('checkOut', checkOut);
                        if (guests) params.set('guests', guests);
                        if (rooms) params.set('rooms', rooms);
                        navigate(`/hotel/${hotel.id}?${params.toString()}`);
                      }}
                    >
                      {t({ ar: 'احجز', en: 'Book' })}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {hotels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-base md:text-lg">
              {t({ ar: 'لم يتم العثور على نتائج', en: 'No results found', fr: 'Aucun résultat trouvé', es: 'No se encontraron resultados', ru: 'Результаты не найдены', id: 'Tidak ada hasil ditemukan', ms: 'Tiada hasil ditemui' })}
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
