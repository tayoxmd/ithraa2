import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Star, MapPin, ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Hotel {
  id: string;
  name_ar: string;
  name_en: string;
  description_ar: string;
  description_en: string;
  location: string;
  price_per_night: number;
  rating: number;
  images: any;
  city_name_ar?: string;
  city_name_en?: string;
}

export default function HotelDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowRight className="ml-2 w-4 h-4" />
          {t('العودة', 'Back')}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <img
              src={mainImage}
              alt={language === 'ar' ? hotel.name_ar : hotel.name_en}
              className="w-full h-[400px] object-cover rounded-2xl shadow-luxury"
            />
          </div>

          <div>
            <h1 className="text-4xl font-bold mb-4">
              {language === 'ar' ? hotel.name_ar : hotel.name_en}
            </h1>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                <Star className="w-5 h-5 text-primary fill-primary ml-1" />
                <span className="font-semibold">{hotel.rating}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <MapPin className="w-4 h-4 ml-1" />
                <span>{hotel.location}</span>
              </div>
            </div>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              {language === 'ar' ? hotel.description_ar : hotel.description_en}
            </p>

            <Card className="card-luxury mb-6">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary">
                    {hotel.price_per_night} {t('ر.س', 'SAR')}
                  </span>
                  <span className="text-muted-foreground">
                    {t('لليلة الواحدة', 'per night')}
                  </span>
                </div>
                

                <Button 
                  className="w-full btn-luxury"
                  onClick={() => navigate(`/booking/${hotel.id}`)}
                >
                  {t('احجز الآن', 'Book Now')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
