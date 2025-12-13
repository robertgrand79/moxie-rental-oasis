import React from 'react';

interface AvatarProps {
  size?: number;
  className?: string;
}

const CaptainAvatar = ({ size = 40, className = '' }: AvatarProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Background circle */}
    <circle cx="50" cy="50" r="48" fill="url(#captain-gradient)" />
    
    {/* Face */}
    <ellipse cx="50" cy="54" rx="26" ry="28" fill="#E8D4B8" />
    
    {/* Captain's cap */}
    <ellipse cx="50" cy="28" rx="26" ry="10" fill="#1a237e" />
    <rect x="26" y="18" width="48" height="12" fill="#1a237e" />
    <rect x="30" y="14" width="40" height="6" fill="#1a237e" />
    {/* Cap brim */}
    <ellipse cx="50" cy="30" rx="28" ry="6" fill="#0d1642" />
    {/* Gold emblem */}
    <circle cx="50" cy="20" r="5" fill="#FFD700" />
    <path d="M47 20L50 17L53 20L50 23Z" fill="#FFD700" />
    
    {/* Hair sides */}
    <path d="M26 40C26 36 28 32 32 30" stroke="#8D6E63" strokeWidth="4" strokeLinecap="round" />
    <path d="M74 40C74 36 72 32 68 30" stroke="#8D6E63" strokeWidth="4" strokeLinecap="round" />
    
    {/* Eyes */}
    <ellipse cx="40" cy="50" rx="4" ry="5" fill="#3E2723" />
    <ellipse cx="60" cy="50" rx="4" ry="5" fill="#3E2723" />
    <circle cx="41" cy="49" r="1.5" fill="white" />
    <circle cx="61" cy="49" r="1.5" fill="white" />
    
    {/* Eyebrows */}
    <path d="M35 44C37 42 43 42 45 44" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
    <path d="M55 44C57 42 63 42 65 44" stroke="#5D4037" strokeWidth="2" strokeLinecap="round" />
    
    {/* Friendly smile */}
    <path
      d="M40 64C44 70 56 70 60 64"
      stroke="#8B4513"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    
    {/* Beard stubble dots */}
    <circle cx="38" cy="68" r="0.8" fill="#8D6E63" />
    <circle cx="42" cy="72" r="0.8" fill="#8D6E63" />
    <circle cx="58" cy="72" r="0.8" fill="#8D6E63" />
    <circle cx="62" cy="68" r="0.8" fill="#8D6E63" />
    
    {/* Naval collar */}
    <path d="M32 85L40 78L50 82L60 78L68 85" stroke="white" strokeWidth="3" fill="none" />
    <rect x="46" y="82" width="8" height="6" fill="#1a237e" />
    
    <defs>
      <linearGradient id="captain-gradient" x1="0" y1="0" x2="100" y2="100">
        <stop stopColor="#0277BD" />
        <stop offset="1" stopColor="#01579B" />
      </linearGradient>
    </defs>
  </svg>
);

export default CaptainAvatar;
