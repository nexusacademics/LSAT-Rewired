import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Card = ({ 
  children, 
  className = '', 
  hover = false, 
  gradient = false,
  variant = 'default',
  padding = 'default',
  ...props 
}) => {
  const { theme } = useTheme();
  
  const baseClasses = 'rounded-3xl border transition-all duration-300';
  
  const variants = {
    default: theme === 'dark'
      ? 'bg-gray-800 border-gray-700 shadow-2xl'
      : 'bg-white border-gray-200 shadow-sm',
    
    elevated: theme === 'dark'
      ? 'bg-gray-800 border-gray-700 shadow-2xl'
      : 'bg-white border-gray-100 shadow-lg',
    
    flat: theme === 'dark'
      ? 'bg-gray-800 border-gray-700'
      : 'bg-white border-gray-200',
    
    accent: theme === 'dark'
      ? 'bg-gray-750 border-gray-600 shadow-inner'
      : 'bg-gray-50 border-gray-100'
  };
  
  const hoverClasses = hover ? (
    theme === 'dark' 
      ? 'hover:shadow-blue-500/10 hover:shadow-2xl hover:border-gray-600' 
      : 'hover:shadow-lg hover:border-gray-300'
  ) : '';
  
  const gradientClasses = gradient && theme === 'light' 
    ? 'bg-white/70 backdrop-blur-xl border-white/50' 
    : '';
  
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };
  
  return (
    <div 
      className={`${baseClasses} ${variants[variant]} ${hoverClasses} ${gradientClasses} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Convenience components
export const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-6 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '', icon }) => {
  const { theme } = useTheme();
  
  return (
    <h2 className={`text-2xl font-bold flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'} ${className}`}>
      {icon && (
        <div className={`p-2 rounded-xl mr-3 ${theme === 'dark' ? 'bg-gray-700 shadow-inner' : 'bg-gray-100'}`}>
          {icon}
        </div>
      )}
      {children}
    </h2>
  );
};

export const CardContent = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

export default Card;