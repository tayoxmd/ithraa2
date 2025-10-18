import { useEffect, useState } from "react";
import logo3D from "@/assets/logo-3d.png";
import vocoMakkah1 from "@/assets/slideshow/voco-makkah-1.webp";
import vocoMakkah2 from "@/assets/slideshow/voco-makkah-2.webp";
import rafflesMakkah from "@/assets/slideshow/raffles-makkah.jpg";
import makkahView from "@/assets/slideshow/makkah-view.jpg";
import pullmanZamzam from "@/assets/slideshow/pullman-zamzam.jpg";
import madinah from "@/assets/slideshow/madinah.jpg";
import rafflesSuite from "@/assets/slideshow/raffles-suite.jpg";
import holySite from "@/assets/slideshow/holy-site.jpg";
import kaaba from "@/assets/slideshow/kaaba.jpeg";

const slides = [
  { image: kaaba, title: "الكعبة المشرفة" },
  { image: holySite, title: "المسجد الحرام" },
  { image: madinah, title: "المسجد النبوي" },
  { image: makkahView, title: "برج الساعة" },
  { image: vocoMakkah1, title: "فنادق فاخرة" },
  { image: vocoMakkah2, title: "إطلالات مميزة" },
  { image: rafflesMakkah, title: "رافلز مكة" },
  { image: pullmanZamzam, title: "بولمان زمزم" },
  { image: rafflesSuite, title: "أجنحة فاخرة" },
];

export const HeroSlideshow = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showLogo, setShowLogo] = useState(true);

  useEffect(() => {
    // Slideshow timer - 5 seconds per slide
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    // Logo animation - show for 3 seconds at start, then hide
    const logoTimer = setTimeout(() => {
      setShowLogo(false);
    }, 3000);

    // Show logo again every 30 seconds for 3 seconds
    const logoInterval = setInterval(() => {
      setShowLogo(true);
      setTimeout(() => setShowLogo(false), 3000);
    }, 30000);

    return () => {
      clearInterval(slideInterval);
      clearInterval(logoInterval);
      clearTimeout(logoTimer);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0">
      {/* Slideshow Images */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>
      ))}

      {/* 3D Animated Logo */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ${
          showLogo ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ zIndex: 10 }}
      >
        <div className="relative">
          {/* Glow Effect */}
          <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-yellow-400/30 via-yellow-500/40 to-yellow-600/30 animate-pulse" />
          
          {/* 3D Logo with Rotation */}
          <img
            src={logo3D}
            alt="جوار الحرم - شعار"
            className="relative w-64 h-64 md:w-80 md:h-80 object-contain animate-[spin_20s_linear_infinite] drop-shadow-2xl"
            style={{
              filter: "drop-shadow(0 0 40px rgba(251, 191, 36, 0.6)) drop-shadow(0 0 80px rgba(251, 191, 36, 0.4))",
              transform: "perspective(1000px) rotateY(0deg)",
              animation: "logoFloat 6s ease-in-out infinite, logoRotate 20s linear infinite"
            }}
          />
        </div>
      </div>

      {/* Slide Indicator Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/75"
            }`}
          />
        ))}
      </div>

      <style>{`
        @keyframes logoFloat {
          0%, 100% {
            transform: perspective(1000px) translateY(0) rotateX(0deg);
          }
          50% {
            transform: perspective(1000px) translateY(-20px) rotateX(10deg);
          }
        }

        @keyframes logoRotate {
          0% {
            transform: perspective(1000px) rotateY(0deg);
          }
          100% {
            transform: perspective(1000px) rotateY(360deg);
          }
        }
      `}</style>
    </div>
  );
};
