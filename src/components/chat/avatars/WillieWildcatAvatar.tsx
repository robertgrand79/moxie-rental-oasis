import React from 'react';
import { AvatarProps } from './types';

const WillieWildcatAvatar: React.FC<AvatarProps> = ({ size = 40 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size}>
    <defs>
      <linearGradient id="nwBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4E2A84"/>
        <stop offset="100%" stopColor="#3A1F63"/>
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#nwBg)"/>
    <ellipse cx="100" cy="108" rx="55" ry="55" fill="#4E2A84" stroke="#000" strokeWidth="4"/>
    <ellipse cx="100" cy="115" rx="42" ry="42" fill="#FFF" stroke="#000" strokeWidth="2"/>
    <path d="M45 65 L35 25 L65 55 Z" fill="#4E2A84" stroke="#000" strokeWidth="3"/>
    <path d="M155 65 L165 25 L135 55 Z" fill="#4E2A84" stroke="#000" strokeWidth="3"/>
    <path d="M50 60 L45 35 L62 55 Z" fill="#FFB6C1"/>
    <path d="M150 60 L155 35 L138 55 Z" fill="#FFB6C1"/>
    <ellipse cx="78" cy="105" rx="14" ry="16" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <ellipse cx="122" cy="105" rx="14" ry="16" fill="#FFF" stroke="#000" strokeWidth="3"/>
    <circle cx="80" cy="107" r="8" fill="#4E2A84"/>
    <circle cx="124" cy="107" r="8" fill="#4E2A84"/>
    <circle cx="80" cy="107" r="4" fill="#000"/>
    <circle cx="124" cy="107" r="4" fill="#000"/>
    <circle cx="82" cy="104" r="3" fill="#FFF"/>
    <circle cx="126" cy="104" r="3" fill="#FFF"/>
    <path d="M60 90 L92 100" stroke="#4E2A84" strokeWidth="5" strokeLinecap="round"/>
    <path d="M140 90 L108 100" stroke="#4E2A84" strokeWidth="5" strokeLinecap="round"/>
    <ellipse cx="100" cy="125" rx="10" ry="8" fill="#FFB6C1" stroke="#000" strokeWidth="2"/>
    <path d="M100 133 L100 140" stroke="#000" strokeWidth="2"/>
    <path d="M85 145 Q100 158 115 145" stroke="#000" strokeWidth="3" fill="none"/>
    <line x1="60" y1="125" x2="80" y2="128" stroke="#000" strokeWidth="2"/>
    <line x1="58" y1="135" x2="78" y2="135" stroke="#000" strokeWidth="2"/>
    <line x1="140" y1="125" x2="120" y2="128" stroke="#000" strokeWidth="2"/>
    <line x1="142" y1="135" x2="122" y2="135" stroke="#000" strokeWidth="2"/>
  </svg>
);

export default WillieWildcatAvatar;
