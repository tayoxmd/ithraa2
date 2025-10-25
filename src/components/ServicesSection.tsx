import { Card } from "@/components/ui/card";
import { Plane, Compass, Globe, FileText } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const services = [
  {
    icon: Plane,
    titleAr: "خدمات النقل والمواصلات",
    titleEn: "Transportation Services",
    descriptionAr: "نوفر خدمات نقل موثوقة ومريحة من وإلى المطار والفنادق",
    descriptionEn: "We provide reliable and comfortable transportation from/to airports and hotels",
    gradient: "from-primary/20 to-purple-500/20"
  },
  {
    icon: Compass,
    titleAr: "خدمات العمرة والحج",
    titleEn: "Umrah & Hajj Services",
    descriptionAr: "باقات شاملة لأداء مناسك العمرة والحج بكل يسر وراحة",
    descriptionEn: "Comprehensive packages for Umrah and Hajj rituals with ease and comfort",
    gradient: "from-emerald-500/20 to-teal-500/20"
  },
  {
    icon: Globe,
    titleAr: "السياحة الداخلية والخارجية",
    titleEn: "Domestic & International Tourism",
    descriptionAr: "برامج سياحية متنوعة داخل وخارج المملكة لتجربة لا تُنسى",
    descriptionEn: "Diverse tourism programs inside and outside the Kingdom for unforgettable experiences",
    gradient: "from-blue-500/20 to-cyan-500/20"
  },
  {
    icon: FileText,
    titleAr: "خدمات التأشيرات",
    titleEn: "Visa Services",
    descriptionAr: "إصدار وتجديد التأشيرات بسهولة وسرعة فائقة",
    descriptionEn: "Issue and renew visas with ease and speed",
    gradient: "from-orange-500/20 to-amber-500/20"
  }
];

export function ServicesSection() {
  const { language, t } = useLanguage();

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          <span className="text-gradient-luxury">{t("خدماتنا", "Our Services")}</span>
        </h2>
        <p className="text-muted-foreground">
          {t("نقدم مجموعة متكاملة من الخدمات السياحية المتميزة", "We offer a complete range of distinguished tourism services")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {services.map((service, index) => {
          const Icon = service.icon;
          return (
            <Card 
              key={index}
              className={`group p-6 hover:shadow-elegant transition-all duration-300 cursor-pointer bg-gradient-to-br ${service.gradient} border-primary/10 hover:border-primary/30`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
                    {language === "ar" ? service.titleAr : service.titleEn}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? service.descriptionAr : service.descriptionEn}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}