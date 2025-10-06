import { Header } from "@/components/Header";
import { SearchBox } from "@/components/SearchBox";
import { HotelCard } from "@/components/HotelCard";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-hotel.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface Hotel {
  id: string;
  name_ar: string;
  name_en: string;
  location: string;
  price_per_night: number;
  rating: number;
  images: any;
  city_name_ar: string;
  city_name_en: string;
}

const Index = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    fetchFeaturedHotels();
  }, []);

  const fetchFeaturedHotels = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_public_hotels', {
          p_city_id: null,
          p_active_only: true
        });

      if (error) throw error;
      if (data) {
        // Sort by rating and limit to 6
        const sortedData = data.sort((a: any, b: any) => b.rating - a.rating).slice(0, 6);
        setHotels(sortedData);
      }
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center pt-16">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Luxury Hotel"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-2xl leading-tight">
              استمتع بإجازة أحلامك
            </h1>
            <p className="text-base md:text-lg lg:text-xl text-white/95 max-w-2xl mx-auto drop-shadow-lg">
              احجز الفنادق والرحلات وباقات الإقامة بأفضل الأسعار
            </p>
          </div>

          {/* Search Box */}
          <SearchBox />
        </div>
      </section>

      {/* Featured Hotels Section */}
      <section className="container mx-auto px-4 py-20" id="hotels">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">
            الفنادق الشائعة
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">جاري التحميل...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hotels.map((hotel, index) => (
              <div
                key={hotel.id}
                style={{ animationDelay: `${index * 100}ms` }}
                className="animate-fade-in-up"
              >
                <HotelCard
                  id={hotel.id}
                  name={language === 'ar' ? hotel.name_ar : hotel.name_en}
                  nameEn={hotel.name_en}
                  location={`${language === 'ar' ? hotel.city_name_ar : hotel.city_name_en}`}
                  price={Number(hotel.price_per_night)}
                  rating={Number(hotel.rating)}
                  image={hotel.images && hotel.images[0] ? hotel.images[0] : "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000"}
                  images={hotel.images}
                  featured={index < 2}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* About Section */}
      <section className="container mx-auto px-4 py-16" id="about">
        <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            لماذا إثراء؟
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-12">
            نحن في إثراء نؤمن بأن كل رحلة يجب أن تكون تجربة استثنائية. نوفر لك أفضل الخيارات من الفنادق والشقق الفندقية
            الفاخرة بأسعار تنافسية وخدمة عملاء متميزة على مدار الساعة.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="card-luxury p-8 hover-lift">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">500+</div>
              <p className="text-sm md:text-base text-muted-foreground">فندق وشقة فندقية</p>
            </div>
            <div className="card-luxury p-8 hover-lift">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">50K+</div>
              <p className="text-sm md:text-base text-muted-foreground">عميل سعيد</p>
            </div>
            <div className="card-luxury p-8 hover-lift">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">4.8</div>
              <p className="text-sm md:text-base text-muted-foreground">تقييم العملاء</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
