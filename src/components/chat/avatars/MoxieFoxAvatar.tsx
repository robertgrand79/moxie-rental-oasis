import React from 'react';
import { AvatarProps } from './types';

const MoxieFoxAvatar: React.FC<AvatarProps> = ({ size = 40 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size}>
    <defs>
      <linearGradient id="foxBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00B894"/>
        <stop offset="100%" stopColor="#00A085"/>
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#foxBg)"/>
    <circle cx="35" cy="50" r="12" fill="#FFF" opacity="0.2"/>
    <circle cx="165" cy="150" r="16" fill="#FFF" opacity="0.2"/>
    {/* Fox face */}
    <ellipse cx="100" cy="115" rx="55" ry="50" fill="#E17055" stroke="#000" strokeWidth="4"/>
    {/* White muzzle */}
    <ellipse cx="100" cy="135" rx="35" ry="30" fill="#FFF" stroke="#000" strokeWidth="3"/>
    {/* Ears */}
    <path d="M40 70 L55 30 L75 75 Z" fill="#E17055" stroke="#000" strokeWidth="4"/>
    <path d="M160 70 L145 30 L125 75 Z" fill="#E17055" stroke="#000" strokeWidth="4"/>
    {/* Inner ears */}
    <path d="M50 65 L58 40 L68 68 Z" fill="#FFEAA7"/>
    <path d="M150 65 L142 40 L132 68 Z" fill="#FFEAA7"/>
    {/* Eyes */}
    <ellipse cx="70" cy="100" rx="16" ry="20" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <ellipse cx="130" cy="100" rx="16" ry="20" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <ellipse cx="72" cy="102" rx="10" ry="12" fill="#2D3436"/>
    <ellipse cx="132" cy="102" rx="10" ry="12" fill="#2D3436"/>
    <circle cx="76" cy="96" r="4" fill="#FFF"/>
    <circle cx="136" cy="96" r="4" fill="#FFF"/>
    {/* Eyebrows */}
    <path d="M52 82 Q70 75 85 85" stroke="#000" strokeWidth="4" fill="none"/>
    <path d="M148 82 Q130 75 115 85" stroke="#000" strokeWidth="4" fill="none"/>
    {/* Nose */}
    <ellipse cx="100" cy="125" rx="12" ry="10" fill="#2D3436" stroke="#000" strokeWidth="2"/>
    <ellipse cx="97" cy="122" rx="4" ry="3" fill="#FFF" opacity="0.4"/>
    {/* Smile */}
    <path d="M100 135 L100 145" stroke="#000" strokeWidth="3"/>
    <path d="M85 148 Q100 160 115 148" stroke="#000" strokeWidth="3" fill="none"/>
    {/* Cheek fluff */}
    <path d="M45 115 Q35 120 40 130 Q50 125 45 115" fill="#FFF" stroke="#000" strokeWidth="2"/>
    <path d="M155 115 Q165 120 160 130 Q150 125 155 115" fill="#FFF" stroke="#000" strokeWidth="2"/>
  </svg>
);

export default MoxieFoxAvatar;
