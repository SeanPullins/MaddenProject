import React, { useState } from 'react';

interface TeamLogoProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const TeamLogo: React.FC<TeamLogoProps> = ({ src, alt, size = 'md', className = '' }) => {
  const [imageError, setImageError] = useState(false);

  // Get initials from team name (first letter of each word)
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Size classes
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const baseClasses = 'rounded-full flex items-center justify-center font-bold';
  const fullClasses = `${baseClasses} ${sizeClasses[size]} ${className}`;

  if (imageError) {
    // Fallback to initials
    return (
      <div className={`${fullClasses} bg-gradient-to-br from-brand-500 to-brand-700 text-white`}>
        {getInitials(alt)}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={fullClasses}
      onError={() => setImageError(true)}
    />
  );
};
