import React from 'react';
import { avatarComponents, AvatarType, AvatarProps } from './avatars';

interface ChatAvatarProps {
  type: AvatarType;
  size?: number;
  className?: string;
  backgroundColorStart?: string;
  backgroundColorEnd?: string;
  customAvatarUrl?: string;
  useCustomAvatar?: boolean;
}

const ChatAvatar = ({ 
  type, 
  size = 40, 
  className = '',
  backgroundColorStart,
  backgroundColorEnd,
  customAvatarUrl,
  useCustomAvatar = false
}: ChatAvatarProps) => {
  // If custom avatar is enabled and URL exists, show custom image
  if (useCustomAvatar && customAvatarUrl) {
    return (
      <img
        src={customAvatarUrl}
        alt="Assistant avatar"
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  const AvatarComponent = avatarComponents[type] || avatarComponents.concierge;
  
  const props: AvatarProps = {
    size,
    className,
    ...(backgroundColorStart && { backgroundColorStart }),
    ...(backgroundColorEnd && { backgroundColorEnd }),
  };

  return <AvatarComponent {...props} />;
};

export default ChatAvatar;
