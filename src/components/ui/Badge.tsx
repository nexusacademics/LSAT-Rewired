import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  className = '',
  ...props
}) => {
  const { theme } = useTheme();

  const variants = {
    default: theme === 'dark'
      ? 'bg-gray-700 text-gray-200'
      : 'bg-gray-100 text-gray-800',
    success: theme === 'dark'
      ? 'bg-green-900 text-green-200'
      : 'bg-green-100 text-green-800',
    warning: theme === 'dark'
      ? 'bg-yellow-900 text-yellow-200'
      : 'bg-yellow-100 text-yellow-800',
    danger: theme === 'dark'
      ? 'bg-red-900 text-red-200'
      : 'bg-red-100 text-red-800',
    info: theme === 'dark'
      ? 'bg-blue-900 text-blue-200'
      : 'bg-blue-100 text-blue-800'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
