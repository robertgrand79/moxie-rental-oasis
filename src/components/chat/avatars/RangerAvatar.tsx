import React from 'react';

interface AvatarProps {
  size?: number;
  className?: string;
}

const RangerAvatar = ({ size = 40, className = '' }: AvatarProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Background circle */}
    <circle cx="50" cy="50" r="48" fill="url(#ranger-gradient)" />
    
    {/* Face */}
    <ellipse cx="50" cy="54" rx="26" ry="28" fill="#D2B48C" />
    
    {/* Ranger hat */}
    <ellipse cx="50" cy="30" rx="32" ry="8" fill="#5D4037" />
    <path d="M22 30C22 22 35 12 50 12C65 12 78 22 78 30" fill="#6D4C41" />
    <ellipse cx="50" cy="24" rx="18" ry="6" fill="#4E342E" />
    {/* Hat band */}
    <rect x="25" y="26" width="50" height="4" fill="#795548" />
    
    {/* Hair */}
    <path d="M28 38C28 34 32 30 38 30" stroke="#3E2723" strokeWidth="3" strokeLinecap="round" />
    <path d="M72 38C72 34 68 30 62 30" stroke="#3E2723" strokeWidth="3" strokeLinecap="round" />
    
    {/* Eyes */}
    <ellipse cx="40" cy="50" rx="4" ry="5" fill="#2E7D32" />
    <ellipse cx="60" cy="50" rx="4" ry="5" fill="#2E7D32" />
    <circle cx="41" cy="49" r="1.5" fill="white" />
    <circle cx="61" cy="49" r="1.5" fill="white" />
    
    {/* Eyebrows */}
    <path d="M35 44C37 42 43 42 45 44" stroke="#3E2723" strokeWidth="2" strokeLinecap="round" />
    <path d="M55 44C57 42 63 42 65 44" stroke="#3E2723" strokeWidth="2" strokeLinecap="round" />
    
    {/* Friendly outdoorsy smile */}
    <path
      d="M40 64C44 70 56 70 60 64"
      stroke="#6D4C41"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    
    {/* Rosy cheeks */}
    <ellipse cx="32" cy="58" rx="4" ry="3" fill="#FFAB91" opacity="0.6" />
    <ellipse cx="68" cy="58" rx="4" ry="3" fill="#FFAB91" opacity="0.6" />
    
    {/* Ranger uniform collar */}
    <path d="M34 85L42 78" stroke="#4E342E" strokeWidth="3" />
    <path d="M66 85L58 78" stroke="#4E342E" strokeWidth="3" />
    <rect x="44" y="78" width="12" height="8" fill="#558B2F" />
    {/* Badge */}
    <path d="M50 80L52 82L50 86L48 82Z" fill="#FFD700" />
    
    <defs>
      <linearGradient id="ranger-gradient" x1="0" y1="0" x2="100" y2="100">
        <stop stopColor="#2E7D32" />
        <stop offset="1" stopColor="#1B5E20" />
      </linearGradient>
    </defs>
  </svg>
);

export default RangerAvatar;
