import React from 'react';
import { AvatarProps } from './types';

const RoseMascotAvatar = ({ 
  size = 40, 
  className = '',
  backgroundColorStart = '#FD79A8',
  backgroundColorEnd = '#E84393'
}: AvatarProps) => {
  const gradientId = `rose-grad-${Math.random().toString(36).substr(2, 9)}`;
  
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
      <circle cx="35" cy="50" r="12" fill="#FFF" opacity="0.2"/>
      <circle cx="165" cy="150" r="18" fill="#FFF" opacity="0.2"/>
      {/* Hearts in background */}
      <path d="M30 70 C30 60 45 60 45 70 C45 80 30 90 30 90 C30 90 15 80 15 70 C15 60 30 60 30 70" fill="#FFF" opacity="0.2"/>
      <path d="M170 130 C170 122 182 122 182 130 C182 138 170 146 170 146 C170 146 158 138 158 130 C158 122 170 122 170 130" fill="#FFF" opacity="0.2"/>
      
      <g transform="rotate(-3 100 100)">
        <ellipse cx="100" cy="118" rx="50" ry="52" fill="#FFEAA7" stroke="#000" strokeWidth="5"/>
        <ellipse cx="72" cy="108" rx="17" ry="21" fill="#FFF" stroke="#000" strokeWidth="3"/>
        <ellipse cx="128" cy="108" rx="17" ry="21" fill="#FFF" stroke="#000" strokeWidth="3"/>
        <ellipse cx="74" cy="110" rx="9" ry="11" fill="#E84393"/>
        <ellipse cx="130" cy="110" rx="9" ry="11" fill="#E84393"/>
        <circle cx="74" cy="110" r="5" fill="#000"/>
        <circle cx="130" cy="110" r="5" fill="#000"/>
        <circle cx="77" cy="104" r="4" fill="#FFF"/>
        <circle cx="133" cy="104" r="4" fill="#FFF"/>
        {/* Cute closed happy eyes */}
        <path d="M55 95 Q70 88 85 95" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <path d="M145 95 Q130 88 115 95" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <path d="M72 145 Q100 170 128 145" fill="#FF6B6B" stroke="#000" strokeWidth="4"/>
        <path d="M77 145 Q100 162 123 145" fill="#FFF"/>
        <ellipse cx="50" cy="125" rx="10" ry="7" fill="#FF9FF3" opacity="0.7"/>
        <ellipse cx="150" cy="125" rx="10" ry="7" fill="#FF9FF3" opacity="0.7"/>
      </g>
      
      {/* Wavy hair */}
      <path d="M45 85 Q40 60 55 45 Q75 25 100 28 Q125 25 145 45 Q160 60 155 85 Q140 70 100 68 Q60 70 45 85" 
            fill="#5D4037" stroke="#000" strokeWidth="4"/>
      <path d="M45 85 Q35 100 40 120" stroke="#5D4037" strokeWidth="15" strokeLinecap="round"/>
      <path d="M155 85 Q165 100 160 120" stroke="#5D4037" strokeWidth="15" strokeLinecap="round"/>
      <path d="M45 85 Q35 100 40 120" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round"/>
      <path d="M155 85 Q165 100 160 120" stroke="#000" strokeWidth="4" fill="none" strokeLinecap="round"/>
      
      {/* Flower crown */}
      <ellipse cx="60" cy="55" rx="12" ry="10" fill="#FF6B6B" stroke="#000" strokeWidth="2"/>
      <circle cx="60" cy="55" r="5" fill="#FDCB6E"/>
      <ellipse cx="100" cy="42" rx="14" ry="12" fill="#74B9FF" stroke="#000" strokeWidth="2"/>
      <circle cx="100" cy="42" r="6" fill="#FDCB6E"/>
      <ellipse cx="140" cy="55" rx="12" ry="10" fill="#A29BFE" stroke="#000" strokeWidth="2"/>
      <circle cx="140" cy="55" r="5" fill="#FDCB6E"/>
      <ellipse cx="80" cy="48" rx="10" ry="8" fill="#00CEC9" stroke="#000" strokeWidth="2"/>
      <circle cx="80" cy="48" r="4" fill="#FDCB6E"/>
      <ellipse cx="120" cy="48" rx="10" ry="8" fill="#FD79A8" stroke="#000" strokeWidth="2"/>
      <circle cx="120" cy="48" r="4" fill="#FDCB6E"/>
      {/* Leaves */}
      <ellipse cx="70" cy="60" rx="6" ry="3" fill="#00B894" stroke="#000" strokeWidth="1" transform="rotate(-30 70 60)"/>
      <ellipse cx="130" cy="60" rx="6" ry="3" fill="#00B894" stroke="#000" strokeWidth="1" transform="rotate(30 130 60)"/>
      
      <g transform="translate(40, 38)">
        <path d="M-12 0 C-12 -8 0 -8 0 0 C0 -8 12 -8 12 0 C12 10 0 18 0 18 C0 18 -12 10 -12 0" 
              fill="#FFF" stroke="#000" strokeWidth="2"/>
      </g>
    </svg>
  );
};

export default RoseMascotAvatar;
