import { useEffect, useState } from 'react';
import logoView1 from '@/assets/logo/logo-view-1.png';
import logoView2 from '@/assets/logo/logo-view-2.png';
import logoView3 from '@/assets/logo/logo-view-3.png';
import logoView4 from '@/assets/logo/logo-view-4.png';
import logoView5 from '@/assets/logo/logo-view-5.png';
import logoView6 from '@/assets/logo/logo-view-6.png';

interface Rotating3DLogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const logoViews = [
  logoView1,
  logoView2,
  logoView3,
  logoView4,
  logoView5,
  logoView6,
];

export const Rotating3DLogo = ({ size = 'medium', className = '' }: Rotating3DLogoProps) => {
  const [currentView, setCurrentView] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentView((prev) => (prev + 1) % logoViews.length);
    }, 200); // تبديل الصورة كل 200ms لدوران سلس

    return () => clearInterval(interval);
  }, []);

  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-24 h-24',
  };

  return (
    <div className={`${sizeClasses[size]} ${className} relative`}>
      {logoViews.map((view, index) => (
        <img
          key={index}
          src={view}
          alt="ITHRAA Logo 3D"
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-200 ${
            currentView === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </div>
  );
};
