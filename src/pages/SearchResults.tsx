import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Star, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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

  const cityId = searchParams.get('city');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const guests = searchParams.get('guests');

  useEffect(() => {
    async function fetchHotels() {
      let query = supabase
        .from('hotels')
        .select('*')
        .eq('active', true);

      if (cityId) {
        query = query.eq('city_id', cityId);
      }

      const { data } = await query;
      
      if (data) setHotels(data);
      setLoading(false);
    }
    fetchHotels();
  }, [cityId]);

  if (loading) {
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
        <h1 className="text-3xl font-bold mb-2">
          {t('نتائج البحث', 'Search Results')}
        </h1>
        <p className="text-muted-foreground mb-8">
          {t(`تم العثور على ${hotels.length} فندق`, `Found ${hotels.length} hotels`)}
        </p>

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
                      <span className="text-2xl font-bold text-primary">{hotel.price_per_night}</span>
                      <span className="text-sm text-muted-foreground mr-1">
                        {t('ر.س / ليلة', 'SAR / night')}
                      </span>
                    </div>
                    <Button 
                      className="btn-luxury"
                      onClick={() => navigate(`/hotel/${hotel.id}`)}
                    >
                      {t('عرض التفاصيل', 'View Details')}
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
              {t('لم يتم العثور على نتائج', 'No results found')}
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
