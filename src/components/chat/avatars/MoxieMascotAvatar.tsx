import React from 'react';
import { AvatarProps } from './types';

const MoxieMascotAvatar = ({ 
  size = 40, 
  className = '',
  backgroundColorStart = '#00B894',
  backgroundColorEnd = '#00A085'
}: AvatarProps) => {
  const mascotGradId = `mascot-grad-${Math.random().toString(36).substr(2, 9)}`;
  
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
        <linearGradient id={mascotGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={backgroundColorStart}/>
          <stop offset="100%" stopColor={backgroundColorEnd}/>
        </linearGradient>
      </defs>
      
      {/* Bright green background */}
      <circle cx="100" cy="100" r="95" fill={`url(#${mascotGradId})`}/>
      
      {/* Decorative circles */}
      <circle cx="35" cy="45" r="15" fill="#FFF" opacity="0.2"/>
      <circle cx="165" cy="155" r="20" fill="#FFF" opacity="0.2"/>
      <circle cx="160" cy="50" r="10" fill="#FFF" opacity="0.2"/>
      
      {/* Main face - slightly tilted for energy */}
      <g transform="rotate(-5 100 100)">
        <ellipse cx="100" cy="110" rx="55" ry="58" fill="#FFEAA7" stroke="#000" strokeWidth="5"/>
        
        {/* Big expressive eyes */}
        <ellipse cx="72" cy="100" rx="20" ry="24" fill="#FFF" stroke="#000" strokeWidth="3"/>
        <ellipse cx="128" cy="100" rx="20" ry="24" fill="#FFF" stroke="#000" strokeWidth="3"/>
        
        {/* Pupils - looking at viewer */}
        <ellipse cx="75" cy="102" rx="12" ry="14" fill="#2D3436"/>
        <ellipse cx="131" cy="102" rx="12" ry="14" fill="#2D3436"/>
        
        {/* Eye sparkles */}
        <circle cx="80" cy="95" r="5" fill="#FFF"/>
        <circle cx="136" cy="95" r="5" fill="#FFF"/>
        <circle cx="72" cy="105" r="2" fill="#FFF"/>
        <circle cx="128" cy="105" r="2" fill="#FFF"/>
        
        {/* Thick eyebrows */}
        <path d="M50 78 Q72 68 92 80" stroke="#000" strokeWidth="6" fill="none" strokeLinecap="round"/>
        <path d="M150 78 Q128 68 108 80" stroke="#000" strokeWidth="6" fill="none" strokeLinecap="round"/>
        
        {/* Big happy mouth */}
        <path d="M65 138 Q100 175 135 138" fill="#C0392B" stroke="#000" strokeWidth="4"/>
        <path d="M70 138 Q100 160 130 138" fill="#FFF"/>
        
        {/* Tongue */}
        <ellipse cx="100" cy="155" rx="15" ry="10" fill="#E74C3C"/>
        
        {/* Cute blush marks */}
        <ellipse cx="45" cy="120" rx="12" ry="8" fill="#FF9FF3" opacity="0.6"/>
        <ellipse cx="155" cy="120" rx="12" ry="8" fill="#FF9FF3" opacity="0.6"/>
      </g>
      
      {/* Fun spiky hair */}
      <path d="M45 70 L30 40 L55 60 L45 20 L70 55 L80 15 L90 50 L100 10 L110 50 L120 15 L130 55 L155 20 L145 60 L170 40 L155 70" 
            fill="#FF6B6B" stroke="#000" strokeWidth="4" strokeLinejoin="round"/>
      
      {/* Speech bubble accent */}
      <g transform="translate(150, 35)">
        <ellipse cx="0" cy="0" rx="22" ry="18" fill="#FFF" stroke="#000" strokeWidth="3"/>
        <path d="M-10 15 L-5 25 L5 15" fill="#FFF" stroke="#000" strokeWidth="3"/>
        <text x="-8" y="5" fontSize="16" fontWeight="bold" fill="#00B894">Hi!</text>
      </g>
    </svg>
  );
};

export default MoxieMascotAvatar;
