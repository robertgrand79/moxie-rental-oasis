import React from 'react';
import { AvatarProps } from './types';

const OregonDuckAvatar: React.FC<AvatarProps> = ({ size = 40 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size}>
    <defs>
      <linearGradient id="oregonBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#154733"/>
        <stop offset="100%" stopColor="#0D2E22"/>
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#oregonBg)"/>
    <ellipse cx="100" cy="95" rx="55" ry="55" fill="#FEE123" stroke="#000" strokeWidth="4"/>
    <ellipse cx="100" cy="100" rx="45" ry="45" fill="#FFF"/>
    <ellipse cx="100" cy="135" rx="40" ry="20" fill="#F39C12" stroke="#000" strokeWidth="4"/>
    <ellipse cx="100" cy="130" rx="35" ry="15" fill="#E67E22" stroke="#000" strokeWidth="2"/>
    <line x1="65" y1="135" x2="135" y2="135" stroke="#000" strokeWidth="3"/>
    <ellipse cx="85" cy="130" rx="4" ry="3" fill="#000"/>
    <ellipse cx="115" cy="130" rx="4" ry="3" fill="#000"/>
    <ellipse cx="75" cy="90" rx="18" ry="20" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <ellipse cx="125" cy="90" rx="18" ry="20" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <circle cx="77" cy="92" r="10" fill="#000"/>
    <circle cx="127" cy="92" r="10" fill="#000"/>
    <circle cx="80" cy="88" r="5" fill="#FFF"/>
    <circle cx="130" cy="88" r="5" fill="#FFF"/>
    <path d="M55 72 Q75 62 95 75" stroke="#154733" strokeWidth="5" fill="none"/>
    <path d="M145 72 Q125 62 105 75" stroke="#154733" strokeWidth="5" fill="none"/>
    <ellipse cx="100" cy="45" rx="20" ry="15" fill="#FEE123" stroke="#000" strokeWidth="2"/>
    <path d="M85 45 Q100 25 115 45" fill="#154733" stroke="#000" strokeWidth="2"/>
  </svg>
);

export default OregonDuckAvatar;
