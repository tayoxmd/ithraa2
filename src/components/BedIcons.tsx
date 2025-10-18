import React from 'react';

interface BedIconProps {
  className?: string;
  type: 'single' | 'twin' | 'king';
}

export const BedIcon: React.FC<BedIconProps> = ({ className = "w-4 h-4", type }) => {
  if (type === 'single') {
    // Single bed with one pillow
    return (
      <svg className={className} viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Bed frame */}
        <rect x="5" y="50" width="90" height="25" fill="currentColor" rx="3"/>
        {/* Mattress */}
        <rect x="10" y="40" width="80" height="15" fill="currentColor" opacity="0.8" rx="2"/>
        {/* Single pillow */}
        <rect x="35" y="25" width="30" height="15" fill="currentColor" opacity="0.6" rx="2"/>
        {/* Bed legs */}
        <rect x="15" y="75" width="5" height="5" fill="currentColor"/>
        <rect x="80" y="75" width="5" height="5" fill="currentColor"/>
      </svg>
    );
  }

  if (type === 'twin') {
    // Two single beds with one pillow each
    return (
      <svg className={className} viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Left bed frame */}
        <rect x="2" y="50" width="44" height="25" fill="currentColor" rx="3"/>
        {/* Left mattress */}
        <rect x="5" y="40" width="38" height="15" fill="currentColor" opacity="0.8" rx="2"/>
        {/* Left pillow */}
        <rect x="15" y="25" width="18" height="15" fill="currentColor" opacity="0.6" rx="2"/>
        
        {/* Right bed frame */}
        <rect x="54" y="50" width="44" height="25" fill="currentColor" rx="3"/>
        {/* Right mattress */}
        <rect x="57" y="40" width="38" height="15" fill="currentColor" opacity="0.8" rx="2"/>
        {/* Right pillow */}
        <rect x="67" y="25" width="18" height="15" fill="currentColor" opacity="0.6" rx="2"/>
        
        {/* Bed legs */}
        <rect x="10" y="75" width="4" height="5" fill="currentColor"/>
        <rect x="38" y="75" width="4" height="5" fill="currentColor"/>
        <rect x="58" y="75" width="4" height="5" fill="currentColor"/>
        <rect x="88" y="75" width="4" height="5" fill="currentColor"/>
      </svg>
    );
  }

  // King bed with two pillows
  return (
    <svg className={className} viewBox="0 0 100 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Bed frame */}
      <rect x="5" y="50" width="90" height="25" fill="currentColor" rx="3"/>
      {/* Mattress */}
      <rect x="10" y="40" width="80" height="15" fill="currentColor" opacity="0.8" rx="2"/>
      {/* Two pillows */}
      <rect x="20" y="25" width="25" height="15" fill="currentColor" opacity="0.6" rx="2"/>
      <rect x="55" y="25" width="25" height="15" fill="currentColor" opacity="0.6" rx="2"/>
      {/* Bed legs */}
      <rect x="15" y="75" width="5" height="5" fill="currentColor"/>
      <rect x="80" y="75" width="5" height="5" fill="currentColor"/>
    </svg>
  );
};
