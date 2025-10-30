import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const { theme } = useTheme();
  
  const baseClasses = 'inline-flex items-center font-medium rounded-full border transition-colors';
  
  const variants = {
    default: theme === 'dark' 
      ? 'bg-gray-700 text-gray-200 border-gray-600' 
      : 'bg-gray-100 text-gray-700 border-gray-200',
    
    primary: theme === 'dark'
      ? 'bg-blue-900/50 text-blue-300 border-blue-700'
      : 'bg-blue-100 text-blue-700 border-blue-200',
    
    success: theme === 'dark'
      ? 'bg-green-900/50 text-green-300 border-green-700'
      : 'bg-green-100 text-green-700 border-green-200',
    
    warning: theme === 'dark'
      ? 'bg-orange-900/50 text-orange-300 border-orange-700'
      : 'bg-orange-100 text-orange-700 border-orange-200',
    
    danger: theme === 'dark'
      ? 'bg-red-900/50 text-red-300 border-red-700'
      : 'bg-red-100 text-red-700 border-red-200',
    
    info: theme === 'dark'
      ? 'bg-teal-900/50 text-teal-300 border-teal-700'
      : 'bg-teal-100 text-teal-700 border-teal-200'
  };
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm'
  };
  
  return (
    <span 
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;