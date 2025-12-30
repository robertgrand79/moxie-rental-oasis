import React from 'react';
import { AvatarProps } from './types';

const HerbieHuskerAvatar: React.FC<AvatarProps> = ({ size = 40 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size}>
    <defs>
      <linearGradient id="nebBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E41C38"/>
        <stop offset="100%" stopColor="#B8152C"/>
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#nebBg)"/>
    <ellipse cx="100" cy="55" rx="65" ry="15" fill="#F5DEB3" stroke="#000" strokeWidth="3"/>
    <path d="M45 55 Q50 35 100 30 Q150 35 155 55" fill="#F5DEB3" stroke="#000" strokeWidth="3"/>
    <ellipse cx="100" cy="42" rx="35" ry="15" fill="#DEB887" stroke="#000" strokeWidth="2"/>
    <rect x="65" y="47" width="70" height="8" fill="#E41C38" stroke="#000" strokeWidth="1"/>
    <ellipse cx="100" cy="115" rx="48" ry="50" fill="#FFEAA7" stroke="#000" strokeWidth="4"/>
    <ellipse cx="78" cy="108" rx="13" ry="15" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <ellipse cx="122" cy="108" rx="13" ry="15" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <circle cx="80" cy="110" r="8" fill="#00274C"/>
    <circle cx="124" cy="110" r="8" fill="#00274C"/>
    <circle cx="80" cy="110" r="4" fill="#000"/>
    <circle cx="124" cy="110" r="4" fill="#000"/>
    <circle cx="82" cy="107" r="3" fill="#FFF"/>
    <circle cx="126" cy="107" r="3" fill="#FFF"/>
    <path d="M62 95 Q78 88 92 97" stroke="#8B4513" strokeWidth="4" fill="none"/>
    <path d="M138 95 Q122 88 108 97" stroke="#8B4513" strokeWidth="4" fill="none"/>
    <path d="M75 138 Q100 160 125 138" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <ellipse cx="160" cy="120" rx="12" ry="25" fill="#FFEB3B" stroke="#000" strokeWidth="2"/>
    <line x1="160" y1="100" x2="160" y2="145" stroke="#FFD600" strokeWidth="2"/>
    <ellipse cx="160" cy="95" rx="8" ry="5" fill="#4CAF50" stroke="#000" strokeWidth="1"/>
  </svg>
);

export default HerbieHuskerAvatar;
