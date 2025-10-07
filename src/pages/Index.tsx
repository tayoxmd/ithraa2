import { Header } from "@/components/Header";
import { SearchBox } from "@/components/SearchBox";
import { HotelCard } from "@/components/HotelCard";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import heroImage1 from "@/assets/hero-background-1.jpg";
import heroImage2 from "@/assets/hero-background-2.jpg";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";

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
}

const Index = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { language } = useLanguage();

  const heroImages = [heroImage1, heroImage2];

  useEffect(() => {
    fetchFeaturedHotels();

    // Auto-switch images every 7 seconds
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  const fetchFeaturedHotels = async () => {
    try {
      const { data, error } = await supabase.rpc("get_public_hotels", {
        p_city_id: null,
        p_active_only: true,
      });

      if (error) throw error;
      if (data) {
        // First get pinned hotels, then sort remaining by rating and limit to 7 total
        const pinnedHotels = data.filter((h: any) => h.pinned_to_homepage);
        const unpinnedHotels = data.filter((h: any) => !h.pinned_to_homepage);
        const sortedUnpinned = unpinnedHotels.sort((a: any, b: any) => b.rating - a.rating);
        const finalHotels = [...pinnedHotels, ...sortedUnpinned].slice(0, 7);
        setHotels(finalHotels);
      }
    } catch (error) {
      console.error("Error fetching hotels:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      جوار الحرم
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center pt-20 md:pt-32">
        {/* Background Images with Fade Effect */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Luxury Hotel ${index + 1}`}
              className={`absolute w-full h-full object-cover transition-opacity duration-1000 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>
        جوار الحرم
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6 drop-shadow-lg">جوار ناصر البيك</h1>
            <p className="text-xl text-primary/90 max-w-2xl mx-auto drop-shadow-md">
              احجز أفضل الفنادق والشقق الفندقية بأسعار تنافسية وخدمة استثنائية
            </p>
          </div>

          {/* Search Box */}
          <SearchBox />
        </div>
      </section>
      {/* Featured Hotels Section */}
      <section className="container mx-auto px-4 py-16" id="hotels">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-gradient-luxury">الفنادق المميزة</span>
          </h2>
          <p className="text-muted-foreground text-lg">اختر من بين مجموعة مختارة من أفضل الفنادق والشقق الفندقية</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {hotels.map((hotel, index) => (
              <div key={hotel.id} style={{ animationDelay: `${index * 100}ms` }} className="animate-fade-in-up">
                <HotelCard
                  id={hotel.id}
                  name={language === "ar" ? hotel.name_ar : hotel.name_en}
                  nameEn={hotel.name_en}
                  location={`${language === "ar" ? hotel.city_name_ar : hotel.city_name_en}`}
                  price={Number(hotel.price_per_night)}
                  rating={Number(hotel.rating)}
                  image={
                    hotel.images && hotel.images[0]
                      ? hotel.images[0]
                      : "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000"
                  }
                  images={hotel.images}
                  featured={index < 2}
                  meal_plans={hotel.meal_plans}
                  amenities={hotel.amenities}
                />
              </div>
            ))}
          </div>
        )}
      </section>
      {/* About Section */}
      <section className="container mx-auto px-4 py-16" id="about">
        <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <span className="text-gradient-luxury">لماذا إثراء؟</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            نحن في إثراء نؤمن بأن كل رحلة يجب أن تكون تجربة استثنائية. نوفر لك أفضل الخيارات من الفنادق والشقق الفندقية
            الفاخرة بأسعار تنافسية وخدمة عملاء متميزة على مدار الساعة.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-2 gap-6 mt-12 max-w-2xl mx-auto">
            <div className="card-luxury p-6">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">فندق وشقة فندقية</p>
            </div>
            <div className="card-luxury p-6">
              <div className="text-4xl font-bold text-primary mb-2">4.8</div>
              <p className="text-muted-foreground">تقييم العملاء</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Index;
