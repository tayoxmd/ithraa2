import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Wifi, Coffee, Utensils, ChevronLeft, ChevronRight, Bus, MapPinned, Bed } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { BedIcon } from "@/components/BedIcons";

interface HotelCardProps {
  id: string;
  name: string;
  nameEn: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  images?: string[];
  featured?: boolean;
  meal_plans?: {
    regular_ar?: string;
    regular_en?: string;
    ramadan_ar?: string;
    ramadan_en?: string;
    price?: number;
    max_persons?: number;
    extra_meal_price?: number;
    name_ar?: string;
    name_en?: string;
  } | any[] | null;
  amenities?: {
    wifi?: boolean;
    cafe?: boolean;
    restaurant?: boolean;
    parking?: boolean;
    shuttle?: boolean;
    walking_distance?: number | null;
    walking_distance_unit?: 'm' | 'km';
  };
  bed_type_single?: 'single' | 'king' | 'twin' | 'double' | string;
  bed_type_double?: 'king' | 'twin' | 'double' | string;
  max_guests_per_room?: number;
}

export function HotelCard({ 
  id, name, nameEn, location, price, rating, image, images, featured, 
  meal_plans, amenities, bed_type_single, bed_type_double, max_guests_per_room 
}: HotelCardProps) {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const isMobile = useIsMobile();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mealBadgeSettings, setMealBadgeSettings] = useState({
    color: '#007dff',
    width: 150,
    height: 32,
    fontSize: 12,
    borderRadius: 8,
  });
  
  const hotelImages = images && Array.isArray(images) && images.length > 0 ? images : [image];

  useEffect(() => {
    async function fetchMealBadgeSettings() {
      const { data } = await supabase
        .from('site_settings')
        .select('meal_badge_color, meal_badge_width, meal_badge_height, meal_badge_font_size, meal_badge_border_radius')
        .maybeSingle();
      
      if (data) {
        setMealBadgeSettings({
          color: data.meal_badge_color || '#007dff',
          width: data.meal_badge_width || 150,
          height: data.meal_badge_height || 32,
          fontSize: data.meal_badge_font_size || 12,
          borderRadius: data.meal_badge_border_radius || 8,
        });
      }
    }
    fetchMealBadgeSettings();
  }, []);
  
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + hotelImages.length) % hotelImages.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % hotelImages.length);
  };

  const getBedTypeLabel = () => {
    const arOrEn = (ar: string, en: string) => (language === 'ar' ? ar : en);

    if (max_guests_per_room === 1) {
      const labels: Record<string, { ar: string; en: string }> = {
        single: { ar: 'سرير مفرد', en: 'Single Bed' },
        king: { ar: 'سرير كينج', en: 'King Bed' },
        twin: { ar: 'سريران مفردان', en: 'Twin Beds' },
        double: { ar: 'سرير مزدوج', en: 'Double Bed' },
      };
      const key = String(bed_type_single || '').toLowerCase();
      const found = labels[key];
      return found ? arOrEn(found.ar, found.en) : arOrEn('إشغال فردي', 'Single occupancy');
    }

    if (max_guests_per_room === 2) {
      const labels: Record<string, { ar: string; en: string }> = {
        king: { ar: 'سرير كينج', en: 'King Bed' },
        twin: { ar: 'سريران مفردان', en: 'Twin Beds' },
        double: { ar: 'سرير مزدوج', en: 'Double Bed' },
      };
      const key = String(bed_type_double || '').toLowerCase();
      const found = labels[key];
      return found ? arOrEn(found.ar, found.en) : arOrEn('إشغال لشخصين', 'Double occupancy');
    }

    return null;
  };

  const getBedTypeIcon = () => {
    const isSingleOcc = max_guests_per_room === 1;
    if (isSingleOcc) {
      const key = String(bed_type_single || '').toLowerCase();
      if (key === 'twin') return <BedIcon type="twin" className="w-4 h-4" />;
      if (key === 'king' || key === 'double') return <BedIcon type="king" className="w-4 h-4" />;
      return <Bed className="w-4 h-4" />;
    }

    if (max_guests_per_room === 2) {
      const key = String(bed_type_double || '').toLowerCase();
      if (key === 'twin') return <BedIcon type="twin" className="w-4 h-4" />;
      if (key === 'king' || key === 'double') return <BedIcon type="king" className="w-4 h-4" />;
      return <Bed className="w-4 h-4" />;
    }

    return null;
  };

  // Normalize meal plans to a consistent shape
  const normalizeMealPlan = (mp: any) => {
    if (!mp) return null;
    try {
      if (Array.isArray(mp)) {
        const m = mp[0];
        if (!m) return null;
        return {
          name_ar: m.name_ar || m.regular_ar || '',
          name_en: m.name_en || m.regular_en || '',
          max_persons: Number(m.max_persons || 0),
          extra_meal_price: Number((m.extra_price ?? m.extra_meal_price) || 0),
        };
      }
      if (typeof mp === 'object') {
        return {
          name_ar: mp.regular_ar || mp.name_ar || '',
          name_en: mp.regular_en || mp.name_en || '',
          max_persons: Number(mp.max_persons || 0),
          extra_meal_price: Number((mp.extra_meal_price ?? mp.extra_price) || 0),
        };
      }
    } catch {}
    return null;
  };

  const meal = normalizeMealPlan(meal_plans);
  const mealIncluded = !!(meal && ((meal.name_ar && meal.name_ar.trim() !== '' && !meal.name_ar.includes('بدون') && !meal.name_ar.includes('لا يتضمن')) || (meal.name_en && meal.name_en.trim() !== '' && !/room only/i.test(meal.name_en))));

  // Mobile Layout (horizontal card with image on left)
  if (isMobile) {
    return (
      <Card 
        className="overflow-hidden hover-lift cursor-pointer group animate-fade-in bg-card shadow-card border border-border/50 rounded-2xl"
        onClick={() => navigate(`/hotel/${id}`)}
      >
        <div className="flex h-40">
          {/* Image Section - Left Side */}
          <div className="relative w-1/3 flex-shrink-0">
            <img
              src={hotelImages[currentImageIndex]}
              alt={name}
              className="w-full h-full object-cover"
            />
            
            {/* Image Counter */}
            {hotelImages.length > 1 && (
              <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-foreground px-2 py-0.5 rounded text-xs font-semibold">
                {currentImageIndex + 1}/{hotelImages.length}
              </div>
            )}

            {/* Meal Badge - Top Right on Image */}
            {mealIncluded && (
              <div className="absolute top-2 right-2 bg-green-500 px-2 py-1 rounded text-white text-[10px] font-bold">
                <Utensils className="w-3 h-3 inline mr-0.5" />
                {language === 'ar' ? 'يشمل وجبة' : 'Meal Included'}
              </div>
            )}
          </div>

          {/* Content Section - Right Side */}
          <CardContent className="p-3 flex-1 flex flex-col justify-between">
            {/* Title & Rating */}
            <div>
              <h3 className="text-sm font-bold text-primary mb-0.5 line-clamp-1">{name}</h3>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  <span className="line-clamp-1">{location}</span>
                </div>
                <div className="flex items-center gap-0.5 bg-card/95 px-1.5 py-0.5 rounded-full">
                  <Star className="w-3 h-3 fill-primary text-primary" />
                  <span className="text-xs font-bold">{rating}</span>
                </div>
              </div>

              {/* Bed Type */}
              {(max_guests_per_room === 1 || max_guests_per_room === 2) && getBedTypeLabel() && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  {getBedTypeIcon()}
                  <span>{getBedTypeLabel()}</span>
                </div>
              )}
            </div>

            {/* Price & CTA */}
            <div className="flex items-center justify-between pt-2 border-t border-border">
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-bold text-primary">{price}</span>
                <span className="text-[10px] text-muted-foreground">ريال/ليلة</span>
              </div>
              <Button 
                size="sm" 
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-7 text-xs px-3"
              >
                احجز
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }
  
  // Desktop/Tablet Layout (vertical card)
  return (
    <Card className="overflow-hidden hover-lift cursor-pointer group animate-fade-in w-full max-w-md mx-auto bg-card shadow-card border border-border/50 rounded-2xl flex flex-col min-h-[520px]">
      {/* Image */}
      <div className="relative h-64 overflow-hidden flex-shrink-0" onClick={() => navigate(`/hotel/${id}`)}>
        <img
          src={hotelImages[currentImageIndex]}
          alt={name}
          className="w-full h-full object-cover transition-all duration-300"
        />
        
        {/* Image Counter - Always visible top left */}
        {hotelImages.length > 1 && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-lg text-sm font-semibold">
            {String(currentImageIndex + 1).padStart(2, '0')}
            <span className="text-muted-foreground text-xs"> / {String(hotelImages.length).padStart(2, '0')}</span>
          </div>
        )}
        
        {/* Meal Badge - Prominent Green Badge on Image */}
        {mealIncluded && (
          <div 
            className="absolute top-4 right-4 px-4 py-2 rounded-lg text-white text-sm font-bold flex items-center gap-2 shadow-xl"
            style={{ backgroundColor: '#10b981' }}
          >
            <Utensils className="w-5 h-5" />
            {language === 'ar' ? (meal?.name_ar || 'يشمل وجبة') : (meal?.name_en || 'Meal Included')}
          </div>
        )}
        
        {featured && (
          <Badge className="absolute top-16 right-4 bg-gradient-luxury border-0 shadow-luxury">
            عرض مميز
          </Badge>
        )}
        
        <div className="absolute bottom-4 left-4 bg-card/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
          <Star className="w-4 h-4 fill-primary text-primary" />
          <span className="text-sm font-bold">{rating}</span>
        </div>
        
        {/* Next Image Button - Only if multiple images */}
        {hotelImages.length > 1 && (
          <Button
            size="icon"
            variant="ghost"
            className={`absolute ${language === 'ar' ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 h-10 w-10 rounded-md bg-white/90 hover:bg-white backdrop-blur-sm shadow-lg transition-all`}
            onClick={handleNextImage}
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </Button>
        )}
      </div>

      <CardContent className="p-4 flex flex-col flex-1">
        {/* Title */}
        <div className="mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-primary mb-0.5 truncate">{name}</h3>
            <p className="text-xs text-muted-foreground truncate">{nameEn}</p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1.5 text-muted-foreground mb-3">
          <MapPin className="w-3.5 h-3.5" />
          <span className="text-xs">{location}</span>
        </div>

        {/* Bed Type - Only show if 2 guests */}
        {bed_type_double && max_guests_per_room === 2 && (
          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
            {getBedTypeIcon()}
            <span>{getBedTypeLabel()}</span>
          </div>
        )}

        {/* Amenities */}
        <div className="flex items-center gap-2.5 mb-3 flex-wrap">
          {amenities?.wifi && <Wifi className="w-4 h-4 text-muted-foreground" />}
          {amenities?.cafe && <Coffee className="w-4 h-4 text-muted-foreground" />}
          {amenities?.restaurant && <Utensils className="w-4 h-4 text-muted-foreground" />}
          {amenities?.parking && (
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-muted-foreground text-xs font-bold">
              P
            </div>
          )}
          {amenities?.shuttle && <Bus className="w-4 h-4 text-muted-foreground" />}
          {amenities?.walking_distance && amenities.walking_distance > 0 && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPinned className="w-4 h-4" />
              <span>{amenities.walking_distance} {amenities.walking_distance_unit === 'km' ? (language === 'ar' ? 'كم' : 'km') : (language === 'ar' ? 'م' : 'm')}</span>
            </div>
          )}
        </div>

        {/* Meal Details Badge - Under Amenities */}
        {mealIncluded && meal && (
          <div className="mb-3 p-2 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 text-xs">
              <Utensils className="w-4 h-4 text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <p className="font-semibold text-green-700 dark:text-green-300">
                  {language === 'ar' ? meal.name_ar : meal.name_en}
                </p>
                {meal.max_persons > 0 && (
                  <p className="text-green-600 dark:text-green-400 mt-0.5">
                    {language === 'ar' 
                      ? `يشمل ${meal.max_persons} ${meal.max_persons === 1 ? 'شخص واحد' : meal.max_persons === 2 ? 'شخصين' : meal.max_persons >= 3 && meal.max_persons <= 10 ? 'أشخاص' : 'شخص'}`
                      : `Includes ${meal.max_persons} ${meal.max_persons === 1 ? 'person' : 'persons'}`
                    }
                    {meal.extra_meal_price > 0 && (
                      <span className="block text-[10px] mt-0.5">
                        {language === 'ar' 
                          ? `الوجبة الإضافية: ${meal.extra_meal_price} ر.س/لليلة`
                          : `Extra meal: ${meal.extra_meal_price} SAR/night`
                        }
                      </span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}


        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-primary">{price}</span>
              <span className="text-xs text-muted-foreground">ريال / ليلة</span>
            </div>
          </div>
          <Button 
            size="sm" 
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground h-8 text-sm px-4"
            onClick={() => navigate(`/hotel/${id}`)}
          >
            احجز الآن
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}