import { Header } from "@/components/Header";
import { SearchBox } from "@/components/SearchBox";
import { HotelCard } from "@/components/HotelCard";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-hotel.jpg";

const featuredHotels = [
  {
    id: 1,
    name: "فندق الريتز كارلتون",
    nameEn: "The Ritz-Carlton",
    location: "الرياض، المملكة العربية السعودية",
    price: 850,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000",
    featured: true,
  },
  {
    id: 2,
    name: "فندق فور سيزونز",
    nameEn: "Four Seasons Hotel",
    location: "جدة، المملكة العربية السعودية",
    price: 750,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000",
    featured: true,
  },
  {
    id: 3,
    name: "منتجع وسبا الفيصلية",
    nameEn: "Al Faisaliah Resort & Spa",
    location: "الرياض، المملكة العربية السعودية",
    price: 680,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1000",
    featured: false,
  },
  {
    id: 4,
    name: "فندق روزوود",
    nameEn: "Rosewood Hotel",
    location: "جدة، المملكة العربية السعودية",
    price: 920,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000",
    featured: false,
  },
  {
    id: 5,
    name: "شقق ماريوت الفندقية",
    nameEn: "Marriott Executive Apartments",
    location: "الدمام، المملكة العربية السعودية",
    price: 550,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000",
    featured: false,
  },
  {
    id: 6,
    name: "فندق حياة ريجنسي",
    nameEn: "Hyatt Regency",
    location: "الخبر، المملكة العربية السعودية",
    price: 620,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1000",
    featured: false,
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center pt-20">
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
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="text-center mb-12 animate-fade-in">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 ml-1" />
              تجربة فاخرة في الحجز الفندقي
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              اكتشف وجهتك المثالية
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
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
          <p className="text-muted-foreground text-lg">
            اختر من بين مجموعة مختارة من أفضل الفنادق والشقق الفندقية
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredHotels.map((hotel, index) => (
            <div
              key={hotel.id}
              style={{ animationDelay: `${index * 100}ms` }}
              className="animate-fade-in-up"
            >
              <HotelCard {...hotel} />
            </div>
          ))}
        </div>
      </section>

      {/* Special Offers Section */}
      <section className="bg-gradient-to-br from-primary/5 to-accent/10 py-16" id="offers">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gradient-luxury">العروض الحصرية</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              عروض خاصة وخصومات مذهلة على حجوزاتك
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="card-luxury p-8 text-center hover-lift animate-scale-in">
              <div className="w-16 h-16 rounded-full bg-gradient-luxury mx-auto mb-4 flex items-center justify-center shadow-luxury">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">خصم 25%</h3>
              <p className="text-muted-foreground mb-4">على جميع الحجوزات لأول مرة</p>
              <Badge className="bg-gradient-luxury border-0">عرض محدود</Badge>
            </div>

            <div className="card-luxury p-8 text-center hover-lift animate-scale-in" style={{ animationDelay: '100ms' }}>
              <div className="w-16 h-16 rounded-full bg-gradient-luxury mx-auto mb-4 flex items-center justify-center shadow-luxury">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3">احجز 3 ليالٍ واحصل على 1 مجاناً</h3>
              <p className="text-muted-foreground mb-4">عرض خاص على الإقامات الطويلة</p>
              <Badge className="bg-gradient-luxury border-0">الأكثر طلباً</Badge>
            </div>
          </div>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="card-luxury p-6">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <p className="text-muted-foreground">فندق وشقة فندقية</p>
            </div>
            <div className="card-luxury p-6">
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <p className="text-muted-foreground">عميل سعيد</p>
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
