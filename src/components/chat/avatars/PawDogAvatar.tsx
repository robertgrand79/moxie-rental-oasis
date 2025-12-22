import React from 'react';
import { AvatarProps } from './types';

const PawDogAvatar: React.FC<AvatarProps> = ({ size = 40 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size}>
    <defs>
      <linearGradient id="dogBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00B894"/>
        <stop offset="100%" stopColor="#00A085"/>
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#dogBg)"/>
    <circle cx="35" cy="55" r="10" fill="#FFF" opacity="0.2"/>
    <circle cx="165" cy="145" r="12" fill="#FFF" opacity="0.2"/>
    {/* Ears */}
    <ellipse cx="45" cy="70" rx="25" ry="40" fill="#8D6E63" stroke="#000" strokeWidth="4"/>
    <ellipse cx="155" cy="70" rx="25" ry="40" fill="#8D6E63" stroke="#000" strokeWidth="4"/>
    {/* Inner ears */}
    <ellipse cx="45" cy="75" rx="15" ry="25" fill="#D7CCC8"/>
    <ellipse cx="155" cy="75" rx="15" ry="25" fill="#D7CCC8"/>
    {/* Dog face */}
    <ellipse cx="100" cy="110" rx="55" ry="52" fill="#D7CCC8" stroke="#000" strokeWidth="4"/>
    {/* Brown patches */}
    <ellipse cx="65" cy="95" rx="25" ry="22" fill="#8D6E63"/>
    <ellipse cx="135" cy="95" rx="25" ry="22" fill="#8D6E63"/>
    {/* Forehead patch */}
    <ellipse cx="100" cy="70" rx="20" ry="15" fill="#8D6E63"/>
    {/* Eyes */}
    <ellipse cx="72" cy="100" rx="16" ry="18" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <ellipse cx="128" cy="100" rx="16" ry="18" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <ellipse cx="74" cy="102" rx="10" ry="12" fill="#5D4037"/>
    <ellipse cx="130" cy="102" rx="10" ry="12" fill="#5D4037"/>
    <circle cx="77" cy="97" r="4" fill="#FFF"/>
    <circle cx="133" cy="97" r="4" fill="#FFF"/>
    {/* Eyebrows */}
    <path d="M55 82 Q72 75 88 85" stroke="#5D4037" strokeWidth="4" fill="none"/>
    <path d="M145 82 Q128 75 112 85" stroke="#5D4037" strokeWidth="4" fill="none"/>
    {/* Muzzle */}
    <ellipse cx="100" cy="130" rx="30" ry="25" fill="#FFF" stroke="#000" strokeWidth="3"/>
    {/* Nose */}
    <ellipse cx="100" cy="120" rx="14" ry="10" fill="#2D3436" stroke="#000" strokeWidth="2"/>
    <ellipse cx="97" cy="117" rx="4" ry="3" fill="#FFF" opacity="0.4"/>
    {/* Mouth */}
    <path d="M100 130 L100 140" stroke="#000" strokeWidth="3"/>
    <path d="M85 142 Q100 155 115 142" stroke="#000" strokeWidth="3" fill="none"/>
    {/* Tongue */}
    <ellipse cx="100" cy="150" rx="10" ry="12" fill="#FF6B6B" stroke="#000" strokeWidth="2"/>
    <line x1="100" y1="145" x2="100" y2="158" stroke="#E84393" strokeWidth="2"/>
    {/* Collar */}
    <ellipse cx="100" cy="165" rx="35" ry="8" fill="#FF6B6B" stroke="#000" strokeWidth="3"/>
    <circle cx="100" cy="168" r="8" fill="#FDCB6E" stroke="#000" strokeWidth="2"/>
  </svg>
);

export default PawDogAvatar;
