import { useEffect, useState, Component, ErrorInfo, ReactNode } from "react";
import { EarthGlobe } from "./EarthGlobe";
import { ClockTower3D } from "./ClockTower3D";
import { Mosque3D } from "./Mosque3D";

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode; onError?: () => void }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("3D Component Error:", error, errorInfo);
    if (this.props.onError) {
      this.props.onError();
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-slate-900" />;
    }
    return this.props.children;
  }
}

type SceneType = 'earth' | 'clockTower' | 'makkahMosque' | 'madinahMosque';

const scenes: { type: SceneType; title: string }[] = [
  { type: 'earth', title: 'الكرة الأرضية' },
  { type: 'clockTower', title: 'برج الساعة' },
  { type: 'makkahMosque', title: 'المسجد الحرام' },
  { type: 'madinahMosque', title: 'المسجد النبوي' },
];

export const HeroSlideshow = () => {
  const [currentScene, setCurrentScene] = useState<SceneType>('earth');
  const [error, setError] = useState(false);

  useEffect(() => {
    // التبديل بين المشاهد كل 8 ثواني
    const sceneInterval = setInterval(() => {
      setCurrentScene((prev) => {
        const currentIndex = scenes.findIndex(s => s.type === prev);
        const nextIndex = (currentIndex + 1) % scenes.length;
        return scenes[nextIndex].type;
      });
    }, 8000);

    return () => {
      clearInterval(sceneInterval);
    };
  }, []);

  // إذا حدث خطأ، اعرض خلفية بسيطة
  if (error) {
    return (
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900">
      {/* 3D Scenes with Error Handling */}
      <div className="absolute inset-0">
        {/* Earth Globe */}
        {currentScene === 'earth' && (
          <div className="absolute inset-0 animate-fade-in">
            <ErrorBoundary 
              fallback={<div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-slate-900" />}
              onError={() => setError(true)}
            >
              <EarthGlobe 
                meccaPosition={{ lat: 21.4225, lng: 39.8262 }}
                medinaPosition={{ lat: 24.4672, lng: 39.6142 }}
              />
            </ErrorBoundary>
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70 pointer-events-none" />
          </div>
        )}

        {/* Clock Tower */}
        {currentScene === 'clockTower' && (
          <div className="absolute inset-0 animate-fade-in">
            <ErrorBoundary 
              fallback={<div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-slate-900" />}
              onError={() => setError(true)}
            >
              <ClockTower3D />
            </ErrorBoundary>
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 pointer-events-none" />
          </div>
        )}

        {/* Makkah Mosque */}
        {currentScene === 'makkahMosque' && (
          <div className="absolute inset-0 animate-fade-in">
            <ErrorBoundary 
              fallback={<div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-slate-900" />}
              onError={() => setError(true)}
            >
              <Mosque3D type="makkah" />
            </ErrorBoundary>
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 pointer-events-none" />
          </div>
        )}

        {/* Madinah Mosque */}
        {currentScene === 'madinahMosque' && (
          <div className="absolute inset-0 animate-fade-in">
            <ErrorBoundary 
              fallback={<div className="absolute inset-0 bg-gradient-to-b from-blue-900 to-slate-900" />}
              onError={() => setError(true)}
            >
              <Mosque3D type="madinah" />
            </ErrorBoundary>
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Scene Indicator Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {scenes.map((scene, index) => (
          <button
            key={scene.type}
            onClick={() => setCurrentScene(scene.type)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              scene.type === currentScene
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={scene.title}
          />
        ))}
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 1s ease-in-out;
        }
      `}</style>
    </div>
  );
};
