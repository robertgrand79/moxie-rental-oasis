import React from 'react';
import { AvatarProps } from './types';

const TestudoAvatar: React.FC<AvatarProps> = ({ size = 40 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size}>
    <defs>
      <linearGradient id="mdBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#E21833"/>
        <stop offset="100%" stopColor="#B8142A"/>
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#mdBg)"/>
    <ellipse cx="100" cy="120" rx="65" ry="50" fill="#FFD200" stroke="#000" strokeWidth="4"/>
    <ellipse cx="100" cy="120" rx="55" ry="40" fill="#E21833" stroke="#000" strokeWidth="2"/>
    <ellipse cx="100" cy="120" rx="45" ry="30" fill="#FFD200" stroke="#000" strokeWidth="2"/>
    <ellipse cx="100" cy="120" rx="35" ry="20" fill="#000" stroke="#000" strokeWidth="2"/>
    <ellipse cx="100" cy="120" rx="25" ry="12" fill="#FFF" stroke="#000" strokeWidth="2"/>
    <ellipse cx="100" cy="65" rx="35" ry="35" fill="#5D8C51" stroke="#000" strokeWidth="4"/>
    <ellipse cx="85" cy="60" rx="12" ry="14" fill="#FFF" stroke="#000" strokeWidth="2"/>
    <ellipse cx="115" cy="60" rx="12" ry="14" fill="#FFF" stroke="#000" strokeWidth="2"/>
    <circle cx="87" cy="62" r="7" fill="#000"/>
    <circle cx="117" cy="62" r="7" fill="#000"/>
    <circle cx="89" cy="59" r="3" fill="#FFF"/>
    <circle cx="119" cy="59" r="3" fill="#FFF"/>
    <path d="M70 48 Q85 42 98 52" stroke="#3D5C35" strokeWidth="4" fill="none"/>
    <path d="M130 48 Q115 42 102 52" stroke="#3D5C35" strokeWidth="4" fill="none"/>
    <path d="M82 78 Q100 92 118 78" stroke="#3D5C35" strokeWidth="4" fill="none"/>
    <ellipse cx="45" cy="140" rx="15" ry="20" fill="#5D8C51" stroke="#000" strokeWidth="3"/>
    <ellipse cx="155" cy="140" rx="15" ry="20" fill="#5D8C51" stroke="#000" strokeWidth="3"/>
    <ellipse cx="60" cy="165" rx="12" ry="10" fill="#5D8C51" stroke="#000" strokeWidth="3"/>
    <ellipse cx="140" cy="165" rx="12" ry="10" fill="#5D8C51" stroke="#000" strokeWidth="3"/>
  </svg>
);

export default TestudoAvatar;
