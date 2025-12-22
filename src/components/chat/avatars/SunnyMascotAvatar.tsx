import React from 'react';
import { AvatarProps } from './types';

const SunnyMascotAvatar = ({ 
  size = 40, 
  className = '',
  backgroundColorStart = '#F39C12',
  backgroundColorEnd = '#E67E22'
}: AvatarProps) => {
  const gradientId = `sunny-grad-${Math.random().toString(36).substr(2, 9)}`;
  
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
      <circle cx="30" cy="60" r="12" fill="#FFF" opacity="0.2"/>
      <circle cx="170" cy="140" r="18" fill="#FFF" opacity="0.2"/>
      
      <g transform="rotate(3 100 100)">
        <ellipse cx="100" cy="112" rx="52" ry="55" fill="#8D6E63" stroke="#000" strokeWidth="5"/>
        <ellipse cx="72" cy="102" rx="18" ry="22" fill="#FFF" stroke="#000" strokeWidth="3"/>
        <ellipse cx="128" cy="102" rx="18" ry="22" fill="#FFF" stroke="#000" strokeWidth="3"/>
        <ellipse cx="74" cy="104" rx="10" ry="12" fill="#5D4037"/>
        <ellipse cx="130" cy="104" rx="10" ry="12" fill="#5D4037"/>
        <circle cx="78" cy="98" r="4" fill="#FFF"/>
        <circle cx="134" cy="98" r="4" fill="#FFF"/>
        <path d="M52 82 Q72 72 90 82" stroke="#000" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <path d="M148 82 Q128 72 110 82" stroke="#000" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <path d="M70 140 Q100 168 130 140" fill="#E74C3C" stroke="#000" strokeWidth="4"/>
        <path d="M75 140 Q100 158 125 140" fill="#FFF"/>
        <ellipse cx="48" cy="118" rx="10" ry="7" fill="#FF7675" opacity="0.5"/>
        <ellipse cx="152" cy="118" rx="10" ry="7" fill="#FF7675" opacity="0.5"/>
      </g>
      
      {/* Curly/afro hair */}
      <circle cx="60" cy="55" r="22" fill="#2D3436" stroke="#000" strokeWidth="3"/>
      <circle cx="100" cy="42" r="25" fill="#2D3436" stroke="#000" strokeWidth="3"/>
      <circle cx="140" cy="55" r="22" fill="#2D3436" stroke="#000" strokeWidth="3"/>
      <circle cx="75" cy="38" r="18" fill="#2D3436" stroke="#000" strokeWidth="3"/>
      <circle cx="125" cy="38" r="18" fill="#2D3436" stroke="#000" strokeWidth="3"/>
      <circle cx="50" cy="72" r="15" fill="#2D3436" stroke="#000" strokeWidth="3"/>
      <circle cx="150" cy="72" r="15" fill="#2D3436" stroke="#000" strokeWidth="3"/>
      
      {/* Sunglasses on head */}
      <g transform="translate(100, 32) rotate(-10)">
        <rect x="-35" y="-8" width="25" height="16" rx="4" fill="#000" stroke="#000" strokeWidth="2"/>
        <rect x="10" y="-8" width="25" height="16" rx="4" fill="#000" stroke="#000" strokeWidth="2"/>
        <rect x="-10" y="-2" width="20" height="4" fill="#000"/>
        <rect x="-38" y="0" width="8" height="3" fill="#000"/>
        <rect x="30" y="0" width="8" height="3" fill="#000"/>
      </g>
      
      <g transform="translate(155, 40)">
        <ellipse cx="0" cy="0" rx="20" ry="16" fill="#FFF" stroke="#000" strokeWidth="3"/>
        <path d="M-8 14 L-3 22 L4 14" fill="#FFF" stroke="#000" strokeWidth="3"/>
        <text x="-10" y="4" fontSize="11" fontWeight="bold" fill="#E67E22">Hey!</text>
      </g>
    </svg>
  );
};

export default SunnyMascotAvatar;
