import React from 'react';

interface AvatarProps {
  size?: number;
  className?: string;
}

const ArtistAvatar = ({ size = 40, className = '' }: AvatarProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Background circle */}
    <circle cx="50" cy="50" r="48" fill="url(#artist-gradient)" />
    
    {/* Face */}
    <ellipse cx="50" cy="54" rx="26" ry="28" fill="#FFDAB9" />
    
    {/* Curly artistic hair */}
    <path d="M24 45C22 35 28 22 50 20C72 22 78 35 76 45" fill="#2C1810" />
    <circle cx="28" cy="38" r="6" fill="#2C1810" />
    <circle cx="36" cy="28" r="5" fill="#2C1810" />
    <circle cx="50" cy="24" r="6" fill="#2C1810" />
    <circle cx="64" cy="28" r="5" fill="#2C1810" />
    <circle cx="72" cy="38" r="6" fill="#2C1810" />
    
    {/* Beret */}
    <ellipse cx="58" cy="22" rx="18" ry="10" fill="#7B1FA2" />
    <circle cx="62" cy="16" r="3" fill="#9C27B0" />
    
    {/* Eyes - expressive artist eyes */}
    <ellipse cx="40" cy="50" rx="5" ry="6" fill="#4A3728" />
    <ellipse cx="60" cy="50" rx="5" ry="6" fill="#4A3728" />
    <circle cx="41" cy="49" r="2" fill="white" />
    <circle cx="61" cy="49" r="2" fill="white" />
    
    {/* Artistic eyebrows - more expressive */}
    <path d="M34 42C36 39 44 39 46 42" stroke="#2C1810" strokeWidth="2" strokeLinecap="round" />
    <path d="M54 42C56 39 64 39 66 42" stroke="#2C1810" strokeWidth="2" strokeLinecap="round" />
    
    {/* Thoughtful smile */}
    <path
      d="M42 66C46 70 54 70 58 66"
      stroke="#8B4513"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    
    {/* Paint smudge on cheek */}
    <ellipse cx="70" cy="56" rx="3" ry="2" fill="#FF5722" opacity="0.7" />
    <ellipse cx="30" cy="60" rx="2" ry="1.5" fill="#2196F3" opacity="0.7" />
    
    {/* Artistic scarf/collar */}
    <path d="M32 80C38 76 44 82 50 78C56 82 62 76 68 80" stroke="#E91E63" strokeWidth="4" fill="none" />
    <path d="M36 84C42 80 46 86 50 82C54 86 58 80 64 84" stroke="#FFC107" strokeWidth="3" fill="none" />
    
    <defs>
      <linearGradient id="artist-gradient" x1="0" y1="0" x2="100" y2="100">
        <stop stopColor="#6A1B9A" />
        <stop offset="1" stopColor="#4A148C" />
      </linearGradient>
    </defs>
  </svg>
);

export default ArtistAvatar;
