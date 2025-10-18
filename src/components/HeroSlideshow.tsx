import { useEffect, useState } from "react";
import logoWithBg from "@/assets/logo-with-bg.png";
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
            src={logoWithBg}
            alt="إثراء - شعار"
            className="relative w-72 h-72 md:w-96 md:h-96 object-contain drop-shadow-2xl"
            style={{
              filter: "drop-shadow(0 0 50px rgba(251, 191, 36, 0.8)) drop-shadow(0 0 100px rgba(251, 191, 36, 0.5))",
              transform: "perspective(1200px) rotateY(0deg)",
              animation: "logoFloat3D 8s ease-in-out infinite, logoRotate3D 25s linear infinite, logoPulse 4s ease-in-out infinite"
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
        @keyframes logoFloat3D {
          0%, 100% {
            transform: perspective(1200px) translateY(0) translateZ(0) rotateX(0deg);
          }
          25% {
            transform: perspective(1200px) translateY(-30px) translateZ(50px) rotateX(15deg);
          }
          50% {
            transform: perspective(1200px) translateY(-40px) translateZ(80px) rotateX(25deg);
          }
          75% {
            transform: perspective(1200px) translateY(-30px) translateZ(50px) rotateX(15deg);
          }
        }

        @keyframes logoRotate3D {
          0% {
            transform: perspective(1200px) rotateY(0deg) rotateZ(0deg);
          }
          33% {
            transform: perspective(1200px) rotateY(120deg) rotateZ(10deg);
          }
          66% {
            transform: perspective(1200px) rotateY(240deg) rotateZ(-10deg);
          }
          100% {
            transform: perspective(1200px) rotateY(360deg) rotateZ(0deg);
          }
        }

        @keyframes logoPulse {
          0%, 100% {
            filter: drop-shadow(0 0 50px rgba(251, 191, 36, 0.8)) drop-shadow(0 0 100px rgba(251, 191, 36, 0.5));
          }
          50% {
            filter: drop-shadow(0 0 70px rgba(251, 191, 36, 1)) drop-shadow(0 0 140px rgba(251, 191, 36, 0.7));
          }
        }
      `}</style>
    </div>
  );
};
