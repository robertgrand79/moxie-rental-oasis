import React from 'react';
import { AvatarProps } from './types';

const ChefAvatar = ({ size = 40, className = '', backgroundColorStart = '#D32F2F', backgroundColorEnd = '#B71C1C' }: AvatarProps) => {
  const gradientId = `chef-gradient-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="48" fill={`url(#${gradientId})`} />
      <ellipse cx="50" cy="55" rx="26" ry="28" fill="#FFDAB9" />
      <ellipse cx="50" cy="18" rx="24" ry="12" fill="#FFFFFF" />
      <rect x="30" y="14" width="40" height="20" fill="#FFFFFF" />
      <ellipse cx="40" cy="50" rx="4" ry="5" fill="#4A3728" /><ellipse cx="60" cy="50" rx="4" ry="5" fill="#4A3728" />
      <circle cx="41" cy="49" r="1.5" fill="white" /><circle cx="61" cy="49" r="1.5" fill="white" />
      <path d="M42 62C44 60 50 59 50 59C50 59 56 60 58 62" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M42 68C45 72 55 72 58 68" stroke="#B8860B" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M35 82L42 76L50 80L58 76L65 82" stroke="white" strokeWidth="3" fill="none" />
      <defs><linearGradient id={gradientId} x1="0" y1="0" x2="100" y2="100"><stop stopColor={backgroundColorStart} /><stop offset="1" stopColor={backgroundColorEnd} /></linearGradient></defs>
    </svg>
  );
};
export default ChefAvatar;
