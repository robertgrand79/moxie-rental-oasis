import React from 'react';

interface AvatarProps {
  size?: number;
  className?: string;
}

const ChefAvatar = ({ size = 40, className = '' }: AvatarProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Background circle */}
    <circle cx="50" cy="50" r="48" fill="url(#chef-gradient)" />
    
    {/* Face */}
    <ellipse cx="50" cy="55" rx="26" ry="28" fill="#FFDAB9" />
    
    {/* Chef hat */}
    <ellipse cx="50" cy="18" rx="24" ry="12" fill="#FFFFFF" />
    <rect x="30" y="14" width="40" height="20" fill="#FFFFFF" />
    <ellipse cx="50" cy="14" rx="18" ry="8" fill="#F5F5F5" />
    <path d="M32 22C32 16 38 10 50 10C62 10 68 16 68 22" stroke="#E5E5E5" strokeWidth="1" fill="none" />
    
    {/* Hair peeking out */}
    <path d="M28 35C28 32 32 30 36 30" stroke="#5D4037" strokeWidth="3" strokeLinecap="round" />
    <path d="M72 35C72 32 68 30 64 30" stroke="#5D4037" strokeWidth="3" strokeLinecap="round" />
    
    {/* Eyes */}
    <ellipse cx="40" cy="50" rx="4" ry="5" fill="#4A3728" />
    <ellipse cx="60" cy="50" rx="4" ry="5" fill="#4A3728" />
    <circle cx="41" cy="49" r="1.5" fill="white" />
    <circle cx="61" cy="49" r="1.5" fill="white" />
    
    {/* Eyebrows */}
    <path d="M35 44C37 42 43 42 45 44" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
    <path d="M55 44C57 42 63 42 65 44" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
    
    {/* Mustache */}
    <path d="M42 62C44 60 50 59 50 59C50 59 56 60 58 62" stroke="#5D4037" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    
    {/* Warm smile */}
    <path
      d="M42 68C45 72 55 72 58 68"
      stroke="#B8860B"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    
    {/* Chef coat collar */}
    <path d="M35 82L42 76L50 80L58 76L65 82" stroke="white" strokeWidth="3" fill="none" />
    <circle cx="50" cy="86" r="2" fill="#333333" />
    
    <defs>
      <linearGradient id="chef-gradient" x1="0" y1="0" x2="100" y2="100">
        <stop stopColor="#D32F2F" />
        <stop offset="1" stopColor="#B71C1C" />
      </linearGradient>
    </defs>
  </svg>
);

export default ChefAvatar;
