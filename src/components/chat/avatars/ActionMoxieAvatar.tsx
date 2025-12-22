import React from 'react';
import { AvatarProps } from './types';

const ActionMoxieAvatar = ({ 
  size = 40, 
  className = '',
  backgroundColorStart = '#74B9FF',
  backgroundColorEnd = '#0984E3'
}: AvatarProps) => {
  const speedGradId = `action-speed-${Math.random().toString(36).substr(2, 9)}`;
  
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
        <linearGradient id={speedGradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={backgroundColorStart}/>
          <stop offset="100%" stopColor={backgroundColorEnd}/>
        </linearGradient>
      </defs>
      
      {/* Dynamic blue background */}
      <circle cx="100" cy="100" r="95" fill={`url(#${speedGradId})`}/>
      
      {/* Speed lines */}
      <g stroke="#FFF" strokeWidth="2" opacity="0.6">
        <line x1="0" y1="50" x2="40" y2="55"/>
        <line x1="0" y1="70" x2="35" y2="72"/>
        <line x1="0" y1="90" x2="30" y2="90"/>
        <line x1="0" y1="110" x2="35" y2="108"/>
        <line x1="0" y1="130" x2="40" y2="128"/>
        <line x1="200" y1="55" x2="160" y2="50"/>
        <line x1="200" y1="75" x2="165" y2="72"/>
        <line x1="200" y1="95" x2="170" y2="95"/>
        <line x1="200" y1="115" x2="165" y2="112"/>
        <line x1="200" y1="135" x2="160" y2="132"/>
      </g>
      
      {/* Face */}
      <ellipse cx="100" cy="112" rx="50" ry="55" fill="#FFEAA7" stroke="#000" strokeWidth="4"/>
      
      {/* Spiky anime hair */}
      <path d="M50 85 L35 50 L60 75 L50 30 L80 70 L90 25 L100 65 L110 25 L120 70 L150 30 L140 75 L165 50 L150 85 Q100 75 50 85" 
            fill="#2D3436" stroke="#000" strokeWidth="3"/>
      
      {/* Big determined eyes */}
      <path d="M60 95 L90 90 L90 115 L60 120 Z" fill="#FFF" stroke="#000" strokeWidth="3"/>
      <path d="M110 90 L140 95 L140 120 L110 115 Z" fill="#FFF" stroke="#000" strokeWidth="3"/>
      
      {/* Irises */}
      <ellipse cx="78" cy="105" rx="10" ry="12" fill="#00B894"/>
      <ellipse cx="122" cy="105" rx="10" ry="12" fill="#00B894"/>
      <ellipse cx="78" cy="107" rx="6" ry="8" fill="#000"/>
      <ellipse cx="122" cy="107" rx="6" ry="8" fill="#000"/>
      
      {/* Anime shine */}
      <ellipse cx="82" cy="100" rx="4" ry="5" fill="#FFF"/>
      <ellipse cx="126" cy="100" rx="4" ry="5" fill="#FFF"/>
      <circle cx="74" cy="108" r="2" fill="#FFF"/>
      <circle cx="118" cy="108" r="2" fill="#FFF"/>
      
      {/* Intense eyebrows */}
      <path d="M55 82 L92 88" stroke="#000" strokeWidth="6" strokeLinecap="round"/>
      <path d="M145 82 L108 88" stroke="#000" strokeWidth="6" strokeLinecap="round"/>
      
      {/* Confident grin */}
      <path d="M70 140 Q100 165 130 140" stroke="#000" strokeWidth="4" fill="none"/>
      <path d="M75 140 Q100 158 125 140" fill="#FFF" stroke="#000" strokeWidth="2"/>
      
      {/* Fang */}
      <path d="M115 142 L120 150 L125 142" fill="#FFF" stroke="#000" strokeWidth="1"/>
      
      {/* Action effect - pow burst */}
      <g transform="translate(155, 45) scale(0.5)">
        <polygon points="0,-30 8,-10 30,-10 12,5 20,30 0,15 -20,30 -12,5 -30,-10 -8,-10" 
                 fill="#FFE66D" stroke="#000" strokeWidth="3"/>
      </g>
      
      {/* Headband */}
      <rect x="48" y="75" width="104" height="12" fill="#FF6B6B" stroke="#000" strokeWidth="2"/>
      <path d="M152 75 L170 65 L165 85 L152 87 Z" fill="#FF6B6B" stroke="#000" strokeWidth="2"/>
      
      {/* Collar */}
      <path d="M65 165 L100 155 L135 165" stroke="#000" strokeWidth="6" fill="none"/>
    </svg>
  );
};

export default ActionMoxieAvatar;
