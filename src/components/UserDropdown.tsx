import React, { useState, useEffect, useRef } from 'react';
import { User, CreditCard, LogOut, ChevronDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import type { User as UserType } from '../types/user';

type AppView = 'landing' | 'dashboard' | 'triple-review' | 'performance' | 'studyscheduler' | 'profile' | 'billing';

interface UserDropdownProps {
  user: UserType;
  onViewChange: (view: AppView) => void;
  onSignOut: () => void;
}

export default function UserDropdown({ user, onViewChange, onSignOut }: UserDropdownProps) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = user.firstName || user.username || user.name || user.email.split('@')[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleMenuItemClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  const dropdownBgClasses = theme === 'dark'
    ? 'bg-gray-800 border-gray-700'
    : 'bg-white border-slate-200';

  const textClasses = theme === 'dark'
    ? 'text-gray-300'
    : 'text-slate-700';

  const hoverClasses = theme === 'dark'
    ? 'hover:bg-gray-700'
    : 'hover:bg-slate-50';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
          theme === 'dark'
            ? 'hover:bg-gray-700 text-gray-300'
            : 'hover:bg-slate-100 text-slate-700'
        }`}
        aria-label="User menu"
      >
        <User className="h-5 w-5" />
        <span className="font-medium text-sm hidden sm:inline">{displayName}</span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 mt-2 w-56 rounded-lg shadow-lg border ${dropdownBgClasses} overflow-hidden z-50`}
        >
          <div className={`px-4 py-3 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-slate-200'}`}>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : displayName}
            </p>
            <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-slate-500'} truncate`}>
              {user.email}
            </p>
          </div>

          <div className="py-1">
            <button
              onClick={() => handleMenuItemClick(() => onViewChange('profile'))}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-sm ${textClasses} ${hoverClasses} transition-colors duration-150`}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </button>

            <button
              onClick={() => handleMenuItemClick(() => onViewChange('billing'))}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-sm ${textClasses} ${hoverClasses} transition-colors duration-150`}
            >
              <CreditCard className="h-4 w-4" />
              <span>Billing</span>
            </button>

            <div className={`my-1 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-slate-200'}`} />

            <button
              onClick={() => handleMenuItemClick(onSignOut)}
              className={`w-full flex items-center space-x-3 px-4 py-2 text-sm ${
                theme === 'dark' ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'
              } transition-colors duration-150`}
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
