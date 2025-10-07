import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Wifi, Coffee, Utensils, ChevronLeft, ChevronRight, Bus, MapPinned } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

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
    regular_ar: string;
    regular_en: string;
    ramadan_ar?: string;
    ramadan_en?: string;
    price: number;
    max_persons: number;
    extra_meal_price: number;
  } | null;
  amenities?: {
    wifi?: boolean;
    cafe?: boolean;
    restaurant?: boolean;
    parking?: boolean;
    shuttle?: boolean;
    walking_distance?: number | null;
    walking_distance_unit?: 'm' | 'km';
  };
}

export function HotelCard({ id, name, nameEn, location, price, rating, image, images, featured, meal_plans, amenities }: HotelCardProps) {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
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
  
  return (
    <Card className="card-luxury overflow-hidden hover-lift cursor-pointer group animate-fade-in">
      {/* Image */}
      <div className="relative h-56 overflow-hidden" onClick={() => navigate(`/hotel/${id}`)}>
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
        
        {/* Meal Badge */}
        {meal_plans && meal_plans.regular_ar && meal_plans.regular_ar !== "لا يتضمن وجبات" && meal_plans.regular_en !== "Room Only" && (
          <div 
            className={`absolute ${language === 'ar' ? 'left-4' : 'right-4'} top-16`}
            style={{
              backgroundColor: mealBadgeSettings.color,
              width: `${mealBadgeSettings.width}px`,
              height: `${mealBadgeSettings.height}px`,
              borderRadius: `${mealBadgeSettings.borderRadius}px`,
              fontSize: `${mealBadgeSettings.fontSize}px`,
            }}
          >
            <div className="flex items-center justify-center h-full px-2 text-white font-semibold text-center">
              <Utensils className="w-3 h-3 ml-1" />
              {language === 'ar' ? meal_plans.regular_ar : meal_plans.regular_en}
            </div>
          </div>
        )}
        
        {featured && (
          <Badge className="absolute top-4 right-4 bg-gradient-luxury border-0 shadow-luxury">
            عرض مميز
          </Badge>
        )}
        <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
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

      <CardContent className="p-5">
        {/* Title */}
        <div className="mb-3 flex items-start gap-2 justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground mb-1">{name}</h3>
            <p className="text-sm text-muted-foreground">{nameEn}</p>
          </div>
          {/* Small Meal Badge - Next to hotel name */}
          {meal_plans && meal_plans.regular_ar && meal_plans.regular_ar !== "لا يتضمن وجبات" && meal_plans.regular_en !== "Room Only" && (
            <div 
              className={`px-2 py-1 rounded text-white text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1 ${language === 'ar' ? 'mr-auto' : 'ml-auto'}`}
              style={{ backgroundColor: mealBadgeSettings.color }}
            >
              <Utensils className="w-3 h-3" />
              {language === 'ar' ? 'يشمل وجبات' : 'Meals Included'}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{location}</span>
        </div>

        {/* Amenities */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
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

        {/* Meal Info */}
        {meal_plans && meal_plans.regular_ar && meal_plans.regular_ar !== "لا يتضمن وجبات" && meal_plans.regular_en !== "Room Only" && meal_plans.max_persons > 0 && (
          <div 
            className="text-xs mb-3 px-2 py-1 rounded inline-flex items-center gap-1"
            style={{ 
              backgroundColor: `${mealBadgeSettings.color}20`,
              color: mealBadgeSettings.color,
            }}
          >
            <Utensils className="w-3 h-3" />
            {language === 'ar' 
              ? `${meal_plans.regular_ar} - يشمل ${meal_plans.max_persons} ${meal_plans.max_persons === 1 ? 'شخص' : meal_plans.max_persons === 2 ? 'شخصين' : 'أشخاص'}`
              : `${meal_plans.regular_en} - Includes ${meal_plans.max_persons} ${meal_plans.max_persons === 1 ? 'person' : 'persons'}`
            }
          </div>
        )}

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">{price}</span>
              <span className="text-sm text-muted-foreground">ريال / ليلة</span>
            </div>
          </div>
          <Button 
            size="sm" 
            className="btn-luxury"
            onClick={() => navigate(`/hotel/${id}`)}
          >
            احجز الآن
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
