import React from 'react';
import { AvatarProps } from './types';

const BlobbyAvatar: React.FC<AvatarProps> = ({ size = 40 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size}>
    <defs>
      <linearGradient id="blobbyBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00CEC9"/>
        <stop offset="100%" stopColor="#00B894"/>
      </linearGradient>
      <linearGradient id="blobGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#A29BFE"/>
        <stop offset="100%" stopColor="#6C5CE7"/>
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#blobbyBg)"/>
    {/* Decorative dots */}
    <circle cx="35" cy="45" r="8" fill="#FFF" opacity="0.3"/>
    <circle cx="165" cy="55" r="6" fill="#FFF" opacity="0.3"/>
    <circle cx="40" cy="155" r="5" fill="#FFF" opacity="0.3"/>
    <circle cx="160" cy="150" r="7" fill="#FFF" opacity="0.3"/>
    {/* Blob body - organic shape */}
    <path d="M40 100 
             Q35 60 70 50 
             Q100 35 130 50 
             Q165 60 160 100 
             Q165 145 130 155 
             Q100 170 70 155 
             Q35 145 40 100" 
          fill="url(#blobGrad)" stroke="#000" strokeWidth="5"/>
    {/* Shine */}
    <ellipse cx="70" cy="70" rx="20" ry="15" fill="#FFF" opacity="0.3"/>
    {/* Eyes */}
    <ellipse cx="75" cy="95" rx="18" ry="22" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <ellipse cx="125" cy="95" rx="18" ry="22" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <ellipse cx="78" cy="98" rx="11" ry="14" fill="#2D3436"/>
    <ellipse cx="128" cy="98" rx="11" ry="14" fill="#2D3436"/>
    <circle cx="82" cy="92" r="5" fill="#FFF"/>
    <circle cx="132" cy="92" r="5" fill="#FFF"/>
    <circle cx="76" cy="102" r="2" fill="#FFF"/>
    <circle cx="126" cy="102" r="2" fill="#FFF"/>
    {/* Cute eyebrows */}
    <path d="M55 75 Q75 65 92 77" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round"/>
    <path d="M145 75 Q125 65 108 77" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round"/>
    {/* Big happy smile */}
    <path d="M70 125 Q100 155 130 125" fill="#4A3F8A" stroke="#000" strokeWidth="4"/>
    <path d="M75 125 Q100 148 125 125" fill="#FFF"/>
    {/* Tongue */}
    <ellipse cx="100" cy="140" rx="12" ry="8" fill="#FF6B6B"/>
    {/* Blush */}
    <ellipse cx="50" cy="110" rx="10" ry="6" fill="#FF9FF3" opacity="0.5"/>
    <ellipse cx="150" cy="110" rx="10" ry="6" fill="#FF9FF3" opacity="0.5"/>
    {/* Little arms */}
    <ellipse cx="35" cy="110" rx="12" ry="8" fill="url(#blobGrad)" stroke="#000" strokeWidth="3"/>
    <ellipse cx="165" cy="110" rx="12" ry="8" fill="url(#blobGrad)" stroke="#000" strokeWidth="3"/>
  </svg>
);

export default BlobbyAvatar;
