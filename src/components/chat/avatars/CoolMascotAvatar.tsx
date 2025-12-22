import React from 'react';
import { AvatarProps } from './types';

const CoolMascotAvatar = ({ 
  size = 40, 
  className = '',
  backgroundColorStart = '#74B9FF',
  backgroundColorEnd = '#0984E3'
}: AvatarProps) => {
  const gradientId = `cool-grad-${Math.random().toString(36).substr(2, 9)}`;
  
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
      <circle cx="40" cy="50" r="14" fill="#FFF" opacity="0.2"/>
      <circle cx="160" cy="150" r="16" fill="#FFF" opacity="0.2"/>
      
      <g transform="rotate(-3 100 100)">
        <ellipse cx="100" cy="115" rx="54" ry="56" fill="#FFEAA7" stroke="#000" strokeWidth="5"/>
        <ellipse cx="70" cy="105" rx="19" ry="23" fill="#FFF" stroke="#000" strokeWidth="3"/>
        <ellipse cx="130" cy="105" rx="19" ry="23" fill="#FFF" stroke="#000" strokeWidth="3"/>
        <ellipse cx="73" cy="107" rx="11" ry="13" fill="#0984E3"/>
        <ellipse cx="133" cy="107" rx="11" ry="13" fill="#0984E3"/>
        <circle cx="73" cy="107" r="6" fill="#000"/>
        <circle cx="133" cy="107" r="6" fill="#000"/>
        <circle cx="77" cy="100" r="5" fill="#FFF"/>
        <circle cx="137" cy="100" r="5" fill="#FFF"/>
        <circle cx="70" cy="110" r="2" fill="#FFF"/>
        <circle cx="130" cy="110" r="2" fill="#FFF"/>
        <path d="M48 88 Q68 78 88 88" stroke="#000" strokeWidth="6" fill="none" strokeLinecap="round"/>
        <path d="M152 88 Q132 78 112 88" stroke="#000" strokeWidth="6" fill="none" strokeLinecap="round"/>
        <path d="M72 145 Q100 170 128 145" fill="#C0392B" stroke="#000" strokeWidth="4"/>
        <path d="M77 145 Q100 162 123 145" fill="#FFF"/>
        <ellipse cx="100" cy="158" rx="12" ry="8" fill="#E74C3C"/>
        <ellipse cx="45" cy="125" rx="11" ry="7" fill="#A29BFE" opacity="0.5"/>
        <ellipse cx="155" cy="125" rx="11" ry="7" fill="#A29BFE" opacity="0.5"/>
      </g>
      
      {/* Swoosh hair */}
      <path d="M45 85 Q35 60 50 45 Q70 25 100 20 Q140 18 170 45 Q180 55 175 70 L160 75 Q165 55 140 40 Q110 30 80 40 Q55 50 55 75 Z" 
            fill="#6C5CE7" stroke="#000" strokeWidth="4"/>
      <path d="M170 45 Q185 35 195 50 Q200 65 185 70 L175 70" fill="#6C5CE7" stroke="#000" strokeWidth="4"/>
      {/* Hair highlight */}
      <path d="M70 45 Q100 30 140 40" stroke="#A29BFE" strokeWidth="6" fill="none" strokeLinecap="round"/>
      
      <g transform="translate(45, 40)">
        <ellipse cx="0" cy="0" rx="20" ry="16" fill="#FFF" stroke="#000" strokeWidth="3"/>
        <path d="M-8 14 L-3 22 L4 14" fill="#FFF" stroke="#000" strokeWidth="3"/>
        <text x="-12" y="5" fontSize="12" fontWeight="bold" fill="#0984E3">Yo!</text>
      </g>
    </svg>
  );
};

export default CoolMascotAvatar;
