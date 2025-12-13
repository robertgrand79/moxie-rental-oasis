import React from 'react';

interface AvatarProps {
  size?: number;
  className?: string;
}

const HostAvatar = ({ size = 40, className = '' }: AvatarProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Background circle */}
    <circle cx="50" cy="50" r="48" fill="url(#host-gradient)" />
    
    {/* Face */}
    <ellipse cx="50" cy="52" rx="27" ry="29" fill="#FFDAB9" />
    
    {/* Long wavy hair */}
    <path
      d="M22 55C22 35 33 18 50 18C67 18 78 35 78 55C78 60 77 65 75 70C72 55 62 45 50 45C38 45 28 55 25 70C23 65 22 60 22 55Z"
      fill="#D4A574"
    />
    <path
      d="M22 55C20 70 22 82 28 88C30 75 28 62 25 55C24 58 23 60 22 55Z"
      fill="#D4A574"
    />
    <path
      d="M78 55C80 70 78 82 72 88C70 75 72 62 75 55C76 58 77 60 78 55Z"
      fill="#D4A574"
    />
    
    {/* Bangs */}
    <path
      d="M30 38C32 32 40 28 50 28C60 28 68 32 70 38C68 42 60 40 50 40C40 40 32 42 30 38Z"
      fill="#D4A574"
    />
    
    {/* Eyes */}
    <ellipse cx="40" cy="50" rx="4" ry="5" fill="#5D4E37" />
    <ellipse cx="60" cy="50" rx="4" ry="5" fill="#5D4E37" />
    <circle cx="41" cy="49" r="1.5" fill="white" />
    <circle cx="61" cy="49" r="1.5" fill="white" />
    
    {/* Warm eyebrows */}
    <path d="M35 44C37 43 43 43 45 44" stroke="#B8956B" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M55 44C57 43 63 43 65 44" stroke="#B8956B" strokeWidth="1.5" strokeLinecap="round" />
    
    {/* Rosy cheeks */}
    <ellipse cx="32" cy="58" rx="5" ry="3" fill="#FFB6C1" opacity="0.5" />
    <ellipse cx="68" cy="58" rx="5" ry="3" fill="#FFB6C1" opacity="0.5" />
    
    {/* Warm welcoming smile */}
    <path
      d="M40 65C44 72 56 72 60 65"
      stroke="#C4956A"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    
    {/* Cozy sweater collar */}
    <path d="M35 85L50 80L65 85" stroke="#8B7355" strokeWidth="5" strokeLinecap="round" />
    <path d="M38 87L50 83L62 87" stroke="#A0826D" strokeWidth="3" strokeLinecap="round" />
    
    <defs>
      <linearGradient id="host-gradient" x1="0" y1="0" x2="100" y2="100">
        <stop stopColor="#E8B4B8" />
        <stop offset="1" stopColor="#D4A5A5" />
      </linearGradient>
    </defs>
  </svg>
);

export default HostAvatar;
