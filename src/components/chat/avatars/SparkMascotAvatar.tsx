import React from 'react';
import { AvatarProps } from './types';

const SparkMascotAvatar = ({ 
  size = 40, 
  className = '',
  backgroundColorStart = '#FDCB6E',
  backgroundColorEnd = '#F39C12'
}: AvatarProps) => {
  const gradientId = `spark-grad-${Math.random().toString(36).substr(2, 9)}`;
  
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
      {/* Lightning bolts in background */}
      <path d="M30 30 L40 50 L35 50 L45 75" stroke="#FFF" strokeWidth="4" fill="none" opacity="0.4"/>
      <path d="M170 40 L160 60 L165 60 L155 85" stroke="#FFF" strokeWidth="4" fill="none" opacity="0.4"/>
      
      <g transform="rotate(2 100 100)">
        <ellipse cx="100" cy="115" rx="53" ry="55" fill="#FFEAA7" stroke="#000" strokeWidth="5"/>
        <ellipse cx="70" cy="105" rx="20" ry="24" fill="#FFF" stroke="#000" strokeWidth="3"/>
        <ellipse cx="130" cy="105" rx="20" ry="24" fill="#FFF" stroke="#000" strokeWidth="3"/>
        <ellipse cx="73" cy="107" rx="12" ry="14" fill="#F39C12"/>
        <ellipse cx="133" cy="107" rx="12" ry="14" fill="#F39C12"/>
        <circle cx="73" cy="107" r="7" fill="#000"/>
        <circle cx="133" cy="107" r="7" fill="#000"/>
        <circle cx="77" cy="100" r="5" fill="#FFF"/>
        <circle cx="137" cy="100" r="5" fill="#FFF"/>
        <path d="M48 85 Q68 73 90 85" stroke="#000" strokeWidth="6" fill="none" strokeLinecap="round"/>
        <path d="M152 85 Q132 73 110 85" stroke="#000" strokeWidth="6" fill="none" strokeLinecap="round"/>
        <path d="M68 142 Q100 175 132 142" fill="#C0392B" stroke="#000" strokeWidth="4"/>
        <path d="M73 142 Q100 165 127 142" fill="#FFF"/>
        <ellipse cx="45" cy="122" rx="10" ry="7" fill="#FDCB6E" opacity="0.6"/>
        <ellipse cx="155" cy="122" rx="10" ry="7" fill="#FDCB6E" opacity="0.6"/>
      </g>
      
      {/* Lightning bolt hair */}
      <path d="M50 75 L40 45 L60 55 L55 25 L85 50 L80 15 L100 45 L105 5 L115 45 L140 15 L130 50 L160 25 L145 55 L170 45 L155 75" 
            fill="#F1C40F" stroke="#000" strokeWidth="4" strokeLinejoin="round"/>
      {/* Electric highlights */}
      <path d="M70 35 L75 45 L80 30" stroke="#FFF" strokeWidth="3" fill="none"/>
      <path d="M120 30 L125 42 L130 28" stroke="#FFF" strokeWidth="3" fill="none"/>
      
      <g transform="translate(160, 50)">
        <polygon points="0,-22 6,-8 22,-8 10,4 14,22 0,12 -14,22 -10,4 -22,-8 -6,-8" 
                 fill="#FFF" stroke="#000" strokeWidth="3"/>
        <text x="-8" y="4" fontSize="10" fontWeight="bold" fill="#F39C12">ZAP</text>
      </g>
    </svg>
  );
};

export default SparkMascotAvatar;
