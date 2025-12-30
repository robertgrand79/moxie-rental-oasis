import React from 'react';
import { AvatarProps } from './types';

const SpartyAvatar: React.FC<AvatarProps> = ({ size = 40 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size}>
    <defs>
      <linearGradient id="msuBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#18453B"/>
        <stop offset="100%" stopColor="#0D2B24"/>
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#msuBg)"/>
    <ellipse cx="100" cy="110" rx="55" ry="55" fill="#D4AF37" stroke="#000" strokeWidth="4"/>
    <ellipse cx="100" cy="120" rx="35" ry="40" fill="#FFEAA7" stroke="#000" strokeWidth="3"/>
    <path d="M100 20 L85 55 L90 55 L90 70 L110 70 L110 55 L115 55 Z" fill="#D4AF37" stroke="#000" strokeWidth="3"/>
    <rect x="92" y="20" width="16" height="50" fill="#BB0000" stroke="#000" strokeWidth="2"/>
    <path d="M50 100 Q45 130 55 150" stroke="#D4AF37" strokeWidth="12" fill="none"/>
    <path d="M150 100 Q155 130 145 150" stroke="#D4AF37" strokeWidth="12" fill="none"/>
    <path d="M50 100 Q45 130 55 150" stroke="#000" strokeWidth="4" fill="none"/>
    <path d="M150 100 Q155 130 145 150" stroke="#000" strokeWidth="4" fill="none"/>
    <ellipse cx="82" cy="115" rx="12" ry="14" fill="#FFF" stroke="#000" strokeWidth="2"/>
    <ellipse cx="118" cy="115" rx="12" ry="14" fill="#FFF" stroke="#000" strokeWidth="2"/>
    <circle cx="84" cy="117" r="7" fill="#18453B"/>
    <circle cx="120" cy="117" r="7" fill="#18453B"/>
    <circle cx="84" cy="117" r="4" fill="#000"/>
    <circle cx="120" cy="117" r="4" fill="#000"/>
    <circle cx="86" cy="114" r="2" fill="#FFF"/>
    <circle cx="122" cy="114" r="2" fill="#FFF"/>
    <path d="M68 102 L95 108" stroke="#000" strokeWidth="5" strokeLinecap="round"/>
    <path d="M132 102 L105 108" stroke="#000" strokeWidth="5" strokeLinecap="round"/>
    <path d="M80 140 Q100 155 120 140" stroke="#000" strokeWidth="4" fill="none"/>
  </svg>
);

export default SpartyAvatar;
