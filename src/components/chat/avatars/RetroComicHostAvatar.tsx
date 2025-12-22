import React from 'react';
import { AvatarProps } from './types';

const RetroComicHostAvatar = ({ 
  size = 40, 
  className = '',
  backgroundColorStart = '#FFF176',
  backgroundColorEnd = '#FFD93D'
}: AvatarProps) => {
  const gradientId = `retro-gradient-${Math.random().toString(36).substr(2, 9)}`;
  const retroDotsId = `retro-dots-${Math.random().toString(36).substr(2, 9)}`;
  const skinDotsId = `retro-skin-${Math.random().toString(36).substr(2, 9)}`;
  
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
        <pattern id={retroDotsId} patternUnits="userSpaceOnUse" width="5" height="5">
          <circle cx="2.5" cy="2.5" r="1.5" fill="#F8B500" opacity="0.6"/>
        </pattern>
        <pattern id={skinDotsId} patternUnits="userSpaceOnUse" width="4" height="4">
          <circle cx="2" cy="2" r="0.8" fill="#000" opacity="0.1"/>
        </pattern>
      </defs>
      
      {/* Classic yellow burst background */}
      <circle cx="100" cy="100" r="95" fill={`url(#${gradientId})`}/>
      <circle cx="100" cy="100" r="95" fill={`url(#${retroDotsId})`}/>
      
      {/* Starburst */}
      {[...Array(12)].map((_, i) => (
        <path key={i} d={`M100,100 L${100 + Math.cos(i * Math.PI / 6) * 95},${100 + Math.sin(i * Math.PI / 6) * 95}`}
              stroke="#FFF" strokeWidth="8" opacity="0.5"/>
      ))}
      
      {/* Face */}
      <ellipse cx="100" cy="115" rx="50" ry="55" fill="#FFE4C4" stroke="#000" strokeWidth="4"/>
      <ellipse cx="100" cy="115" rx="50" ry="55" fill={`url(#${skinDotsId})`}/>
      
      {/* 50s pompadour hair */}
      <path d="M50 85 Q50 35 100 30 Q150 35 150 85 Q140 75 100 70 Q60 75 50 85" 
            fill="#1A1A2E" stroke="#000" strokeWidth="3"/>
      <path d="M65 70 Q100 20 135 70" fill="#1A1A2E" stroke="#000" strokeWidth="3"/>
      
      {/* Hair highlight */}
      <path d="M75 50 Q100 35 125 50" stroke="#444" strokeWidth="4" fill="none"/>
      
      {/* Classic comic eyes */}
      <ellipse cx="75" cy="105" rx="12" ry="14" fill="#FFF" stroke="#000" strokeWidth="3"/>
      <ellipse cx="125" cy="105" rx="12" ry="14" fill="#FFF" stroke="#000" strokeWidth="3"/>
      <circle cx="75" cy="107" r="7" fill="#0984E3"/>
      <circle cx="125" cy="107" r="7" fill="#0984E3"/>
      <circle cx="75" cy="107" r="4" fill="#000"/>
      <circle cx="125" cy="107" r="4" fill="#000"/>
      <circle cx="77" cy="104" r="2" fill="#FFF"/>
      <circle cx="127" cy="104" r="2" fill="#FFF"/>
      
      {/* Eyebrows */}
      <path d="M60 90 Q75 85 88 92" stroke="#000" strokeWidth="4" fill="none"/>
      <path d="M140 90 Q125 85 112 92" stroke="#000" strokeWidth="4" fill="none"/>
      
      {/* Nose */}
      <path d="M100 108 L96 128 Q100 132 104 128" stroke="#000" strokeWidth="2" fill="none"/>
      
      {/* Big friendly smile */}
      <path d="M75 145 Q100 170 125 145" fill="#FFF" stroke="#000" strokeWidth="3"/>
      <path d="M75 145 Q100 150 125 145" stroke="#000" strokeWidth="2"/>
      
      {/* Teeth lines */}
      <line x1="90" y1="145" x2="90" y2="155" stroke="#000" strokeWidth="1"/>
      <line x1="100" y1="145" x2="100" y2="158" stroke="#000" strokeWidth="1"/>
      <line x1="110" y1="145" x2="110" y2="155" stroke="#000" strokeWidth="1"/>
      
      {/* Blush */}
      <ellipse cx="55" cy="125" rx="10" ry="6" fill="#FFB6B6"/>
      <ellipse cx="145" cy="125" rx="10" ry="6" fill="#FFB6B6"/>
      
      {/* Bow tie */}
      <ellipse cx="100" cy="172" rx="8" ry="5" fill="#FF6B6B" stroke="#000" strokeWidth="2"/>
      <path d="M80 168 L92 172 L80 176 Z" fill="#FF6B6B" stroke="#000" strokeWidth="2"/>
      <path d="M120 168 L108 172 L120 176 Z" fill="#FF6B6B" stroke="#000" strokeWidth="2"/>
      
      {/* Collar */}
      <path d="M70 165 L92 175 L100 168 L108 175 L130 165" fill="#FFF" stroke="#000" strokeWidth="2"/>
    </svg>
  );
};

export default RetroComicHostAvatar;
