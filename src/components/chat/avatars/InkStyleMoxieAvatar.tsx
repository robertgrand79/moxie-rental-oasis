import React from 'react';
import { AvatarProps } from './types';

const InkStyleMoxieAvatar = ({ 
  size = 40, 
  className = '',
  backgroundColorStart = '#FDF6E3',
  backgroundColorEnd = '#F5E6C8'
}: AvatarProps) => {
  const gradientId = `ink-gradient-${Math.random().toString(36).substr(2, 9)}`;
  
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
      </defs>
      
      {/* Cream paper background */}
      <circle cx="100" cy="100" r="95" fill={`url(#${gradientId})`}/>
      
      {/* Ink splatter accents */}
      <circle cx="40" cy="50" r="8" fill="#2D3436" opacity="0.1"/>
      <circle cx="160" cy="150" r="12" fill="#2D3436" opacity="0.1"/>
      <circle cx="150" cy="40" r="6" fill="#2D3436" opacity="0.1"/>
      <circle cx="50" cy="160" r="10" fill="#2D3436" opacity="0.1"/>
      
      {/* Face - sketchy line style */}
      <ellipse cx="100" cy="112" rx="52" ry="56" fill="#FFF" stroke="#2D3436" strokeWidth="3"/>
      
      {/* Cross-hatch shading on face */}
      <g stroke="#2D3436" strokeWidth="0.5" opacity="0.2">
        <line x1="130" y1="90" x2="145" y2="110"/>
        <line x1="132" y1="95" x2="147" y2="115"/>
        <line x1="134" y1="100" x2="149" y2="120"/>
        <line x1="55" y1="90" x2="70" y2="110"/>
        <line x1="53" y1="95" x2="68" y2="115"/>
        <line x1="51" y1="100" x2="66" y2="120"/>
      </g>
      
      {/* Messy artistic hair */}
      <path d="M48 85 Q40 50 60 40 Q80 30 100 35 Q120 30 140 40 Q160 50 152 85 
               Q145 70 130 72 Q115 65 100 70 Q85 65 70 72 Q55 70 48 85" 
            fill="#2D3436" stroke="#2D3436" strokeWidth="2"/>
      
      {/* Hair texture lines */}
      <path d="M60 55 Q70 45 80 55 M90 45 Q100 35 110 45 M120 55 Q130 45 140 55" 
            stroke="#444" strokeWidth="2" fill="none"/>
      
      {/* Simple dot eyes */}
      <circle cx="75" cy="105" r="10" fill="#2D3436"/>
      <circle cx="125" cy="105" r="10" fill="#2D3436"/>
      
      {/* Eye highlights */}
      <circle cx="78" cy="102" r="3" fill="#FFF"/>
      <circle cx="128" cy="102" r="3" fill="#FFF"/>
      
      {/* Sketchy eyebrows */}
      <path d="M58 88 C65 82 75 82 88 90" stroke="#2D3436" strokeWidth="3" fill="none"/>
      <path d="M142 88 C135 82 125 82 112 90" stroke="#2D3436" strokeWidth="3" fill="none"/>
      
      {/* Simple line nose */}
      <path d="M100 110 L97 125" stroke="#2D3436" strokeWidth="2"/>
      
      {/* Warm smile */}
      <path d="M78 140 Q100 158 122 140" stroke="#2D3436" strokeWidth="3" fill="none"/>
      
      {/* Little smile lines */}
      <path d="M75 138 L72 142" stroke="#2D3436" strokeWidth="2"/>
      <path d="M125 138 L128 142" stroke="#2D3436" strokeWidth="2"/>
      
      {/* Freckles */}
      <circle cx="65" cy="125" r="2" fill="#2D3436" opacity="0.3"/>
      <circle cx="70" cy="130" r="1.5" fill="#2D3436" opacity="0.3"/>
      <circle cx="60" cy="130" r="1.5" fill="#2D3436" opacity="0.3"/>
      <circle cx="135" cy="125" r="2" fill="#2D3436" opacity="0.3"/>
      <circle cx="140" cy="130" r="1.5" fill="#2D3436" opacity="0.3"/>
      <circle cx="130" cy="130" r="1.5" fill="#2D3436" opacity="0.3"/>
      
      {/* Simple collar */}
      <path d="M65 168 L100 160 L135 168" stroke="#2D3436" strokeWidth="3" fill="none"/>
      
      {/* Accent color - teal scarf/bandana */}
      <path d="M60 162 Q100 155 140 162 Q130 170 100 172 Q70 170 60 162" 
            fill="#00B894" stroke="#2D3436" strokeWidth="2"/>
    </svg>
  );
};

export default InkStyleMoxieAvatar;
