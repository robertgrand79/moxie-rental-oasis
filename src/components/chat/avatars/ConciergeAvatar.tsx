import React from 'react';

interface AvatarProps {
  size?: number;
  className?: string;
}

const ConciergeAvatar = ({ size = 40, className = '' }: AvatarProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Background circle */}
    <circle cx="50" cy="50" r="48" fill="url(#concierge-gradient)" />
    
    {/* Face */}
    <ellipse cx="50" cy="52" rx="28" ry="30" fill="#FFDAB9" />
    
    {/* Hair */}
    <path
      d="M25 40C25 25 35 15 50 15C65 15 75 25 75 40C75 42 74 44 73 45C72 35 62 28 50 28C38 28 28 35 27 45C26 44 25 42 25 40Z"
      fill="#3D2314"
    />
    
    {/* Concierge hat */}
    <ellipse cx="50" cy="22" rx="22" ry="8" fill="#1a1a1a" />
    <rect x="32" y="14" width="36" height="10" rx="2" fill="#1a1a1a" />
    <rect x="46" y="8" width="8" height="8" rx="4" fill="#FFD700" />
    
    {/* Eyes */}
    <ellipse cx="40" cy="48" rx="4" ry="5" fill="#4A3728" />
    <ellipse cx="60" cy="48" rx="4" ry="5" fill="#4A3728" />
    <circle cx="41" cy="47" r="1.5" fill="white" />
    <circle cx="61" cy="47" r="1.5" fill="white" />
    
    {/* Eyebrows */}
    <path d="M35 42C37 40 43 40 45 42" stroke="#3D2314" strokeWidth="2" strokeLinecap="round" />
    <path d="M55 42C57 40 63 40 65 42" stroke="#3D2314" strokeWidth="2" strokeLinecap="round" />
    
    {/* Friendly smile */}
    <path
      d="M40 62C43 68 57 68 60 62"
      stroke="#B8860B"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    
    {/* Bow tie */}
    <path d="M42 78L50 82L58 78L58 85L50 82L42 85Z" fill="#8B0000" />
    <circle cx="50" cy="82" r="3" fill="#FFD700" />
    
    {/* Collar hints */}
    <path d="M35 85L42 78" stroke="white" strokeWidth="2" />
    <path d="M65 85L58 78" stroke="white" strokeWidth="2" />
    
    <defs>
      <linearGradient id="concierge-gradient" x1="0" y1="0" x2="100" y2="100">
        <stop stopColor="#1a365d" />
        <stop offset="1" stopColor="#2c5282" />
      </linearGradient>
    </defs>
  </svg>
);

export default ConciergeAvatar;
