import React from 'react';
import { AvatarProps } from './types';

const CaptainMoxieAvatar = ({ 
  size = 40, 
  className = '',
  backgroundColorStart = '#FFE66D',
  backgroundColorEnd = '#FFD93D'
}: AvatarProps) => {
  const gradientId = `captain-moxie-gradient-${Math.random().toString(36).substr(2, 9)}`;
  const halftoneId = `captain-moxie-halftone-${Math.random().toString(36).substr(2, 9)}`;
  const heroGradId = `captain-moxie-hero-${Math.random().toString(36).substr(2, 9)}`;
  
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
        <pattern id={halftoneId} patternUnits="userSpaceOnUse" width="4" height="4">
          <circle cx="2" cy="2" r="1" fill="#000" opacity="0.3"/>
        </pattern>
        <linearGradient id={heroGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6B6B"/>
          <stop offset="100%" stopColor="#EE5A24"/>
        </linearGradient>
      </defs>
      
      {/* Bold background */}
      <circle cx="100" cy="100" r="95" fill={`url(#${gradientId})`}/>
      <circle cx="100" cy="100" r="95" fill={`url(#${halftoneId})`}/>
      
      {/* Action lines */}
      {[...Array(16)].map((_, i) => (
        <line key={i} x1="100" y1="100" x2={100 + Math.cos(i * Math.PI / 8) * 95} 
              y2={100 + Math.sin(i * Math.PI / 8) * 95} 
              stroke="#FFF" strokeWidth="3" opacity="0.4"/>
      ))}
      
      {/* Face - bold outline */}
      <ellipse cx="100" cy="115" rx="48" ry="55" fill="#FFEAA7" stroke="#000" strokeWidth="4"/>
      
      {/* Heroic jaw */}
      <path d="M60 130 Q100 175 140 130" fill="#FFEAA7" stroke="#000" strokeWidth="4"/>
      
      {/* Mask */}
      <path d="M50 95 Q100 75 150 95 L145 115 Q100 100 55 115 Z" fill={`url(#${heroGradId})`} stroke="#000" strokeWidth="3"/>
      
      {/* Mask eye holes */}
      <ellipse cx="75" cy="105" rx="18" ry="12" fill="#FFEAA7" stroke="#000" strokeWidth="3"/>
      <ellipse cx="125" cy="105" rx="18" ry="12" fill="#FFEAA7" stroke="#000" strokeWidth="3"/>
      
      {/* Bold eyes */}
      <ellipse cx="75" cy="105" rx="8" ry="10" fill="#000"/>
      <ellipse cx="125" cy="105" rx="8" ry="10" fill="#000"/>
      <circle cx="77" cy="102" r="3" fill="#FFF"/>
      <circle cx="127" cy="102" r="3" fill="#FFF"/>
      
      {/* Determined eyebrows */}
      <path d="M58 88 L90 95" stroke="#000" strokeWidth="5" strokeLinecap="round"/>
      <path d="M142 88 L110 95" stroke="#000" strokeWidth="5" strokeLinecap="round"/>
      
      {/* Confident smirk */}
      <path d="M80 140 Q100 155 120 140" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M85 140 Q100 150 115 140" fill="#FFF" stroke="#000" strokeWidth="2"/>
      
      {/* Hero hair */}
      <path d="M55 80 Q55 45 100 40 Q145 45 145 80" fill="#2D3436" stroke="#000" strokeWidth="3"/>
      <path d="M85 45 L95 60 L105 45 L115 60 L125 45" fill="#2D3436" stroke="#000" strokeWidth="2"/>
      
      {/* Cape hint */}
      <path d="M45 160 Q50 150 65 155 L75 165" fill={`url(#${heroGradId})`} stroke="#000" strokeWidth="3"/>
      <path d="M155 160 Q150 150 135 155 L125 165" fill={`url(#${heroGradId})`} stroke="#000" strokeWidth="3"/>
      
      {/* Collar/suit */}
      <path d="M70 165 L100 155 L130 165" stroke="#000" strokeWidth="5" strokeLinecap="round"/>
      <circle cx="100" cy="160" r="6" fill="#FFE66D" stroke="#000" strokeWidth="2"/>
      <text x="97" y="164" fontSize="10" fontWeight="bold" fill="#000">M</text>
    </svg>
  );
};

export default CaptainMoxieAvatar;
