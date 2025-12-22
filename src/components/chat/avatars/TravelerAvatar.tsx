import React from 'react';
import { AvatarProps } from './types';

const TravelerAvatar = ({ size = 40, className = '', backgroundColorStart = '#FF6B35', backgroundColorEnd = '#F7931A' }: AvatarProps) => {
  const gradientId = `traveler-gradient-${Math.random().toString(36).substr(2, 9)}`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="50" cy="50" r="48" fill={`url(#${gradientId})`} />
      <ellipse cx="50" cy="55" rx="26" ry="28" fill="#DEB887" />
      <path d="M24 48C24 30 35 20 50 20C65 20 76 30 76 48C76 50 75 52 74 54C73 40 63 32 50 32C37 32 27 40 26 54C25 52 24 50 24 48Z" fill="#8B4513" />
      <circle cx="28" cy="42" r="5" fill="#8B4513" /><circle cx="72" cy="42" r="5" fill="#8B4513" />
      <ellipse cx="50" cy="28" rx="26" ry="10" fill="#2D5A27" />
      <rect x="30" y="45" rx="4" width="16" height="12" fill="#1a1a1a" opacity="0.8" />
      <rect x="54" y="45" rx="4" width="16" height="12" fill="#1a1a1a" opacity="0.8" />
      <path d="M46 50L54 50" stroke="#1a1a1a" strokeWidth="2" />
      <path d="M38 68C42 75 58 75 62 68" stroke="#8B4513" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M38 85L50 78L62 85" stroke="#FF6B35" strokeWidth="4" strokeLinecap="round" />
      <defs><linearGradient id={gradientId} x1="0" y1="0" x2="100" y2="100"><stop stopColor={backgroundColorStart} /><stop offset="1" stopColor={backgroundColorEnd} /></linearGradient></defs>
    </svg>
  );
};
export default TravelerAvatar;
