import React from 'react';
import { AvatarProps } from './types';

const TommyTrojanAvatar: React.FC<AvatarProps> = ({ size = 40 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size}>
    <defs>
      <linearGradient id="uscBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#990000"/>
        <stop offset="100%" stopColor="#6B0000"/>
      </linearGradient>
      <linearGradient id="trojanHelmet" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFC72C"/>
        <stop offset="100%" stopColor="#D4A520"/>
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#uscBg)"/>
    <ellipse cx="100" cy="100" rx="55" ry="58" fill="url(#trojanHelmet)" stroke="#000" strokeWidth="4"/>
    <path d="M100 15 L85 50 L92 50 L92 60 L108 60 L108 50 L115 50 Z" fill="url(#trojanHelmet)" stroke="#000" strokeWidth="3"/>
    <rect x="94" y="15" width="12" height="45" fill="#990000" stroke="#000" strokeWidth="2"/>
    <ellipse cx="100" cy="110" rx="38" ry="42" fill="#FFEAA7" stroke="#000" strokeWidth="3"/>
    <rect x="96" y="65" width="8" height="50" fill="url(#trojanHelmet)" stroke="#000" strokeWidth="2"/>
    <path d="M50 90 Q45 120 55 145" stroke="url(#trojanHelmet)" strokeWidth="15" fill="none"/>
    <path d="M150 90 Q155 120 145 145" stroke="url(#trojanHelmet)" strokeWidth="15" fill="none"/>
    <path d="M50 90 Q45 120 55 145" stroke="#000" strokeWidth="4" fill="none"/>
    <path d="M150 90 Q155 120 145 145" stroke="#000" strokeWidth="4" fill="none"/>
    <ellipse cx="80" cy="105" rx="10" ry="12" fill="#FFF" stroke="#000" strokeWidth="2"/>
    <ellipse cx="120" cy="105" rx="10" ry="12" fill="#FFF" stroke="#000" strokeWidth="2"/>
    <circle cx="82" cy="107" r="6" fill="#990000"/>
    <circle cx="122" cy="107" r="6" fill="#990000"/>
    <circle cx="82" cy="107" r="3" fill="#000"/>
    <circle cx="122" cy="107" r="3" fill="#000"/>
    <circle cx="84" cy="104" r="2" fill="#FFF"/>
    <circle cx="124" cy="104" r="2" fill="#FFF"/>
    <path d="M68 92 L90 100" stroke="#000" strokeWidth="4" strokeLinecap="round"/>
    <path d="M132 92 L110 100" stroke="#000" strokeWidth="4" strokeLinecap="round"/>
    <path d="M85 135 Q100 145 115 135" stroke="#000" strokeWidth="3" fill="none"/>
  </svg>
);

export default TommyTrojanAvatar;
