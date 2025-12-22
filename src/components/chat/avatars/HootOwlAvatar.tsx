import React from 'react';
import { AvatarProps } from './types';

const HootOwlAvatar: React.FC<AvatarProps> = ({ size = 40 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size}>
    <defs>
      <linearGradient id="owlBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6C5CE7"/>
        <stop offset="100%" stopColor="#5541D7"/>
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#owlBg)"/>
    {/* Stars */}
    <circle cx="30" cy="40" r="3" fill="#FFF"/>
    <circle cx="170" cy="50" r="2" fill="#FFF"/>
    <circle cx="25" cy="80" r="2" fill="#FFF"/>
    <circle cx="175" cy="90" r="3" fill="#FFF"/>
    {/* Owl body */}
    <ellipse cx="100" cy="120" rx="55" ry="55" fill="#8D6E63" stroke="#000" strokeWidth="4"/>
    {/* Belly */}
    <ellipse cx="100" cy="140" rx="35" ry="35" fill="#D7CCC8" stroke="#000" strokeWidth="2"/>
    {/* Belly pattern */}
    <path d="M75 130 Q100 125 125 130" stroke="#A1887F" strokeWidth="2" fill="none"/>
    <path d="M80 145 Q100 140 120 145" stroke="#A1887F" strokeWidth="2" fill="none"/>
    <path d="M85 160 Q100 155 115 160" stroke="#A1887F" strokeWidth="2" fill="none"/>
    {/* Ear tufts */}
    <path d="M55 65 L45 30 L70 55 L60 25 L80 50" fill="#8D6E63" stroke="#000" strokeWidth="3"/>
    <path d="M145 65 L155 30 L130 55 L140 25 L120 50" fill="#8D6E63" stroke="#000" strokeWidth="3"/>
    {/* Eye circles */}
    <circle cx="70" cy="95" r="28" fill="#FFF" stroke="#000" strokeWidth="4"/>
    <circle cx="130" cy="95" r="28" fill="#FFF" stroke="#000" strokeWidth="4"/>
    {/* Eyes */}
    <circle cx="70" cy="95" r="18" fill="#F39C12"/>
    <circle cx="130" cy="95" r="18" fill="#F39C12"/>
    <circle cx="70" cy="95" r="10" fill="#000"/>
    <circle cx="130" cy="95" r="10" fill="#000"/>
    <circle cx="74" cy="90" r="5" fill="#FFF"/>
    <circle cx="134" cy="90" r="5" fill="#FFF"/>
    {/* Beak */}
    <path d="M90 115 L100 135 L110 115 Z" fill="#F39C12" stroke="#000" strokeWidth="3"/>
    {/* Eyebrows */}
    <path d="M45 70 L70 80 L95 72" stroke="#5D4037" strokeWidth="4" fill="none" strokeLinecap="round"/>
    <path d="M155 70 L130 80 L105 72" stroke="#5D4037" strokeWidth="4" fill="none" strokeLinecap="round"/>
    {/* Wings hint */}
    <path d="M45 120 Q35 140 45 160" stroke="#5D4037" strokeWidth="6" fill="none"/>
    <path d="M155 120 Q165 140 155 160" stroke="#5D4037" strokeWidth="6" fill="none"/>
  </svg>
);

export default HootOwlAvatar;
