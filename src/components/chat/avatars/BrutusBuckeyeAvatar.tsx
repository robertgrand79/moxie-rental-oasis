import React from 'react';
import { AvatarProps } from './types';

const BrutusBuckeyeAvatar: React.FC<AvatarProps> = ({ size = 40 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size}>
    <defs>
      <linearGradient id="osuBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#BB0000"/>
        <stop offset="100%" stopColor="#900000"/>
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#osuBg)"/>
    <circle cx="35" cy="50" r="10" fill="#FFF" opacity="0.2"/>
    <ellipse cx="100" cy="100" rx="60" ry="65" fill="#8B4513" stroke="#000" strokeWidth="5"/>
    <ellipse cx="100" cy="50" rx="45" ry="20" fill="#5D3A1A" stroke="#000" strokeWidth="3"/>
    <ellipse cx="100" cy="45" rx="35" ry="12" fill="#4A2F15"/>
    <ellipse cx="85" cy="85" rx="25" ry="35" fill="#D2691E"/>
    <ellipse cx="75" cy="95" rx="15" ry="18" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <ellipse cx="125" cy="95" rx="15" ry="18" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <circle cx="77" cy="97" r="9" fill="#000"/>
    <circle cx="127" cy="97" r="9" fill="#000"/>
    <circle cx="80" cy="93" r="4" fill="#FFF"/>
    <circle cx="130" cy="93" r="4" fill="#FFF"/>
    <path d="M55 78 L88 88" stroke="#000" strokeWidth="6" strokeLinecap="round"/>
    <path d="M145 78 L112 88" stroke="#000" strokeWidth="6" strokeLinecap="round"/>
    <path d="M70 125 Q100 150 130 125" fill="#FFF" stroke="#000" strokeWidth="4"/>
    <path d="M100 30 Q90 20 100 10 Q110 20 100 30" fill="#BB0000" stroke="#000" strokeWidth="2"/>
    <line x1="100" y1="30" x2="100" y2="45" stroke="#666" strokeWidth="2"/>
    <rect x="60" y="48" width="80" height="8" fill="#666666" stroke="#000" strokeWidth="2"/>
  </svg>
);

export default BrutusBuckeyeAvatar;
