import React from 'react';
import { AvatarProps } from './types';

const AssistantAvatar = ({ 
  size = 40, 
  className = '',
  backgroundColorStart = '#9B59B6',
  backgroundColorEnd = '#8E44AD'
}: AvatarProps) => {
  const gradientId = `assistant-gradient-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background circle */}
      <circle cx="50" cy="50" r="48" fill={`url(#${gradientId})`} />
      
      {/* Face */}
      <ellipse cx="50" cy="53" rx="26" ry="28" fill="#FFE4C4" />
      
      {/* Ponytail hair */}
      <path
        d="M26 46C26 30 36 20 50 20C64 20 74 30 74 46C74 48 73 50 72 52C70 38 61 30 50 30C39 30 30 38 28 52C27 50 26 48 26 46Z"
        fill="#8B4513"
      />
      
      {/* Side ponytail */}
      <ellipse cx="78" cy="45" rx="6" ry="12" fill="#8B4513" />
      <path d="M76 35C82 38 85 50 82 60" stroke="#8B4513" strokeWidth="8" strokeLinecap="round" />
      
      {/* Hair tie */}
      <ellipse cx="78" cy="40" rx="3" ry="4" fill="#9B59B6" />
      
      {/* Eyes */}
      <ellipse cx="40" cy="50" rx="5" ry="6" fill="#4A3728" />
      <ellipse cx="60" cy="50" rx="5" ry="6" fill="#4A3728" />
      <circle cx="41.5" cy="49" r="2" fill="white" />
      <circle cx="61.5" cy="49" r="2" fill="white" />
      
      {/* Eyelashes */}
      <path d="M35 45L33 42" stroke="#4A3728" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M38 44L37 41" stroke="#4A3728" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M62 44L63 41" stroke="#4A3728" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M65 45L67 42" stroke="#4A3728" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Friendly eyebrows */}
      <path d="M35 43C37 41 43 41 45 43" stroke="#8B4513" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M55 43C57 41 63 41 65 43" stroke="#8B4513" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Rosy cheeks */}
      <ellipse cx="32" cy="58" rx="4" ry="2.5" fill="#FFB6C1" opacity="0.6" />
      <ellipse cx="68" cy="58" rx="4" ry="2.5" fill="#FFB6C1" opacity="0.6" />
      
      {/* Cheerful smile */}
      <path
        d="M40 65C44 72 56 72 60 65"
        stroke="#C4956A"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Casual top collar */}
      <path d="M35 88L50 82L65 88" stroke="#9B59B6" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="50" cy="84" rx="3" ry="2" fill="#E8DAEF" />
      
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="100" y2="100">
          <stop stopColor={backgroundColorStart} />
          <stop offset="1" stopColor={backgroundColorEnd} />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default AssistantAvatar;
