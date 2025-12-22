import React from 'react';
import { AvatarProps } from './types';

const PopArtMoxieAvatar = ({ 
  size = 40, 
  className = '',
  backgroundColorStart = '#FD79A8',
  backgroundColorEnd = '#E84393'
}: AvatarProps) => {
  const dots2Id = `pop-art-dots2-${Math.random().toString(36).substr(2, 9)}`;
  const dots3Id = `pop-art-dots3-${Math.random().toString(36).substr(2, 9)}`;
  const gradientId = `pop-art-gradient-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={backgroundColorStart} />
          <stop offset="100%" stopColor={backgroundColorEnd} />
        </linearGradient>
        <pattern id={dots2Id} patternUnits="userSpaceOnUse" width="6" height="6">
          <circle cx="3" cy="3" r="2" fill="#FF6B6B"/>
        </pattern>
        <pattern id={dots3Id} patternUnits="userSpaceOnUse" width="8" height="8">
          <circle cx="4" cy="4" r="1.5" fill="#000" opacity="0.2"/>
        </pattern>
      </defs>
      
      {/* Hot pink background */}
      <circle cx="100" cy="100" r="95" fill={`url(#${gradientId})`}/>
      
      {/* Face with halftone */}
      <ellipse cx="100" cy="110" rx="55" ry="60" fill="#FFEAA7" stroke="#000" strokeWidth="5"/>
      <ellipse cx="100" cy="110" rx="55" ry="60" fill={`url(#${dots3Id})`}/>
      
      {/* Bold hair - 60s style */}
      <path d="M45 90 Q30 50 70 35 Q100 25 130 35 Q170 50 155 90 Q145 70 100 65 Q55 70 45 90" 
            fill="#2D3436" stroke="#000" strokeWidth="4"/>
      
      {/* Eyebrows */}
      <path d="M60 85 Q75 78 90 85" stroke="#000" strokeWidth="4" fill="none"/>
      <path d="M110 85 Q125 78 140 85" stroke="#000" strokeWidth="4" fill="none"/>
      
      {/* Eyes - big and bold */}
      <ellipse cx="75" cy="100" rx="15" ry="18" fill="#FFF" stroke="#000" strokeWidth="3"/>
      <ellipse cx="125" cy="100" rx="15" ry="18" fill="#FFF" stroke="#000" strokeWidth="3"/>
      
      {/* Irises */}
      <circle cx="75" cy="102" r="10" fill="#00CEC9"/>
      <circle cx="125" cy="102" r="10" fill="#00CEC9"/>
      <circle cx="75" cy="102" r="5" fill="#000"/>
      <circle cx="125" cy="102" r="5" fill="#000"/>
      
      {/* Eye shine */}
      <circle cx="78" cy="98" r="4" fill="#FFF"/>
      <circle cx="128" cy="98" r="4" fill="#FFF"/>
      
      {/* Lashes */}
      <path d="M62 88 L58 82 M68 86 L65 78 M75 85 L75 77 M82 86 L85 78 M88 88 L92 82" 
            stroke="#000" strokeWidth="2" strokeLinecap="round"/>
      <path d="M112 88 L108 82 M118 86 L115 78 M125 85 L125 77 M132 86 L135 78 M138 88 L142 82" 
            stroke="#000" strokeWidth="2" strokeLinecap="round"/>
      
      {/* Nose */}
      <path d="M100 105 L95 125 Q100 128 105 125" stroke="#000" strokeWidth="2" fill="none"/>
      
      {/* Big red lips */}
      <ellipse cx="100" cy="145" rx="25" ry="12" fill="#FF6B6B" stroke="#000" strokeWidth="3"/>
      <path d="M80 145 Q100 140 120 145" stroke="#000" strokeWidth="2"/>
      <ellipse cx="90" cy="143" rx="5" ry="3" fill="#FFF" opacity="0.5"/>
      
      {/* Blush */}
      <ellipse cx="55" cy="120" rx="12" ry="8" fill={`url(#${dots2Id})`} opacity="0.8"/>
      <ellipse cx="145" cy="120" rx="12" ry="8" fill={`url(#${dots2Id})`} opacity="0.8"/>
      
      {/* Earrings */}
      <circle cx="42" cy="115" r="8" fill="#FFE66D" stroke="#000" strokeWidth="2"/>
      <circle cx="158" cy="115" r="8" fill="#FFE66D" stroke="#000" strokeWidth="2"/>
    </svg>
  );
};

export default PopArtMoxieAvatar;
