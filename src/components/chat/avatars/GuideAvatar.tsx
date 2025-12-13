import React from 'react';

interface AvatarProps {
  size?: number;
  className?: string;
}

const GuideAvatar = ({ size = 40, className = '' }: AvatarProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Background circle */}
    <circle cx="50" cy="50" r="48" fill="url(#guide-gradient)" />
    
    {/* Face */}
    <ellipse cx="50" cy="54" rx="25" ry="27" fill="#C68642" />
    
    {/* Hair with bandana */}
    <path
      d="M27 48C27 32 37 22 50 22C63 22 73 32 73 48C73 50 72 52 71 54C69 42 60 35 50 35C40 35 31 42 29 54C28 52 27 50 27 48Z"
      fill="#1a1a1a"
    />
    
    {/* Bandana */}
    <path d="M25 38C30 32 40 28 50 28C60 28 70 32 75 38L73 42C68 38 60 35 50 35C40 35 32 38 27 42L25 38Z" fill="#E74C3C" />
    <path d="M25 38L20 45L18 42L25 38Z" fill="#E74C3C" />
    <circle cx="50" cy="33" r="2" fill="#F1C40F" />
    
    {/* Eyes */}
    <ellipse cx="40" cy="52" rx="4" ry="5" fill="#2D1B0E" />
    <ellipse cx="60" cy="52" rx="4" ry="5" fill="#2D1B0E" />
    <circle cx="41" cy="51" r="1.5" fill="white" />
    <circle cx="61" cy="51" r="1.5" fill="white" />
    
    {/* Adventurous eyebrows */}
    <path d="M35 46C37 44 43 44 45 46" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
    <path d="M55 46C57 44 63 44 65 46" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round" />
    
    {/* Enthusiastic smile */}
    <path
      d="M38 66C42 74 58 74 62 66"
      stroke="#8B4513"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M40 68C44 72 56 72 60 68"
      fill="white"
    />
    
    {/* Outdoor vest/jacket collar */}
    <path d="M30 88L42 80L50 84L58 80L70 88" fill="#5D6D7E" />
    <path d="M42 80L42 88" stroke="#85929E" strokeWidth="2" />
    <path d="M58 80L58 88" stroke="#85929E" strokeWidth="2" />
    
    {/* Zipper */}
    <path d="M50 84L50 92" stroke="#AAB7B8" strokeWidth="2" />
    <rect x="48" y="82" width="4" height="4" rx="1" fill="#AAB7B8" />
    
    <defs>
      <linearGradient id="guide-gradient" x1="0" y1="0" x2="100" y2="100">
        <stop stopColor="#27AE60" />
        <stop offset="1" stopColor="#1E8449" />
      </linearGradient>
    </defs>
  </svg>
);

export default GuideAvatar;
