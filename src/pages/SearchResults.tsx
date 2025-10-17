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
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

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
        {/* Search Box Card - Inspired by reference design */}
        <Card className="mb-6 shadow-lg border-2" ref={searchBoxRef}>
          <CardContent className="p-4">
            <Collapsible open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold">
                  {t({ ar: 'تعديل البحث', en: 'Edit Search' })}
                </h2>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    {isSearchOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
              </div>
              
              {!isSearchOpen && (
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  <span>{checkIn && format(new Date(checkIn), 'dd MMM', { locale: ar })}</span>
                  <span>-</span>
                  <span>{checkOut && format(new Date(checkOut), 'dd MMM', { locale: ar })}</span>
                  <span>•</span>
                  <span>{guests} {t({ ar: 'بالغ', en: 'adults' })}</span>
                  <span>•</span>
                  <span>{rooms} {t({ ar: 'غرفة', en: 'room' })}</span>
                </div>
              )}
              
              <CollapsibleContent className="mt-4">
                <SearchBox 
                  initialValues={{ 
                    city: cityId,
                    checkIn,
                    checkOut,
                    guests,
                    rooms
                  }}
                  onSearch={() => {
                    setIsSearchOpen(false);
                    searchBoxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                />
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {t({ ar: `تم العثور على ${filteredHotels.length} فندق`, en: `Found ${filteredHotels.length} hotels` })}
          </p>
        </div>

        {/* Filters Bar - Mobile Friendly */}
        <div className="mb-6 flex items-center gap-2 flex-wrap bg-card p-3 rounded-lg border">
          {/* Sort Dropdown */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover text-popover-foreground z-50">
              <SelectItem value="recommended">{t({ ar: 'موصى به', en: 'Recommended' })}</SelectItem>
              <SelectItem value="price_low">{t({ ar: 'السعر ↑', en: 'Price ↑' })}</SelectItem>
              <SelectItem value="price_high">{t({ ar: 'السعر ↓', en: 'Price ↓' })}</SelectItem>
              <SelectItem value="rating">{t({ ar: 'التقييم', en: 'Rating' })}</SelectItem>
            </SelectContent>
          </Select>

          {/* Rating Filter */}
          <Select value={minRating.toString()} onValueChange={(v) => setMinRating(Number(v))}>
            <SelectTrigger className="w-[100px] h-9 text-xs">
              <SelectValue placeholder={t({ ar: 'التقييم', en: 'Rating' })} />
            </SelectTrigger>
            <SelectContent className="bg-popover text-popover-foreground z-50">
              <SelectItem value="0">{t({ ar: 'الكل', en: 'All' })}</SelectItem>
              <SelectItem value="3">3+ ⭐</SelectItem>
              <SelectItem value="4">4+ ⭐</SelectItem>
              <SelectItem value="4.5">4.5+ ⭐</SelectItem>
            </SelectContent>
          </Select>

          {/* Spacer */}
          <div className="flex-1" />
          
          {/* Filter Button */}
          <Button
            variant={isFilterOpen ? 'default' : 'outline'}
            size="sm"
            className="h-9 gap-1.5"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-xs">{t({ ar: 'الفلترة', en: 'Filter' })}</span>
          </Button>

        </div>

        {/* Advanced Filters Panel */}
        {isFilterOpen && (
          <Card className="mb-6 shadow-lg">
            <CardContent className="pt-6 space-y-6">
              <h3 className="text-lg font-bold mb-4">{t({ ar: 'الفلترة', en: 'Filters' })}</h3>
              
              {/* Price Range */}
              <div>
                <Label className="text-base font-semibold mb-3 block">{t({ ar: 'نطاق السعر', en: 'Price Range' })}</Label>
                <div className="flex gap-3 mb-3">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">{t({ ar: 'من', en: 'From' })}</Label>
                    <Input 
                      type="number" 
                      value={priceRange[0]} 
                      onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      className="mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">{t({ ar: 'إلى', en: 'To' })}</Label>
                    <Input 
                      type="number" 
                      value={priceRange[1]} 
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 5000])}
                      className="mt-1"
                    />
                  </div>
                </div>
                <Slider
                  min={0}
                  max={5000}
                  step={50}
                  value={priceRange}
                  onValueChange={(value) => setPriceRange(value as [number, number])}
                  className="mt-2"
                />
              </div>

              {/* Rating Filter with Radio-like interface */}
              <div>
                <Label className="text-base font-semibold mb-3 block">{t({ ar: 'أدنى تقييم', en: 'Minimum Rating' })}</Label>
                <div className="flex gap-2">
                  {[0, 3, 4, 4.5, 5].map((rating) => (
                    <Button
                      key={rating}
                      variant={minRating === rating ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setMinRating(rating)}
                      className="flex-1"
                    >
                      {rating === 0 ? t({ ar: 'الكل', en: 'All' }) : `${rating}⭐`}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Amenities with larger checkboxes */}
              <div>
                <Label className="text-base font-semibold mb-3 block">{t({ ar: 'توفر الوجبات', en: 'Meal Availability' })}</Label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                    <Checkbox
                      id="meal_plans"
                      checked={selectedAmenities.includes('meal_plans')}
                      onCheckedChange={() => toggleAmenity('meal_plans')}
                      className="h-5 w-5"
                    />
                    <span className="text-sm">{t({ ar: 'الإفطار', en: 'Breakfast' })}</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                    <Checkbox
                      id="restaurant"
                      checked={selectedAmenities.includes('restaurant')}
                      onCheckedChange={() => toggleAmenity('restaurant')}
                      className="h-5 w-5"
                    />
                    <span className="text-sm">{t({ ar: 'الغداء', en: 'Lunch' })}</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                    <Checkbox
                      id="cafe"
                      checked={selectedAmenities.includes('cafe')}
                      onCheckedChange={() => toggleAmenity('cafe')}
                      className="h-5 w-5"
                    />
                    <span className="text-sm">{t({ ar: 'العشاء', en: 'Dinner' })}</span>
                  </label>
                </div>
              </div>

              {/* Additional Amenities */}
              <div>
                <Label className="text-base font-semibold mb-3 block">{t({ ar: 'المرافق', en: 'Facilities' })}</Label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                    <Checkbox
                      id="wifi"
                      checked={selectedAmenities.includes('wifi')}
                      onCheckedChange={() => toggleAmenity('wifi')}
                      className="h-5 w-5"
                    />
                    <span className="text-sm">{t({ ar: 'واي فاي مجاني', en: 'Free WiFi' })}</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                    <Checkbox
                      id="parking"
                      checked={selectedAmenities.includes('parking')}
                      onCheckedChange={() => toggleAmenity('parking')}
                      className="h-5 w-5"
                    />
                    <span className="text-sm">{t({ ar: 'مواقف سيارات', en: 'Parking' })}</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors">
                    <Checkbox
                      id="shuttle"
                      checked={selectedAmenities.includes('shuttle')}
                      onCheckedChange={() => toggleAmenity('shuttle')}
                      className="h-5 w-5"
                    />
                    <span className="text-sm">{t({ ar: 'مسبح', en: 'Swimming Pool' })}</span>
                  </label>
                </div>
              </div>

              {/* Reset Button */}
              {(sortBy !== 'recommended' || minRating > 0 || selectedAmenities.length > 0 || priceRange[0] !== 0 || priceRange[1] !== 5000) && (
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
              )}
            </CardContent>
          </Card>
        )}

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
