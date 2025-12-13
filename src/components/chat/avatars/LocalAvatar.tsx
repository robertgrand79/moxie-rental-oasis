import React from 'react';

interface AvatarProps {
  size?: number;
  className?: string;
}

const LocalAvatar = ({ size = 40, className = '' }: AvatarProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Background circle */}
    <circle cx="50" cy="50" r="48" fill="url(#local-gradient)" />
    
    {/* Face */}
    <ellipse cx="50" cy="52" rx="26" ry="28" fill="#C68642" />
    
    {/* Natural curly hair */}
    <ellipse cx="50" cy="32" rx="28" ry="18" fill="#1A1A1A" />
    <circle cx="30" cy="36" r="8" fill="#1A1A1A" />
    <circle cx="70" cy="36" r="8" fill="#1A1A1A" />
    <circle cx="38" cy="26" r="6" fill="#1A1A1A" />
    <circle cx="62" cy="26" r="6" fill="#1A1A1A" />
    <circle cx="50" cy="22" r="7" fill="#1A1A1A" />
    
    {/* Warm friendly eyes */}
    <ellipse cx="40" cy="50" rx="4" ry="5" fill="#3E2723" />
    <ellipse cx="60" cy="50" rx="4" ry="5" fill="#3E2723" />
    <circle cx="41" cy="49" r="1.5" fill="white" />
    <circle cx="61" cy="49" r="1.5" fill="white" />
    
    {/* Friendly eyebrows */}
    <path d="M35 44C37 42 43 42 45 44" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
    <path d="M55 44C57 42 63 42 65 44" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" />
    
    {/* Big welcoming smile */}
    <path
      d="M38 62C42 70 58 70 62 62"
      stroke="#5D4037"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    {/* Teeth showing in smile */}
    <path d="M42 64C46 66 54 66 58 64" fill="white" />
    
    {/* Warm cheeks */}
    <ellipse cx="32" cy="56" rx="4" ry="3" fill="#E57373" opacity="0.4" />
    <ellipse cx="68" cy="56" rx="4" ry="3" fill="#E57373" opacity="0.4" />
    
    {/* Casual t-shirt */}
    <path d="M30 85L38 78L50 82L62 78L70 85" fill="#FF7043" />
    <path d="M38 78L50 82L62 78" stroke="#E64A19" strokeWidth="2" fill="none" />
    
    {/* Location pin accessory/necklace */}
    <circle cx="50" cy="86" r="3" fill="#FFD700" />
    <path d="M50 83L52 86L50 90L48 86Z" fill="#FFD700" />
    
    <defs>
      <linearGradient id="local-gradient" x1="0" y1="0" x2="100" y2="100">
        <stop stopColor="#FF7043" />
        <stop offset="1" stopColor="#E64A19" />
      </linearGradient>
    </defs>
  </svg>
);

export default LocalAvatar;
