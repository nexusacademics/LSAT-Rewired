import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import Button from './Button';

const ThemeToggle = ({ className = '', showLabel = true, ...props }) => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button 
      variant="secondary" 
      onClick={toggleTheme}
      className={`flex items-center space-x-2 ${className}`}
      {...props}
    >
      {theme === 'light' ? (
        <>
          <Moon className="h-4 w-4" />
          {showLabel && <span>Dark Mode</span>}
        </>
      ) : (
        <>
          <Sun className="h-4 w-4" />
          {showLabel && <span>Light Mode</span>}
        </>
      )}
    </Button>
  );
};

export default ThemeToggle;