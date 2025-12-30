import React from 'react';
import { AvatarProps } from './types';

const WolverineAvatar: React.FC<AvatarProps> = ({ size = 40 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size}>
    <defs>
      <linearGradient id="michBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#00274C"/>
        <stop offset="100%" stopColor="#001830"/>
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#michBg)"/>
    <ellipse cx="100" cy="105" rx="58" ry="55" fill="#5D4037" stroke="#000" strokeWidth="4"/>
    <ellipse cx="100" cy="115" rx="40" ry="38" fill="#FFCB05" stroke="#000" strokeWidth="2"/>
    <ellipse cx="75" cy="95" rx="18" ry="15" fill="#3E2723"/>
    <ellipse cx="125" cy="95" rx="18" ry="15" fill="#3E2723"/>
    <ellipse cx="50" cy="60" rx="15" ry="20" fill="#5D4037" stroke="#000" strokeWidth="3"/>
    <ellipse cx="150" cy="60" rx="15" ry="20" fill="#5D4037" stroke="#000" strokeWidth="3"/>
    <ellipse cx="75" cy="95" rx="12" ry="14" fill="#FFF" stroke="#000" strokeWidth="2"/>
    <ellipse cx="125" cy="95" rx="12" ry="14" fill="#FFF" stroke="#000" strokeWidth="2"/>
    <circle cx="77" cy="97" r="7" fill="#FFCB05"/>
    <circle cx="127" cy="97" r="7" fill="#FFCB05"/>
    <circle cx="77" cy="97" r="4" fill="#000"/>
    <circle cx="127" cy="97" r="4" fill="#000"/>
    <circle cx="79" cy="94" r="2" fill="#FFF"/>
    <circle cx="129" cy="94" r="2" fill="#FFF"/>
    <path d="M55 78 L88 90" stroke="#000" strokeWidth="7" strokeLinecap="round"/>
    <path d="M145 78 L112 90" stroke="#000" strokeWidth="7" strokeLinecap="round"/>
    <ellipse cx="100" cy="125" rx="12" ry="10" fill="#3E2723" stroke="#000" strokeWidth="2"/>
    <path d="M70 140 Q100 160 130 140" fill="#8B0000" stroke="#000" strokeWidth="3"/>
    <path d="M78 140 L75 150 L82 142" fill="#FFF" stroke="#000" strokeWidth="1"/>
    <path d="M122 140 L125 150 L118 142" fill="#FFF" stroke="#000" strokeWidth="1"/>
    <path d="M88 142 L86 148 L92 143" fill="#FFF" stroke="#000" strokeWidth="1"/>
    <path d="M112 142 L114 148 L108 143" fill="#FFF" stroke="#000" strokeWidth="1"/>
  </svg>
);

export default WolverineAvatar;
