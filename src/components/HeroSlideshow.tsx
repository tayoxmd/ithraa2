import { useState, Component, ErrorInfo, ReactNode } from "react";
import { EarthGlobe } from "./EarthGlobe";

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

export const HeroSlideshow = () => {
  const [error, setError] = useState(false);

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
      {/* الكرة الأرضية فقط */}
      <div className="absolute inset-0">
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
    </div>
  );
};
