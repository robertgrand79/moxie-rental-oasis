import React from 'react';
import { AvatarProps } from './types';

const ScarletKnightAvatar: React.FC<AvatarProps> = ({ size = 40 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size}>
    <defs>
      <linearGradient id="ruBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#CC0033"/>
        <stop offset="100%" stopColor="#990026"/>
      </linearGradient>
      <linearGradient id="helmet" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#7F8C8D"/>
        <stop offset="100%" stopColor="#5F6A72"/>
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#ruBg)"/>
    <ellipse cx="100" cy="100" rx="55" ry="60" fill="url(#helmet)" stroke="#000" strokeWidth="4"/>
    <rect x="55" y="95" width="90" height="15" fill="#1A1A2E" stroke="#000" strokeWidth="2"/>
    <ellipse cx="78" cy="102" rx="10" ry="6" fill="#FFF"/>
    <ellipse cx="122" cy="102" rx="10" ry="6" fill="#FFF"/>
    <ellipse cx="80" cy="102" rx="5" ry="4" fill="#CC0033"/>
    <ellipse cx="124" cy="102" rx="5" ry="4" fill="#CC0033"/>
    <path d="M100 20 L90 45 L95 45 L95 55 L105 55 L105 45 L110 45 Z" fill="#CC0033" stroke="#000" strokeWidth="3"/>
    <path d="M100 20 Q85 10 90 0 Q100 10 100 20" fill="#FFF" stroke="#000" strokeWidth="2"/>
    <path d="M100 20 Q115 10 110 0 Q100 10 100 20" fill="#FFF" stroke="#000" strokeWidth="2"/>
    <line x1="55" y1="80" x2="145" y2="80" stroke="#5F6A72" strokeWidth="4"/>
    <line x1="100" y1="55" x2="100" y2="80" stroke="#5F6A72" strokeWidth="4"/>
    <path d="M60 115 Q100 150 140 115" fill="url(#helmet)" stroke="#000" strokeWidth="3"/>
    <circle cx="70" cy="125" r="3" fill="#1A1A2E"/>
    <circle cx="82" cy="130" r="3" fill="#1A1A2E"/>
    <circle cx="118" cy="130" r="3" fill="#1A1A2E"/>
    <circle cx="130" cy="125" r="3" fill="#1A1A2E"/>
    <path d="M60 155 L100 145 L140 155" stroke="#5F6A72" strokeWidth="8"/>
  </svg>
);

export default ScarletKnightAvatar;
