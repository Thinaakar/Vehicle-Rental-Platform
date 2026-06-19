import React from 'react';

type BrandLogoProps = {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeClasses = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl',
};

export default function BrandLogo({ variant = 'dark', size = 'md', className = '' }: BrandLogoProps) {
  const textClass = variant === 'light' ? 'text-white' : 'text-slate-900';

  return (
    <span className={`font-extrabold tracking-tight ${sizeClasses[size]} ${textClass} ${className}`}>
      DriveX<span className="text-accent font-normal">Pro</span>
    </span>
  );
}
