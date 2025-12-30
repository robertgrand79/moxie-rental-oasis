import React from 'react';
import { AvatarProps } from './types';

const BuckyBadgerAvatar: React.FC<AvatarProps> = ({ size = 40 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size}>
    <defs>
      <linearGradient id="wiscBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#C5050C"/>
        <stop offset="100%" stopColor="#9B0000"/>
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#wiscBg)"/>
    <ellipse cx="100" cy="105" rx="58" ry="55" fill="#FFF" stroke="#000" strokeWidth="4"/>
    <path d="M45 80 Q60 100 55 130" fill="#000" stroke="#000" strokeWidth="15"/>
    <path d="M155 80 Q140 100 145 130" fill="#000" stroke="#000" strokeWidth="15"/>
    <rect x="90" y="50" width="20" height="80" fill="#000"/>
    <ellipse cx="55" cy="55" rx="18" ry="22" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <ellipse cx="145" cy="55" rx="18" ry="22" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <ellipse cx="55" cy="58" rx="10" ry="12" fill="#FFB6C1"/>
    <ellipse cx="145" cy="58" rx="10" ry="12" fill="#FFB6C1"/>
    <ellipse cx="72" cy="100" rx="14" ry="16" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <ellipse cx="128" cy="100" rx="14" ry="16" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <circle cx="74" cy="102" r="8" fill="#000"/>
    <circle cx="130" cy="102" r="8" fill="#000"/>
    <circle cx="76" cy="99" r="3" fill="#FFF"/>
    <circle cx="132" cy="99" r="3" fill="#FFF"/>
    <ellipse cx="100" cy="125" rx="12" ry="10" fill="#000"/>
    <ellipse cx="97" cy="122" rx="4" ry="3" fill="#FFF" opacity="0.3"/>
    <path d="M85 140 Q100 155 115 140" stroke="#000" strokeWidth="4" fill="none"/>
    <path d="M60 160 L100 150 L140 160" stroke="#C5050C" strokeWidth="8"/>
    <text x="90" y="175" fontSize="16" fontWeight="bold" fill="#FFF">W</text>
  </svg>
);

export default BuckyBadgerAvatar;
