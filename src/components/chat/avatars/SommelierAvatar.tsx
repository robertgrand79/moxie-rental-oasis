import React from 'react';

interface AvatarProps {
  size?: number;
  className?: string;
}

const SommelierAvatar = ({ size = 40, className = '' }: AvatarProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Background circle */}
    <circle cx="50" cy="50" r="48" fill="url(#sommelier-gradient)" />
    
    {/* Face */}
    <ellipse cx="50" cy="52" rx="26" ry="28" fill="#F5DEB3" />
    
    {/* Elegant slicked back hair */}
    <path d="M26 42C26 28 36 18 50 18C64 18 74 28 74 42C74 38 68 32 50 32C32 32 26 38 26 42Z" fill="#2C2C2C" />
    <path d="M28 40C30 34 38 30 50 30C62 30 70 34 72 40" stroke="#3D3D3D" strokeWidth="2" fill="none" />
    
    {/* Sophisticated eyes */}
    <ellipse cx="40" cy="50" rx="4" ry="5" fill="#4A3728" />
    <ellipse cx="60" cy="50" rx="4" ry="5" fill="#4A3728" />
    <circle cx="41" cy="49" r="1.5" fill="white" />
    <circle cx="61" cy="49" r="1.5" fill="white" />
    
    {/* Refined eyebrows */}
    <path d="M34 44C36 42 44 42 46 44" stroke="#2C2C2C" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M54 44C56 42 64 42 66 44" stroke="#2C2C2C" strokeWidth="1.5" strokeLinecap="round" />
    
    {/* Refined nose */}
    <path d="M50 52L50 60" stroke="#D4A574" strokeWidth="1.5" strokeLinecap="round" />
    
    {/* Subtle knowing smile */}
    <path
      d="M42 66C46 70 54 70 58 66"
      stroke="#8B4513"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    
    {/* Thin mustache */}
    <path d="M40 62C44 60 50 59 50 59C50 59 56 60 60 62" stroke="#2C2C2C" strokeWidth="1.5" strokeLinecap="round" fill="none" />
    
    {/* Formal attire - bow tie */}
    <path d="M40 80L50 84L60 80L60 88L50 84L40 88Z" fill="#2C2C2C" />
    <circle cx="50" cy="84" r="2.5" fill="#8B0000" />
    
    {/* Collar */}
    <path d="M34 88L40 80" stroke="white" strokeWidth="2" />
    <path d="M66 88L60 80" stroke="white" strokeWidth="2" />
    
    {/* Wine glass silhouette decoration */}
    <path d="M76 70L78 76L76 82" stroke="#FFD700" strokeWidth="1" opacity="0.6" />
    <ellipse cx="77" cy="70" rx="3" ry="4" stroke="#FFD700" strokeWidth="1" fill="none" opacity="0.6" />
    
    <defs>
      <linearGradient id="sommelier-gradient" x1="0" y1="0" x2="100" y2="100">
        <stop stopColor="#5D0F1A" />
        <stop offset="1" stopColor="#3D0A11" />
      </linearGradient>
    </defs>
  </svg>
);

export default SommelierAvatar;
