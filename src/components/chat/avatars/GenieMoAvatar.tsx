import React from 'react';
import { AvatarProps } from './types';

const GenieMoAvatar: React.FC<AvatarProps> = ({ size = 40 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size}>
    <defs>
      <linearGradient id="genieBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#A29BFE"/>
        <stop offset="100%" stopColor="#6C5CE7"/>
      </linearGradient>
      <linearGradient id="genieBody" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00CEC9"/>
        <stop offset="100%" stopColor="#00B894"/>
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#genieBg)"/>
    {/* Sparkles */}
    <polygon points="30,50 33,58 40,58 35,63 37,72 30,67 23,72 25,63 20,58 27,58" fill="#FDCB6E"/>
    <polygon points="170,40 172,46 178,46 174,50 175,56 170,53 165,56 166,50 162,46 168,46" fill="#FDCB6E"/>
    <polygon points="165,140 167,145 172,145 168,148 169,153 165,150 161,153 162,148 158,145 163,145" fill="#FDCB6E"/>
    {/* Smoke trail body */}
    <path d="M100 180 Q80 160 90 140 Q75 130 100 115" fill="url(#genieBody)" stroke="#000" strokeWidth="4"/>
    <path d="M100 180 Q120 160 110 140 Q125 130 100 115" fill="url(#genieBody)" stroke="#000" strokeWidth="4"/>
    {/* Genie head */}
    <ellipse cx="100" cy="85" rx="45" ry="42" fill="url(#genieBody)" stroke="#000" strokeWidth="4"/>
    {/* Turban */}
    <ellipse cx="100" cy="55" rx="42" ry="22" fill="#E17055" stroke="#000" strokeWidth="3"/>
    <ellipse cx="100" cy="48" rx="35" ry="15" fill="#D63031" stroke="#000" strokeWidth="2"/>
    {/* Gem */}
    <ellipse cx="100" cy="55" rx="10" ry="8" fill="#FDCB6E" stroke="#000" strokeWidth="2"/>
    <ellipse cx="98" cy="53" rx="3" ry="2" fill="#FFF" opacity="0.5"/>
    {/* Feather */}
    <path d="M100 38 Q105 25 100 15 Q95 25 100 38" fill="#FFF" stroke="#000" strokeWidth="2"/>
    {/* Eyes */}
    <ellipse cx="80" cy="82" rx="12" ry="14" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <ellipse cx="120" cy="82" rx="12" ry="14" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <ellipse cx="82" cy="84" rx="7" ry="8" fill="#6C5CE7"/>
    <ellipse cx="122" cy="84" rx="7" ry="8" fill="#6C5CE7"/>
    <circle cx="82" cy="84" r="4" fill="#000"/>
    <circle cx="122" cy="84" r="4" fill="#000"/>
    <circle cx="84" cy="80" r="3" fill="#FFF"/>
    <circle cx="124" cy="80" r="3" fill="#FFF"/>
    {/* Big eyebrows */}
    <path d="M62 68 Q80 60 95 72" stroke="#000" strokeWidth="5" fill="none" strokeLinecap="round"/>
    <path d="M138 68 Q120 60 105 72" stroke="#000" strokeWidth="5" fill="none" strokeLinecap="round"/>
    {/* Goatee */}
    <ellipse cx="100" cy="118" rx="8" ry="10" fill="#008B7A" stroke="#000" strokeWidth="2"/>
    {/* Smile */}
    <path d="M82 100 Q100 115 118 100" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round"/>
    {/* Ears/earrings */}
    <circle cx="52" cy="85" r="6" fill="#FDCB6E" stroke="#000" strokeWidth="2"/>
    <circle cx="148" cy="85" r="6" fill="#FDCB6E" stroke="#000" strokeWidth="2"/>
    {/* Arms crossed */}
    <ellipse cx="65" cy="120" rx="18" ry="12" fill="url(#genieBody)" stroke="#000" strokeWidth="3"/>
    <ellipse cx="135" cy="120" rx="18" ry="12" fill="url(#genieBody)" stroke="#000" strokeWidth="3"/>
  </svg>
);

export default GenieMoAvatar;
