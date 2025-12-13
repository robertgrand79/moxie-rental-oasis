import React from 'react';

interface AvatarProps {
  size?: number;
  className?: string;
}

const AdvisorAvatar = ({ size = 40, className = '' }: AvatarProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Background circle */}
    <circle cx="50" cy="50" r="48" fill="url(#advisor-gradient)" />
    
    {/* Face */}
    <ellipse cx="50" cy="54" rx="26" ry="28" fill="#8D5524" />
    
    {/* Short professional hair */}
    <path
      d="M26 45C26 28 36 18 50 18C64 18 74 28 74 45C74 48 73 50 72 52C70 38 61 30 50 30C39 30 30 38 28 52C27 50 26 48 26 45Z"
      fill="#1a1a1a"
    />
    
    {/* Glasses */}
    <rect x="31" y="48" rx="3" width="15" height="11" fill="none" stroke="#C4A484" strokeWidth="2" />
    <rect x="54" y="48" rx="3" width="15" height="11" fill="none" stroke="#C4A484" strokeWidth="2" />
    <path d="M46 52L54 52" stroke="#C4A484" strokeWidth="2" />
    <path d="M31 52L26 50" stroke="#C4A484" strokeWidth="2" />
    <path d="M69 52L74 50" stroke="#C4A484" strokeWidth="2" />
    
    {/* Eyes behind glasses */}
    <ellipse cx="38" cy="53" rx="3" ry="4" fill="#2D1B0E" />
    <ellipse cx="62" cy="53" rx="3" ry="4" fill="#2D1B0E" />
    <circle cx="39" cy="52" r="1" fill="white" />
    <circle cx="63" cy="52" r="1" fill="white" />
    
    {/* Confident eyebrows */}
    <path d="M33 45C35 43 41 43 44 45" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
    <path d="M56 45C59 43 65 43 67 45" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
    
    {/* Professional smile */}
    <path
      d="M42 68C45 73 55 73 58 68"
      stroke="#5D3A1A"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    
    {/* Suit collar and tie */}
    <path d="M32 88L44 80L50 85L56 80L68 88" fill="#2C3E50" />
    <path d="M46 80L50 90L54 80" fill="#C0392B" />
    <rect x="48" y="78" width="4" height="3" fill="#C0392B" />
    
    {/* Shirt collar */}
    <path d="M44 80L48 78" stroke="white" strokeWidth="2" />
    <path d="M56 80L52 78" stroke="white" strokeWidth="2" />
    
    <defs>
      <linearGradient id="advisor-gradient" x1="0" y1="0" x2="100" y2="100">
        <stop stopColor="#2C3E50" />
        <stop offset="1" stopColor="#34495E" />
      </linearGradient>
    </defs>
  </svg>
);

export default AdvisorAvatar;
