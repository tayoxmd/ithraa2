import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Star, MapPin, ChevronDown, ChevronUp, SlidersHorizontal } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { HotelCard } from "@/components/HotelCard";
import { SearchBox } from "@/components/SearchBox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

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
  meal_plans?: {
    regular_ar: string;
    regular_en: string;
    ramadan_ar?: string;
    ramadan_en?: string;
    price: number;
    max_persons: number;
    extra_meal_price: number;
  } | null;
  amenities?: any;
  location_url?: string;
}

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  const cityId = searchParams.get('city');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const guests = searchParams.get('guests');
  const rooms = searchParams.get('rooms');

  // Filter states
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  
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
      
      if (data) {
        setHotels(data);
        setFilteredHotels(data);
        
        // Set initial price range based on actual hotel prices
        if (data.length > 0) {
          const prices = data.map((h: Hotel) => h.price_per_night);
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          setPriceRange([minPrice, maxPrice]);
        }
      }
      setLoading(false);
    }
    fetchHotels();
  }, [cityId]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...hotels];

    // Filter by price
    result = result.filter(h => 
      h.price_per_night >= priceRange[0] && h.price_per_night <= priceRange[1]
    );

    // Filter by rating
    if (minRating > 0) {
      result = result.filter(h => h.rating >= minRating);
    }

    // Filter by amenities
    if (selectedAmenities.length > 0) {
      result = result.filter(h => {
        if (!h.amenities) return false;
        return selectedAmenities.every(amenity => h.amenities[amenity] === true);
      });
    }

    // Filter by meal plans
    if (selectedAmenities.includes('meal_plans')) {
      result = result.filter(h => h.meal_plans !== null);
    }

    // Sort
    switch (sortBy) {
      case 'price_low':
        result.sort((a, b) => a.price_per_night - b.price_per_night);
        break;
      case 'price_high':
        result.sort((a, b) => b.price_per_night - a.price_per_night);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'distance':
        // Would need distance calculation - placeholder for now
        break;
      default:
        // Keep original order (recommended)
        break;
    }

    setFilteredHotels(result);
  }, [hotels, sortBy, priceRange, selectedAmenities, minRating]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
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
                <h1 className="text-3xl font-bold mb-2">
                  {t({ ar: 'نتائج البحث', en: 'Search Results' })}
                </h1>
                <p className="text-muted-foreground">
                  {t({ ar: `تم العثور على ${filteredHotels.length} فندق`, en: `Found ${filteredHotels.length} hotels` })}
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
                <SearchBox 
                  initialValues={{ 
                    city: cityId,
                    checkIn,
                    checkOut,
                    guests,
                    rooms
                  }}
                  onSearch={() => {
                    searchBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Filters Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <div className="flex items-center justify-between mb-4">
                <CollapsibleTrigger asChild>
                  <Button variant="outline" size="icon" className="w-10 h-10">
                    <SlidersHorizontal className="w-5 h-5" />
                  </Button>
                </CollapsibleTrigger>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex-1">
                  <Label>{t({ ar: 'ترتيب حسب', en: 'Sort By' })}</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recommended">{t({ ar: 'موصى به', en: 'Recommended' })}</SelectItem>
                      <SelectItem value="price_low">{t({ ar: 'السعر: من الأقل للأعلى', en: 'Price: Low to High' })}</SelectItem>
                      <SelectItem value="price_high">{t({ ar: 'السعر: من الأعلى للأقل', en: 'Price: High to Low' })}</SelectItem>
                      <SelectItem value="rating">{t({ ar: 'التقييم', en: 'Rating' })}</SelectItem>
                      <SelectItem value="distance">{t({ ar: 'القرب من المنطقة المركزية', en: 'Proximity to Central Area' })}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <CollapsibleContent className="space-y-6">
                {/* Price Range */}
                <div>
                  <Label>{t({ ar: 'نطاق السعر', en: 'Price Range' })}</Label>
                  <div className="pt-4 pb-2">
                    <Slider
                      min={0}
                      max={5000}
                      step={50}
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{priceRange[0]} {t({ ar: 'ريال', en: 'SAR' })}</span>
                    <span>{priceRange[1]} {t({ ar: 'ريال', en: 'SAR' })}</span>
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <Label>{t({ ar: 'الحد الأدنى للتقييم', en: 'Minimum Rating' })}</Label>
                  <Select value={minRating.toString()} onValueChange={(v) => setMinRating(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">{t({ ar: 'الكل', en: 'All' })}</SelectItem>
                      <SelectItem value="3">3+ ⭐</SelectItem>
                      <SelectItem value="4">4+ ⭐</SelectItem>
                      <SelectItem value="4.5">4.5+ ⭐</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Amenities Filter */}
                <div>
                  <Label className="mb-3 block">{t({ ar: 'المرافق والخدمات', en: 'Amenities' })}</Label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="wifi"
                        checked={selectedAmenities.includes('wifi')}
                        onCheckedChange={() => toggleAmenity('wifi')}
                      />
                      <label htmlFor="wifi" className="cursor-pointer">
                        {t({ ar: 'واي فاي', en: 'WiFi' })}
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="parking"
                        checked={selectedAmenities.includes('parking')}
                        onCheckedChange={() => toggleAmenity('parking')}
                      />
                      <label htmlFor="parking" className="cursor-pointer">
                        {t({ ar: 'مواقف سيارات', en: 'Parking' })}
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="restaurant"
                        checked={selectedAmenities.includes('restaurant')}
                        onCheckedChange={() => toggleAmenity('restaurant')}
                      />
                      <label htmlFor="restaurant" className="cursor-pointer">
                        {t({ ar: 'مطعم', en: 'Restaurant' })}
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="cafe"
                        checked={selectedAmenities.includes('cafe')}
                        onCheckedChange={() => toggleAmenity('cafe')}
                      />
                      <label htmlFor="cafe" className="cursor-pointer">
                        {t({ ar: 'مقهى', en: 'Cafe' })}
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="shuttle"
                        checked={selectedAmenities.includes('shuttle')}
                        onCheckedChange={() => toggleAmenity('shuttle')}
                      />
                      <label htmlFor="shuttle" className="cursor-pointer">
                        {t({ ar: 'خدمة النقل', en: 'Shuttle Service' })}
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="meal_plans"
                        checked={selectedAmenities.includes('meal_plans')}
                        onCheckedChange={() => toggleAmenity('meal_plans')}
                      />
                      <label htmlFor="meal_plans" className="cursor-pointer">
                        {t({ ar: 'وجبات طعام', en: 'Meal Plans' })}
                      </label>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSortBy('recommended');
                    setPriceRange([0, 5000]);
                    setSelectedAmenities([]);
                    setMinRating(0);
                  }}
                >
                  {t({ ar: 'إعادة تعيين الفلاتر', en: 'Reset Filters' })}
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
          {filteredHotels.map((hotel) => (
            <div key={hotel.id} className="w-full">
              <HotelCard
              key={hotel.id}
              id={hotel.id}
              name={language === 'ar' ? hotel.name_ar : hotel.name_en}
              nameEn={hotel.name_en}
              location={hotel.location}
              price={Number(hotel.price_per_night)}
              rating={Number(hotel.rating)}
              image={hotel.images && hotel.images[0] ? hotel.images[0] : "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000"}
              images={hotel.images}
              meal_plans={hotel.meal_plans}
              amenities={hotel.amenities}
            />
            </div>
          ))}
        </div>

        {filteredHotels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {t({ ar: 'لم يتم العثور على نتائج تطابق معايير البحث', en: 'No results found matching your criteria' })}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSortBy('recommended');
                setPriceRange([0, 5000]);
                setSelectedAmenities([]);
                setMinRating(0);
              }}
            >
              {t({ ar: 'إعادة تعيين الفلاتر', en: 'Reset Filters' })}
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
