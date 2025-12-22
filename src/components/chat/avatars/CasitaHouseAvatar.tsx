import React from 'react';
import { AvatarProps } from './types';

const CasitaHouseAvatar: React.FC<AvatarProps> = ({ size = 40 }) => (
  <svg viewBox="0 0 200 200" width={size} height={size}>
    <defs>
      <linearGradient id="casaBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#74B9FF"/>
        <stop offset="100%" stopColor="#0984E3"/>
      </linearGradient>
      <linearGradient id="roofGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#E17055"/>
        <stop offset="100%" stopColor="#D63031"/>
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#casaBg)"/>
    {/* Clouds */}
    <ellipse cx="40" cy="45" rx="20" ry="10" fill="#FFF" opacity="0.5"/>
    <ellipse cx="160" cy="55" rx="15" ry="8" fill="#FFF" opacity="0.5"/>
    {/* House body */}
    <rect x="40" y="85" width="120" height="85" rx="8" fill="#FFEAA7" stroke="#000" strokeWidth="4"/>
    {/* Roof */}
    <path d="M30 90 L100 30 L170 90 Z" fill="url(#roofGrad)" stroke="#000" strokeWidth="4"/>
    {/* Chimney */}
    <rect x="130" y="40" width="20" height="35" fill="#D63031" stroke="#000" strokeWidth="3"/>
    {/* Smoke */}
    <circle cx="140" cy="30" r="8" fill="#FFF" opacity="0.7"/>
    <circle cx="148" cy="20" r="6" fill="#FFF" opacity="0.5"/>
    {/* Window eyes */}
    <rect x="50" y="100" rx="4" width="35" height="30" fill="#74B9FF" stroke="#000" strokeWidth="3"/>
    <rect x="115" y="100" rx="4" width="35" height="30" fill="#74B9FF" stroke="#000" strokeWidth="3"/>
    {/* Window shine */}
    <rect x="53" y="103" width="10" height="10" fill="#FFF" opacity="0.5"/>
    <rect x="118" y="103" width="10" height="10" fill="#FFF" opacity="0.5"/>
    {/* Pupils */}
    <circle cx="67" cy="115" r="8" fill="#000"/>
    <circle cx="132" cy="115" r="8" fill="#000"/>
    <circle cx="70" cy="112" r="3" fill="#FFF"/>
    <circle cx="135" cy="112" r="3" fill="#FFF"/>
    {/* Door smile */}
    <rect x="80" y="130" rx="15" width="40" height="45" fill="#8D6E63" stroke="#000" strokeWidth="3"/>
    <circle cx="112" cy="155" r="4" fill="#F39C12" stroke="#000" strokeWidth="2"/>
    {/* Happy arch on door */}
    <path d="M88 145 Q100 155 112 145" stroke="#5D4037" strokeWidth="3" fill="none"/>
    {/* Blush */}
    <ellipse cx="42" cy="120" rx="8" ry="5" fill="#FF9FF3" opacity="0.6"/>
    <ellipse cx="158" cy="120" rx="8" ry="5" fill="#FF9FF3" opacity="0.6"/>
    {/* Welcome mat */}
    <rect x="75" y="168" width="50" height="8" rx="2" fill="#00B894" stroke="#000" strokeWidth="2"/>
  </svg>
);

export default CasitaHouseAvatar;
