import React from 'react';
import { AvatarProps } from './types';

const JoeBruinAvatar: React.FC<AvatarProps> = ({ size = 40 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size}>
    <defs>
      <linearGradient id="uclaBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2D68C4"/>
        <stop offset="100%" stopColor="#1E4A8C"/>
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#uclaBg)"/>
    <ellipse cx="100" cy="105" rx="58" ry="58" fill="#8B4513" stroke="#000" strokeWidth="4"/>
    <ellipse cx="100" cy="125" rx="35" ry="30" fill="#D2691E" stroke="#000" strokeWidth="2"/>
    <circle cx="50" cy="55" r="22" fill="#8B4513" stroke="#000" strokeWidth="3"/>
    <circle cx="150" cy="55" r="22" fill="#8B4513" stroke="#000" strokeWidth="3"/>
    <circle cx="50" cy="55" r="12" fill="#D2691E"/>
    <circle cx="150" cy="55" r="12" fill="#D2691E"/>
    <ellipse cx="72" cy="100" rx="16" ry="18" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <ellipse cx="128" cy="100" rx="16" ry="18" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <circle cx="74" cy="102" r="10" fill="#2D68C4"/>
    <circle cx="130" cy="102" r="10" fill="#2D68C4"/>
    <circle cx="74" cy="102" r="5" fill="#000"/>
    <circle cx="130" cy="102" r="5" fill="#000"/>
    <circle cx="77" cy="98" r="4" fill="#FFF"/>
    <circle cx="133" cy="98" r="4" fill="#FFF"/>
    <path d="M55 85 Q72 78 88 88" stroke="#5D3A1A" strokeWidth="5" fill="none"/>
    <path d="M145 85 Q128 78 112 88" stroke="#5D3A1A" strokeWidth="5" fill="none"/>
    <ellipse cx="100" cy="125" rx="15" ry="12" fill="#000" stroke="#000" strokeWidth="2"/>
    <ellipse cx="97" cy="122" rx="5" ry="4" fill="#FFF" opacity="0.3"/>
    <path d="M100 137 L100 145" stroke="#000" strokeWidth="3"/>
    <path d="M80 148 Q100 165 120 148" stroke="#000" strokeWidth="4" fill="none"/>
    <path d="M55 170 Q100 160 145 170" stroke="#F2A900" strokeWidth="10"/>
  </svg>
);

export default JoeBruinAvatar;
