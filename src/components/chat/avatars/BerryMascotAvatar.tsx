import React from 'react';
import { AvatarProps } from './types';

const BerryMascotAvatar = ({ 
  size = 40, 
  className = '',
  backgroundColorStart = '#A29BFE',
  backgroundColorEnd = '#6C5CE7'
}: AvatarProps) => {
  const gradientId = `berry-grad-${Math.random().toString(36).substr(2, 9)}`;
  
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
      <circle cx="35" cy="55" r="12" fill="#FFF" opacity="0.2"/>
      <circle cx="165" cy="145" r="18" fill="#FFF" opacity="0.2"/>
      
      <g transform="rotate(-4 100 100)">
        <ellipse cx="100" cy="115" rx="50" ry="52" fill="#FFEAA7" stroke="#000" strokeWidth="5"/>
        <ellipse cx="72" cy="105" rx="18" ry="22" fill="#FFF" stroke="#000" strokeWidth="3"/>
        <ellipse cx="128" cy="105" rx="18" ry="22" fill="#FFF" stroke="#000" strokeWidth="3"/>
        <ellipse cx="74" cy="107" rx="10" ry="12" fill="#6C5CE7"/>
        <ellipse cx="130" cy="107" rx="10" ry="12" fill="#6C5CE7"/>
        <circle cx="74" cy="107" r="6" fill="#000"/>
        <circle cx="130" cy="107" r="6" fill="#000"/>
        <circle cx="78" cy="100" r="4" fill="#FFF"/>
        <circle cx="134" cy="100" r="4" fill="#FFF"/>
        <circle cx="72" cy="110" r="2" fill="#FFF"/>
        <circle cx="128" cy="110" r="2" fill="#FFF"/>
        <path d="M55 88 Q72 80 88 90" stroke="#000" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <path d="M145 88 Q128 80 112 90" stroke="#000" strokeWidth="5" fill="none" strokeLinecap="round"/>
        <path d="M70 142 Q100 168 130 142" fill="#E74C3C" stroke="#000" strokeWidth="4"/>
        <path d="M75 142 Q100 160 125 142" fill="#FFF"/>
        <ellipse cx="100" cy="156" rx="10" ry="7" fill="#E74C3C"/>
        <ellipse cx="48" cy="122" rx="10" ry="7" fill="#FF9FF3" opacity="0.6"/>
        <ellipse cx="152" cy="122" rx="10" ry="7" fill="#FF9FF3" opacity="0.6"/>
      </g>
      
      {/* Hair base */}
      <ellipse cx="100" cy="65" rx="55" ry="30" fill="#E056FD" stroke="#000" strokeWidth="4"/>
      {/* Pigtails */}
      <ellipse cx="30" cy="90" rx="25" ry="35" fill="#E056FD" stroke="#000" strokeWidth="4"/>
      <ellipse cx="170" cy="90" rx="25" ry="35" fill="#E056FD" stroke="#000" strokeWidth="4"/>
      {/* Hair ties */}
      <ellipse cx="50" cy="65" rx="8" ry="10" fill="#FD79A8" stroke="#000" strokeWidth="3"/>
      <ellipse cx="150" cy="65" rx="8" ry="10" fill="#FD79A8" stroke="#000" strokeWidth="3"/>
      {/* Bangs */}
      <path d="M55 72 Q70 55 85 72 Q100 50 115 72 Q130 55 145 72" fill="#E056FD" stroke="#000" strokeWidth="3"/>
      {/* Hair shine */}
      <path d="M70 50 Q85 42 100 50" stroke="#FFF" strokeWidth="4" fill="none" opacity="0.5"/>
      
      <g transform="translate(155, 35)">
        <path d="M-15 0 L15 0 L12 -15 L18 -15 L0 -30 L-18 -15 L-12 -15 Z" fill="#FFF" stroke="#000" strokeWidth="3"/>
        <text x="-5" y="-5" fontSize="8" fontWeight="bold" fill="#6C5CE7">YAY</text>
      </g>
    </svg>
  );
};

export default BerryMascotAvatar;
