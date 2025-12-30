import React from 'react';
import { AvatarProps } from './types';

const HoosiersAvatar: React.FC<AvatarProps> = ({ size = 40 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size}>
    <defs>
      <linearGradient id="iuBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#990000"/>
        <stop offset="100%" stopColor="#6B0000"/>
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#iuBg)"/>
    <ellipse cx="100" cy="105" rx="60" ry="55" fill="#5D4037" stroke="#000" strokeWidth="4"/>
    <ellipse cx="100" cy="90" rx="65" ry="45" fill="#3E2723" stroke="#000" strokeWidth="2"/>
    <path d="M45 70 Q25 50 35 30" stroke="#F5DEB3" strokeWidth="12" fill="none" strokeLinecap="round"/>
    <path d="M155 70 Q175 50 165 30" stroke="#F5DEB3" strokeWidth="12" fill="none" strokeLinecap="round"/>
    <path d="M45 70 Q25 50 35 30" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round"/>
    <path d="M155 70 Q175 50 165 30" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round"/>
    <ellipse cx="100" cy="120" rx="35" ry="30" fill="#5D4037" stroke="#000" strokeWidth="2"/>
    <ellipse cx="75" cy="100" rx="12" ry="14" fill="#FFF" stroke="#000" strokeWidth="2"/>
    <ellipse cx="125" cy="100" rx="12" ry="14" fill="#FFF" stroke="#000" strokeWidth="2"/>
    <circle cx="77" cy="102" r="7" fill="#990000"/>
    <circle cx="127" cy="102" r="7" fill="#990000"/>
    <circle cx="77" cy="102" r="4" fill="#000"/>
    <circle cx="127" cy="102" r="4" fill="#000"/>
    <circle cx="79" cy="99" r="2" fill="#FFF"/>
    <circle cx="129" cy="99" r="2" fill="#FFF"/>
    <ellipse cx="100" cy="135" rx="15" ry="10" fill="#3E2723" stroke="#000" strokeWidth="2"/>
    <circle cx="100" cy="145" r="8" fill="none" stroke="#FFD700" strokeWidth="3"/>
    <ellipse cx="92" cy="132" rx="4" ry="3" fill="#000"/>
    <ellipse cx="108" cy="132" rx="4" ry="3" fill="#000"/>
  </svg>
);

export default HoosiersAvatar;
