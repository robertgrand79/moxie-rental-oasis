import React from 'react';
import { AvatarProps } from './types';

const BlazeMascotAvatar = ({ 
  size = 40, 
  className = '',
  backgroundColorStart = '#FF7675',
  backgroundColorEnd = '#D63031'
}: AvatarProps) => {
  const gradientId = `blaze-grad-${Math.random().toString(36).substr(2, 9)}`;
  const flameGradId = `blaze-flame-${Math.random().toString(36).substr(2, 9)}`;
  
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
          <stop offset="0%" stopColor={backgroundColorStart}/>
          <stop offset="100%" stopColor={backgroundColorEnd}/>
        </linearGradient>
        <linearGradient id={flameGradId} x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#D63031"/>
          <stop offset="50%" stopColor="#E17055"/>
          <stop offset="100%" stopColor="#FDCB6E"/>
        </linearGradient>
      </defs>
      
      <circle cx="100" cy="100" r="95" fill={`url(#${gradientId})`}/>
      {/* Fire sparks */}
      <circle cx="35" cy="50" r="5" fill="#FDCB6E" opacity="0.6"/>
      <circle cx="165" cy="45" r="4" fill="#FDCB6E" opacity="0.6"/>
      <circle cx="25" cy="80" r="3" fill="#FDCB6E" opacity="0.6"/>
      <circle cx="175" cy="75" r="4" fill="#FDCB6E" opacity="0.6"/>
      
      <g transform="rotate(3 100 100)">
        <ellipse cx="100" cy="118" rx="52" ry="54" fill="#FFEAA7" stroke="#000" strokeWidth="5"/>
        <ellipse cx="70" cy="108" rx="19" ry="23" fill="#FFF" stroke="#000" strokeWidth="3"/>
        <ellipse cx="130" cy="108" rx="19" ry="23" fill="#FFF" stroke="#000" strokeWidth="3"/>
        <ellipse cx="72" cy="110" rx="11" ry="13" fill="#D63031"/>
        <ellipse cx="132" cy="110" rx="11" ry="13" fill="#D63031"/>
        <circle cx="72" cy="110" r="6" fill="#000"/>
        <circle cx="132" cy="110" r="6" fill="#000"/>
        <circle cx="76" cy="103" r="5" fill="#FFF"/>
        <circle cx="136" cy="103" r="5" fill="#FFF"/>
        {/* Determined eyebrows */}
        <path d="M48 92 L88 98" stroke="#000" strokeWidth="6" strokeLinecap="round"/>
        <path d="M152 92 L112 98" stroke="#000" strokeWidth="6" strokeLinecap="round"/>
        <path d="M68 148 Q100 178 132 148" fill="#C0392B" stroke="#000" strokeWidth="4"/>
        <path d="M73 148 Q100 168 127 148" fill="#FFF"/>
        {/* Fang */}
        <path d="M118 150 L122 158 L126 150" fill="#FFF" stroke="#000" strokeWidth="1"/>
        <ellipse cx="45" cy="125" rx="10" ry="7" fill="#E17055" opacity="0.5"/>
        <ellipse cx="155" cy="125" rx="10" ry="7" fill="#E17055" opacity="0.5"/>
      </g>
      
      {/* Flame hair */}
      <path d="M45 80 Q30 50 50 30 Q60 45 55 55 Q70 25 85 45 Q80 25 100 10 Q110 30 105 45 Q120 20 130 45 Q135 30 150 30 Q170 50 155 80 Q140 70 100 68 Q60 70 45 80" 
            fill={`url(#${flameGradId})`} stroke="#000" strokeWidth="4"/>
      {/* Inner flame details */}
      <path d="M60 60 Q65 45 75 55" stroke="#FDCB6E" strokeWidth="4" fill="none"/>
      <path d="M95 50 Q100 35 105 50" stroke="#FDCB6E" strokeWidth="4" fill="none"/>
      <path d="M125 55 Q135 45 140 60" stroke="#FDCB6E" strokeWidth="4" fill="none"/>
      
      <g transform="translate(160, 40)">
        <polygon points="0,-20 5,-8 18,-8 8,2 12,18 0,10 -12,18 -8,2 -18,-8 -5,-8" 
                 fill="#FDCB6E" stroke="#000" strokeWidth="3"/>
        <text x="-10" y="5" fontSize="9" fontWeight="bold" fill="#D63031">LET'S</text>
        <text x="-7" y="13" fontSize="9" fontWeight="bold" fill="#D63031">GO!</text>
      </g>
    </svg>
  );
};

export default BlazeMascotAvatar;
