import React from 'react';
import { AvatarProps } from './types';

const IlliniAvatar: React.FC<AvatarProps> = ({ size = 40 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size}>
    <defs>
      <linearGradient id="illBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E84A27"/>
        <stop offset="100%" stopColor="#C13A1C"/>
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#illBg)"/>
    <path d="M50 50 L50 130 Q100 170 150 130 L150 50 Q100 30 50 50" fill="#13294B" stroke="#000" strokeWidth="4"/>
    <path d="M60 58 L60 125 Q100 158 140 125 L140 58 Q100 42 60 58" fill="#E84A27" stroke="#FFF" strokeWidth="3"/>
    <rect x="85" y="65" width="30" height="80" fill="#13294B" stroke="#FFF" strokeWidth="2"/>
    <rect x="75" y="65" width="50" height="15" fill="#13294B" stroke="#FFF" strokeWidth="2"/>
    <rect x="75" y="130" width="50" height="15" fill="#13294B" stroke="#FFF" strokeWidth="2"/>
    <ellipse cx="90" cy="100" rx="8" ry="10" fill="#FFF"/>
    <ellipse cx="110" cy="100" rx="8" ry="10" fill="#FFF"/>
    <circle cx="91" cy="101" r="5" fill="#000"/>
    <circle cx="111" cy="101" r="5" fill="#000"/>
    <circle cx="93" cy="99" r="2" fill="#FFF"/>
    <circle cx="113" cy="99" r="2" fill="#FFF"/>
    <path d="M92 118 Q100 125 108 118" stroke="#FFF" strokeWidth="3" fill="none"/>
  </svg>
);

export default IlliniAvatar;
