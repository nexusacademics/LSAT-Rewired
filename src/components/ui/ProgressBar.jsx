import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ProgressBar = ({ 
  value, 
  variant = 'primary', 
  size = 'md',
  showValue = false,
  className = '',
  animated = true,
  ...props 
}) => {
  const { theme } = useTheme();
  
  // Clamp value between 0 and 100
  const clampedValue = Math.min(Math.max(value || 0, 0), 100);
  
  const variants = {
    primary: theme === 'dark'
      ? 'from-blue-500 to-blue-400'
      : 'from-blue-500 to-blue-600',
    
    success: theme === 'dark'
      ? 'from-teal-500 to-teal-400'
      : 'from-teal-500 to-teal-600',
    
    warning: theme === 'dark'
      ? 'from-orange-500 to-orange-400'
      : 'from-orange-500 to-orange-600',
    
    danger: theme === 'dark'
      ? 'from-red-500 to-red-400'
      : 'from-red-500 to-red-600',
    
    info: theme === 'dark'
      ? 'from-purple-500 to-purple-400'
      : 'from-purple-500 to-purple-600'
  };
  
  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4'
  };
  
  const trackColor = theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200';
  const animationClass = animated ? 'transition-all duration-1000 ease-out' : '';
  
  return (
    <div className={`relative ${className}`} {...props}>
      <div className={`w-full ${trackColor} rounded-full ${sizes[size]} overflow-hidden shadow-inner`}>
        <div 
          className={`bg-gradient-to-r ${variants[variant]} ${sizes[size]} rounded-full shadow-lg ${animationClass}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
      
      {showValue && (
        <div className={`absolute inset-0 flex items-center justify-center text-xs font-medium ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          {clampedValue}%
        </div>
      )}
    </div>
  );
};

export default ProgressBar;