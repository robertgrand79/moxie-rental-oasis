import React from 'react';
import { AvatarProps } from './types';

const HerkyHawkAvatar: React.FC<AvatarProps> = ({ size = 40 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size}>
    <defs>
      <linearGradient id="iowaBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFCD00"/>
        <stop offset="100%" stopColor="#E5B800"/>
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#iowaBg)"/>
    <ellipse cx="100" cy="105" rx="55" ry="55" fill="#000" stroke="#000" strokeWidth="4"/>
    <ellipse cx="100" cy="115" rx="35" ry="35" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <path d="M85 120 L100 155 L115 120 Z" fill="#FFCD00" stroke="#000" strokeWidth="3"/>
    <path d="M90 120 L100 145 L110 120" fill="#E5B800" stroke="#000" strokeWidth="2"/>
    <ellipse cx="75" cy="100" rx="18" ry="20" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <ellipse cx="125" cy="100" rx="18" ry="20" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <circle cx="77" cy="102" r="10" fill="#FFCD00"/>
    <circle cx="127" cy="102" r="10" fill="#FFCD00"/>
    <circle cx="77" cy="102" r="5" fill="#000"/>
    <circle cx="127" cy="102" r="5" fill="#000"/>
    <circle cx="79" cy="99" r="3" fill="#FFF"/>
    <circle cx="129" cy="99" r="3" fill="#FFF"/>
    <path d="M55 82 L90 95" stroke="#000" strokeWidth="8" strokeLinecap="round"/>
    <path d="M145 82 L110 95" stroke="#000" strokeWidth="8" strokeLinecap="round"/>
    <path d="M60 60 L50 35 L70 55" fill="#000" stroke="#000" strokeWidth="2"/>
    <path d="M80 50 L75 25 L90 48" fill="#000" stroke="#000" strokeWidth="2"/>
    <path d="M100 45 L100 20 L105 45" fill="#000" stroke="#000" strokeWidth="2"/>
    <path d="M120 50 L125 25 L110 48" fill="#000" stroke="#000" strokeWidth="2"/>
    <path d="M140 60 L150 35 L130 55" fill="#000" stroke="#000" strokeWidth="2"/>
  </svg>
);

export default HerkyHawkAvatar;
