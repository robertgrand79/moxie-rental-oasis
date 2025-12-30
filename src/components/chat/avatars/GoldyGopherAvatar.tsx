import React from 'react';
import { AvatarProps } from './types';

const GoldyGopherAvatar: React.FC<AvatarProps> = ({ size = 40 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size}>
    <defs>
      <linearGradient id="minnBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7A0019"/>
        <stop offset="100%" stopColor="#5C0013"/>
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#minnBg)"/>
    <ellipse cx="100" cy="105" rx="55" ry="55" fill="#D4A574" stroke="#000" strokeWidth="4"/>
    <ellipse cx="100" cy="120" rx="35" ry="35" fill="#F5DEB3" stroke="#000" strokeWidth="2"/>
    <ellipse cx="50" cy="65" rx="18" ry="22" fill="#D4A574" stroke="#000" strokeWidth="3"/>
    <ellipse cx="150" cy="65" rx="18" ry="22" fill="#D4A574" stroke="#000" strokeWidth="3"/>
    <ellipse cx="50" cy="68" rx="10" ry="12" fill="#FFB6C1"/>
    <ellipse cx="150" cy="68" rx="10" ry="12" fill="#FFB6C1"/>
    <ellipse cx="75" cy="100" rx="15" ry="18" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <ellipse cx="125" cy="100" rx="15" ry="18" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <circle cx="77" cy="102" r="9" fill="#000"/>
    <circle cx="127" cy="102" r="9" fill="#000"/>
    <circle cx="80" cy="98" r="4" fill="#FFF"/>
    <circle cx="130" cy="98" r="4" fill="#FFF"/>
    <path d="M58 85 Q75 78 90 87" stroke="#8B4513" strokeWidth="4" fill="none"/>
    <path d="M142 85 Q125 78 110 87" stroke="#8B4513" strokeWidth="4" fill="none"/>
    <ellipse cx="100" cy="125" rx="10" ry="8" fill="#000"/>
    <rect x="90" y="138" width="10" height="18" fill="#FFF" stroke="#000" strokeWidth="2" rx="2"/>
    <rect x="100" y="138" width="10" height="18" fill="#FFF" stroke="#000" strokeWidth="2" rx="2"/>
    <ellipse cx="55" cy="115" rx="12" ry="10" fill="#D4A574" stroke="#000" strokeWidth="2"/>
    <ellipse cx="145" cy="115" rx="12" ry="10" fill="#D4A574" stroke="#000" strokeWidth="2"/>
    <path d="M55 165 Q100 155 145 165" stroke="#FFCC33" strokeWidth="10"/>
  </svg>
);

export default GoldyGopherAvatar;
