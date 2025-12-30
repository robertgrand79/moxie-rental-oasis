import React from 'react';
import { AvatarProps } from './types';

const PurduePeteAvatar: React.FC<AvatarProps> = ({ size = 40 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size}>
    <defs>
      <linearGradient id="purdueBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#CEB888"/>
        <stop offset="100%" stopColor="#B8A066"/>
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#purdueBg)"/>
    <ellipse cx="100" cy="55" rx="55" ry="25" fill="#CEB888" stroke="#000" strokeWidth="4"/>
    <path d="M50 55 Q50 30 100 25 Q150 30 150 55" fill="#CEB888" stroke="#000" strokeWidth="4"/>
    <ellipse cx="100" cy="60" rx="60" ry="12" fill="#B8A066" stroke="#000" strokeWidth="3"/>
    <ellipse cx="100" cy="115" rx="50" ry="52" fill="#FFEAA7" stroke="#000" strokeWidth="4"/>
    <ellipse cx="78" cy="105" rx="14" ry="16" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <ellipse cx="122" cy="105" rx="14" ry="16" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <circle cx="80" cy="107" r="8" fill="#000"/>
    <circle cx="124" cy="107" r="8" fill="#000"/>
    <circle cx="82" cy="104" r="3" fill="#FFF"/>
    <circle cx="126" cy="104" r="3" fill="#FFF"/>
    <path d="M60 88 Q78 80 95 92" stroke="#000" strokeWidth="6" fill="none" strokeLinecap="round"/>
    <path d="M140 88 Q122 80 105 92" stroke="#000" strokeWidth="6" fill="none" strokeLinecap="round"/>
    <path d="M60 130 Q100 175 140 130" fill="#FFEAA7" stroke="#000" strokeWidth="3"/>
    <path d="M75 135 Q100 155 125 135" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <text x="88" y="50" fontSize="28" fontWeight="bold" fill="#000">P</text>
    <rect x="150" y="80" width="8" height="40" fill="#8B4513" stroke="#000" strokeWidth="2"/>
    <rect x="145" y="75" width="18" height="12" fill="#666" stroke="#000" strokeWidth="2"/>
  </svg>
);

export default PurduePeteAvatar;
