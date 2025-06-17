
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassmorphicCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary';
  blur?: 'sm' | 'md' | 'lg';
}

export const GlassmorphicCard: React.FC<GlassmorphicCardProps> = ({
  children,
  className,
  variant = 'default',
  blur = 'md'
}) => {
  const variants = {
    default: 'bg-white/10 border-white/20',
    primary: 'bg-gradient-to-br from-blue-500/20 to-purple-600/20 border-blue-300/30',
    secondary: 'bg-gradient-to-br from-green-500/20 to-teal-600/20 border-green-300/30'
  };

  const blurs = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg'
  };

  return (
    <div className={cn(
      'rounded-2xl border shadow-xl transition-all duration-500 hover:shadow-2xl',
      'hover:border-opacity-40 transform hover:-translate-y-1',
      variants[variant],
      blurs[blur],
      className
    )}>
      {children}
    </div>
  );
};
