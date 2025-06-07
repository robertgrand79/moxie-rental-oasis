
import React from 'react';
import { cn } from '@/lib/utils';

interface EnhancedSkeletonProps {
  className?: string;
  variant?: 'default' | 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
  children?: React.ReactNode;
}

const EnhancedSkeleton = ({ 
  className, 
  variant = 'default', 
  animation = 'wave',
  children,
  ...props 
}: EnhancedSkeletonProps & React.HTMLAttributes<HTMLDivElement>) => {
  const baseClasses = "bg-gradient-to-r from-muted via-muted/50 to-muted";
  
  const variantClasses = {
    default: "rounded-md",
    text: "rounded-sm h-4",
    circular: "rounded-full",
    rectangular: "rounded-none"
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-[shimmer_2s_ease-in-out_infinite] bg-[length:200%_100%]",
    none: ""
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={{
        backgroundImage: animation === 'wave' 
          ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
          : undefined
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export { EnhancedSkeleton };
