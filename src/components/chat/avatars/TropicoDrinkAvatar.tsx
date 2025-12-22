import React from 'react';
import { AvatarProps } from './types';

const TropicoDrinkAvatar: React.FC<AvatarProps> = ({ size = 40 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size}>
    <defs>
      <linearGradient id="tropicoBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FD79A8"/>
        <stop offset="100%" stopColor="#E84393"/>
      </linearGradient>
      <linearGradient id="drinkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#FF9F43"/>
        <stop offset="100%" stopColor="#EE5A24"/>
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#tropicoBg)"/>
    {/* Decorative elements */}
    <circle cx="35" cy="50" r="8" fill="#FFF" opacity="0.2"/>
    <circle cx="165" cy="150" r="10" fill="#FFF" opacity="0.2"/>
    {/* Glass */}
    <path d="M55 70 L65 170 Q100 180 135 170 L145 70 Z" fill="url(#drinkGrad)" stroke="#000" strokeWidth="4"/>
    {/* Glass shine */}
    <path d="M62 80 L68 160" stroke="#FFF" strokeWidth="4" opacity="0.4" strokeLinecap="round"/>
    {/* Umbrella */}
    <line x1="130" y1="45" x2="130" y2="100" stroke="#8D6E63" strokeWidth="3"/>
    <path d="M100 45 Q130 25 160 45 Q130 55 100 45" fill="#FF6B6B" stroke="#000" strokeWidth="2"/>
    <path d="M105 46 L130 40 L130 50 Z" fill="#D63031"/>
    <path d="M130 40 L155 46 L130 50 Z" fill="#EE5A24"/>
    {/* Fruit slice */}
    <circle cx="75" cy="75" r="18" fill="#FDCB6E" stroke="#000" strokeWidth="3"/>
    <circle cx="75" cy="75" r="12" fill="#F39C12"/>
    <path d="M68 70 L75 75 L68 80" stroke="#FDCB6E" strokeWidth="2"/>
    <path d="M82 70 L75 75 L82 80" stroke="#FDCB6E" strokeWidth="2"/>
    <path d="M70 68 L75 75 L80 68" stroke="#FDCB6E" strokeWidth="2"/>
    <path d="M70 82 L75 75 L80 82" stroke="#FDCB6E" strokeWidth="2"/>
    {/* Straw */}
    <rect x="108" y="50" width="8" height="80" fill="#FF6B6B" stroke="#000" strokeWidth="2"/>
    <rect x="108" y="50" width="8" height="10" fill="#FFF" stroke="#000" strokeWidth="2"/>
    <rect x="108" y="70" width="8" height="10" fill="#FFF" stroke="#000" strokeWidth="2"/>
    <rect x="108" y="90" width="8" height="10" fill="#FFF" stroke="#000" strokeWidth="2"/>
    {/* Face on glass */}
    <ellipse cx="82" cy="115" rx="12" ry="14" fill="#FFF" stroke="#000" strokeWidth="2"/>
    <ellipse cx="118" cy="115" rx="12" ry="14" fill="#FFF" stroke="#000" strokeWidth="2"/>
    <circle cx="84" cy="117" r="7" fill="#000"/>
    <circle cx="120" cy="117" r="7" fill="#000"/>
    <circle cx="86" cy="114" r="3" fill="#FFF"/>
    <circle cx="122" cy="114" r="3" fill="#FFF"/>
    {/* Eyebrows */}
    <path d="M68 100 Q82 94 95 102" stroke="#000" strokeWidth="3" fill="none"/>
    <path d="M132 100 Q118 94 105 102" stroke="#000" strokeWidth="3" fill="none"/>
    {/* Big smile */}
    <path d="M80 140 Q100 158 120 140" fill="#FFF" stroke="#000" strokeWidth="3"/>
    {/* Blush */}
    <ellipse cx="70" cy="130" rx="8" ry="5" fill="#FF6B6B" opacity="0.4"/>
    <ellipse cx="130" cy="130" rx="8" ry="5" fill="#FF6B6B" opacity="0.4"/>
  </svg>
);

export default TropicoDrinkAvatar;
