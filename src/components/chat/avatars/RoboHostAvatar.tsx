import React from 'react';
import { AvatarProps } from './types';

const RoboHostAvatar: React.FC<AvatarProps> = ({ size = 40 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size}>
    <defs>
      <linearGradient id="roboBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#74B9FF"/>
        <stop offset="100%" stopColor="#0984E3"/>
      </linearGradient>
      <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#DFE6E9"/>
        <stop offset="50%" stopColor="#B2BEC3"/>
        <stop offset="100%" stopColor="#636E72"/>
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#roboBg)"/>
    {/* Circuit pattern */}
    <path d="M30 60 L50 60 L50 80" stroke="#FFF" strokeWidth="2" opacity="0.3" fill="none"/>
    <path d="M170 140 L150 140 L150 120" stroke="#FFF" strokeWidth="2" opacity="0.3" fill="none"/>
    {/* Robot head */}
    <rect x="45" y="50" width="110" height="100" rx="20" fill="url(#metalGrad)" stroke="#000" strokeWidth="4"/>
    {/* Antenna */}
    <rect x="95" y="25" width="10" height="30" fill="#636E72" stroke="#000" strokeWidth="2"/>
    <circle cx="100" cy="22" r="12" fill="#FF6B6B" stroke="#000" strokeWidth="3"/>
    <circle cx="100" cy="22" r="6" fill="#FF8E8E"/>
    {/* Screen face */}
    <rect x="55" y="60" width="90" height="65" rx="10" fill="#1A1A2E" stroke="#000" strokeWidth="3"/>
    {/* Digital eyes */}
    <rect x="65" y="75" width="25" height="25" rx="5" fill="#00CEC9"/>
    <rect x="110" y="75" width="25" height="25" rx="5" fill="#00CEC9"/>
    {/* Eye animation */}
    <rect x="70" y="80" width="15" height="15" rx="3" fill="#FFF" opacity="0.5"/>
    <rect x="115" y="80" width="15" height="15" rx="3" fill="#FFF" opacity="0.5"/>
    {/* Happy mouth - pixel style */}
    <rect x="70" y="108" width="8" height="8" fill="#00CEC9"/>
    <rect x="80" y="113" width="8" height="8" fill="#00CEC9"/>
    <rect x="90" y="115" width="20" height="8" fill="#00CEC9"/>
    <rect x="112" y="113" width="8" height="8" fill="#00CEC9"/>
    <rect x="122" y="108" width="8" height="8" fill="#00CEC9"/>
    {/* Side panels */}
    <rect x="30" y="75" width="18" height="35" rx="5" fill="url(#metalGrad)" stroke="#000" strokeWidth="3"/>
    <rect x="152" y="75" width="18" height="35" rx="5" fill="url(#metalGrad)" stroke="#000" strokeWidth="3"/>
    {/* Ear lights */}
    <circle cx="39" cy="92" r="6" fill="#FDCB6E"/>
    <circle cx="161" cy="92" r="6" fill="#FDCB6E"/>
    {/* Body hint */}
    <rect x="70" y="150" width="60" height="30" rx="8" fill="url(#metalGrad)" stroke="#000" strokeWidth="3"/>
    <rect x="85" y="155" width="30" height="20" rx="4" fill="#1A1A2E"/>
    <circle cx="100" cy="165" r="6" fill="#00B894"/>
    {/* Neck */}
    <rect x="85" y="145" width="30" height="10" fill="#636E72" stroke="#000" strokeWidth="2"/>
  </svg>
);

export default RoboHostAvatar;
