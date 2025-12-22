import React from 'react';
import { AvatarProps } from './types';

const MintMascotAvatar = ({ 
  size = 40, 
  className = '',
  backgroundColorStart = '#81ECEC',
  backgroundColorEnd = '#00CEC9'
}: AvatarProps) => {
  const gradientId = `mint-grad-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={backgroundColorStart}/>
          <stop offset="100%" stopColor={backgroundColorEnd}/>
        </linearGradient>
      </defs>
      
      <circle cx="100" cy="100" r="95" fill={`url(#${gradientId})`}/>
      <circle cx="40" cy="45" r="14" fill="#FFF" opacity="0.2"/>
      <circle cx="160" cy="155" r="16" fill="#FFF" opacity="0.2"/>
      
      <g transform="rotate(2 100 100)">
        <ellipse cx="100" cy="115" rx="52" ry="54" fill="#FFEAA7" stroke="#000" strokeWidth="5"/>
        <ellipse cx="72" cy="105" rx="18" ry="22" fill="#FFF" stroke="#000" strokeWidth="3"/>
        <ellipse cx="128" cy="105" rx="18" ry="22" fill="#FFF" stroke="#000" strokeWidth="3"/>
        <ellipse cx="74" cy="107" rx="10" ry="12" fill="#00CEC9"/>
        <ellipse cx="130" cy="107" rx="10" ry="12" fill="#00CEC9"/>
        <circle cx="74" cy="107" r="6" fill="#000"/>
        <circle cx="130" cy="107" r="6" fill="#000"/>
        <circle cx="78" cy="100" r="4" fill="#FFF"/>
        <circle cx="134" cy="100" r="4" fill="#FFF"/>
        <path d="M52 88 Q70 78 88 88" stroke="#000" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <path d="M148 88 Q130 78 112 88" stroke="#000" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <path d="M70 142 Q100 168 130 142" fill="#C0392B" stroke="#000" strokeWidth="4"/>
        <path d="M75 142 Q100 158 125 142" fill="#FFF"/>
        <ellipse cx="48" cy="122" rx="10" ry="7" fill="#74B9FF" opacity="0.5"/>
        <ellipse cx="152" cy="122" rx="10" ry="7" fill="#74B9FF" opacity="0.5"/>
      </g>
      
      {/* Short messy hair */}
      <path d="M50 80 Q45 50 65 40 Q85 30 100 35 Q115 30 135 40 Q155 50 150 80 Q135 70 100 68 Q65 70 50 80" 
            fill="#2D3436" stroke="#000" strokeWidth="4"/>
      <path d="M60 55 L55 40 M80 45 L78 28 M100 42 L100 25 M120 45 L122 28 M140 55 L145 40" 
            stroke="#2D3436" strokeWidth="8" strokeLinecap="round"/>
      
      {/* Headphones */}
      <path d="M35 90 Q35 45 100 45 Q165 45 165 90" stroke="#FF6B6B" strokeWidth="8" fill="none"/>
      <ellipse cx="35" cy="100" rx="15" ry="20" fill="#FF6B6B" stroke="#000" strokeWidth="3"/>
      <ellipse cx="165" cy="100" rx="15" ry="20" fill="#FF6B6B" stroke="#000" strokeWidth="3"/>
      <ellipse cx="35" cy="100" rx="8" ry="12" fill="#2D3436"/>
      <ellipse cx="165" cy="100" rx="8" ry="12" fill="#2D3436"/>
      
      {/* Music notes */}
      <g transform="translate(165, 45)">
        <ellipse cx="0" cy="0" rx="18" ry="14" fill="#FFF" stroke="#000" strokeWidth="3"/>
        <path d="M-6 12 L-2 20 L4 12" fill="#FFF" stroke="#000" strokeWidth="3"/>
        <text x="-4" y="3" fontSize="14" fontWeight="bold" fill="#00CEC9">♪</text>
      </g>
    </svg>
  );
};

export default MintMascotAvatar;
