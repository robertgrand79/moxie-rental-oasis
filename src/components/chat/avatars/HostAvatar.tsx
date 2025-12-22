import React from 'react';
import { AvatarProps } from './types';

const HostAvatar = ({ size = 40, className = '', backgroundColorStart = '#E8B4B8', backgroundColorEnd = '#D4A5A5' }: AvatarProps) => {
  const gradientId = `host-gradient-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="48" fill={`url(#${gradientId})`} />
      <ellipse cx="50" cy="52" rx="27" ry="29" fill="#FFDAB9" />
      <path d="M22 55C22 35 33 18 50 18C67 18 78 35 78 55C78 60 77 65 75 70C72 55 62 45 50 45C38 45 28 55 25 70C23 65 22 60 22 55Z" fill="#D4A574" />
      <ellipse cx="40" cy="50" rx="4" ry="5" fill="#5D4E37" /><ellipse cx="60" cy="50" rx="4" ry="5" fill="#5D4E37" />
      <circle cx="41" cy="49" r="1.5" fill="white" /><circle cx="61" cy="49" r="1.5" fill="white" />
      <ellipse cx="32" cy="58" rx="5" ry="3" fill="#FFB6C1" opacity="0.5" /><ellipse cx="68" cy="58" rx="5" ry="3" fill="#FFB6C1" opacity="0.5" />
      <path d="M40 65C44 72 56 72 60 65" stroke="#C4956A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M35 85L50 80L65 85" stroke="#8B7355" strokeWidth="5" strokeLinecap="round" />
      <defs><linearGradient id={gradientId} x1="0" y1="0" x2="100" y2="100"><stop stopColor={backgroundColorStart} /><stop offset="1" stopColor={backgroundColorEnd} /></linearGradient></defs>
    </svg>
  );
};
export default HostAvatar;
