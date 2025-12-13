import React from 'react';
import { avatarComponents, AvatarType } from './avatars';

interface ChatAvatarProps {
  type: AvatarType;
  size?: number;
  className?: string;
}

const ChatAvatar = ({ type, size = 40, className = '' }: ChatAvatarProps) => {
  const AvatarComponent = avatarComponents[type] || avatarComponents.concierge;
  return <AvatarComponent size={size} className={className} />;
};

export default ChatAvatar;
