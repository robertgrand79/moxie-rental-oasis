import React from 'react';
import { AvatarProps } from './types';

const NittanyLionAvatar: React.FC<AvatarProps> = ({ size = 40 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size}>
    <defs>
      <linearGradient id="psuBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#041E42"/>
        <stop offset="100%" stopColor="#021024"/>
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#psuBg)"/>
    <ellipse cx="100" cy="105" rx="55" ry="55" fill="#C4A67C" stroke="#000" strokeWidth="4"/>
    <ellipse cx="100" cy="100" rx="70" ry="68" fill="#8B6914" stroke="#000" strokeWidth="3"/>
    <ellipse cx="100" cy="105" rx="55" ry="55" fill="#C4A67C"/>
    <ellipse cx="100" cy="115" rx="35" ry="35" fill="#DEB887"/>
    <ellipse cx="55" cy="55" rx="15" ry="18" fill="#C4A67C" stroke="#000" strokeWidth="3"/>
    <ellipse cx="145" cy="55" rx="15" ry="18" fill="#C4A67C" stroke="#000" strokeWidth="3"/>
    <ellipse cx="75" cy="100" rx="14" ry="16" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <ellipse cx="125" cy="100" rx="14" ry="16" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <circle cx="77" cy="102" r="8" fill="#041E42"/>
    <circle cx="127" cy="102" r="8" fill="#041E42"/>
    <circle cx="77" cy="102" r="4" fill="#000"/>
    <circle cx="127" cy="102" r="4" fill="#000"/>
    <circle cx="79" cy="99" r="3" fill="#FFF"/>
    <circle cx="129" cy="99" r="3" fill="#FFF"/>
    <path d="M58 85 L90 93" stroke="#8B6914" strokeWidth="5" strokeLinecap="round"/>
    <path d="M142 85 L110 93" stroke="#8B6914" strokeWidth="5" strokeLinecap="round"/>
    <path d="M90 120 L100 135 L110 120 Z" fill="#5D4037" stroke="#000" strokeWidth="2"/>
    <path d="M100 135 L100 145" stroke="#000" strokeWidth="2"/>
    <path d="M85 148 Q100 160 115 148" stroke="#000" strokeWidth="3" fill="none"/>
    <circle cx="75" cy="130" r="2" fill="#5D4037"/>
    <circle cx="80" cy="135" r="2" fill="#5D4037"/>
    <circle cx="125" cy="130" r="2" fill="#5D4037"/>
    <circle cx="120" cy="135" r="2" fill="#5D4037"/>
  </svg>
);

export default NittanyLionAvatar;
