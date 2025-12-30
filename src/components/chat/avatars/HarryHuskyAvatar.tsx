import React from 'react';
import { AvatarProps } from './types';

const HarryHuskyAvatar: React.FC<AvatarProps> = ({ size = 40 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size}>
    <defs>
      <linearGradient id="uwBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4B2E83"/>
        <stop offset="100%" stopColor="#362161"/>
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#uwBg)"/>
    <ellipse cx="100" cy="105" rx="58" ry="55" fill="#808080" stroke="#000" strokeWidth="4"/>
    <path d="M55 90 Q100 70 145 90 Q145 140 100 160 Q55 140 55 90" fill="#FFF" stroke="#000" strokeWidth="2"/>
    <path d="M40 70 L30 25 L65 60 Z" fill="#808080" stroke="#000" strokeWidth="3"/>
    <path d="M160 70 L170 25 L135 60 Z" fill="#808080" stroke="#000" strokeWidth="3"/>
    <path d="M45 65 L40 35 L60 58 Z" fill="#FFF"/>
    <path d="M155 65 L160 35 L140 58 Z" fill="#FFF"/>
    <ellipse cx="75" cy="100" rx="16" ry="18" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <ellipse cx="125" cy="100" rx="16" ry="18" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <circle cx="77" cy="102" r="10" fill="#4B2E83"/>
    <circle cx="127" cy="102" r="10" fill="#4B2E83"/>
    <circle cx="77" cy="102" r="5" fill="#000"/>
    <circle cx="127" cy="102" r="5" fill="#000"/>
    <circle cx="80" cy="98" r="4" fill="#FFF"/>
    <circle cx="130" cy="98" r="4" fill="#FFF"/>
    <path d="M55 82 L90 95" stroke="#808080" strokeWidth="6" strokeLinecap="round"/>
    <path d="M145 82 L110 95" stroke="#808080" strokeWidth="6" strokeLinecap="round"/>
    <ellipse cx="100" cy="130" rx="12" ry="10" fill="#000" stroke="#000" strokeWidth="2"/>
    <ellipse cx="97" cy="127" rx="4" ry="3" fill="#FFF" opacity="0.3"/>
    <path d="M100 140 L100 148" stroke="#000" strokeWidth="3"/>
    <path d="M85 152 Q100 165 115 152" stroke="#000" strokeWidth="3" fill="none"/>
    <ellipse cx="100" cy="160" rx="10" ry="8" fill="#FF6B6B" stroke="#000" strokeWidth="2"/>
  </svg>
);

export default HarryHuskyAvatar;
