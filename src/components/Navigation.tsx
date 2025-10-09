import React, { useState, useEffect, useRef } from 'react';
import { Brain, Target, TrendingUp, Menu, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ui/ThemeToggle';
import UserDropdown from './UserDropdown';
import type { User } from '../types/user';

type AppView = 'dashboard' | 'triple-review' | 'performance' | 'studyscheduler' | 'profile' | 'billing';

interface NavigationProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  user?: User;
  onSignOut: () => void;
}

export default function Navigation({ currentView, onViewChange, user, onSignOut }: NavigationProps) {
  if (currentView === 'triple-review') return null;
  
  const { theme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const navClasses = theme === 'dark' 
    ? 'bg-gray-800 border-gray-700' 
    : 'bg-white border-slate-200';

  const logoTextClasses = theme === 'dark' 
    ? 'text-white' 
    : 'text-slate-900';

  const statsTextClasses = theme === 'dark' 
    ? 'text-gray-300' 
    : 'text-slate-700';

  const handleLinkClick = (view: AppView) => {
    onViewChange(view);
    setMobileOpen(false);
  };

  // Close drawer if clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    };
    if (mobileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileOpen]);

  return (
    <nav className={`${navClasses} shadow-sm border-b transition-all duration-500 z-50 flex-shrink-0 fixed top-0 left-0 right-0`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer flex-shrink-0"
            onClick={() => handleLinkClick('dashboard')}
          >
            <Brain className="h-8 w-8 text-blue-600" />
            <span className={`text-xl font-bold ${logoTextClasses}`}>
              LSAT Rewired
            </span>
          </div>

          {/* Desktop Navigation - Hide when content would overflow */}
          <div className="hidden xl:flex space-x-6 items-center">
            <NavButton active={currentView === 'dashboard'} onClick={() => handleLinkClick('dashboard')} theme={theme}>
              Dashboard
            </NavButton>
            <NavButton active={currentView === 'performance'} onClick={() => handleLinkClick('performance')} theme={theme}>
              Performance
            </NavButton>
            <NavButton active={currentView === 'studyscheduler'} onClick={() => handleLinkClick('studyscheduler')} theme={theme}>
              Study Scheduler
            </NavButton>
            <ThemeToggle />
            {user && (
              <div className="flex items-center space-x-4 ml-4">
                <Stat icon={<Target className="h-4 w-4 text-teal-600" />} label={`${user.stats.circuitsCreated} Circuits`} theme={theme} />
                <Stat icon={<TrendingUp className="h-4 w-4 text-orange-600" />} label={`Rank #${user.stats.rank}`} theme={theme} />
              </div>
            )}
            {user && <UserDropdown user={user} onViewChange={onViewChange} onSignOut={onSignOut} />}
          </div>

          {/* Medium screens - Show nav without stats */}
          <div className="hidden md:flex xl:hidden space-x-4 items-center">
            <NavButton active={currentView === 'dashboard'} onClick={() => handleLinkClick('dashboard')} theme={theme}>
              Dashboard
            </NavButton>
            <NavButton active={currentView === 'performance'} onClick={() => handleLinkClick('performance')} theme={theme}>
              Performance
            </NavButton>
            <NavButton active={currentView === 'studyscheduler'} onClick={() => handleLinkClick('studyscheduler')} theme={theme}>
              Study Scheduler
            </NavButton>
            <ThemeToggle />
            {user && <UserDropdown user={user} onViewChange={onViewChange} onSignOut={onSignOut} />}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="p-2">
              <Menu className="h-6 w-6 text-blue-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-in Drawer - Fixed positioning to avoid affecting layout */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div
            ref={drawerRef}
            className={`fixed right-0 top-0 w-64 h-full shadow-lg p-6 flex flex-col gap-4 transform transition-transform duration-300 ease-in-out ${
              theme === 'dark' ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <div className="flex justify-between items-center mb-4">
              <span className={`text-xl font-bold ${logoTextClasses}`}>Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-1">
                <X className="h-6 w-6 text-blue-600" />
              </button>
            </div>
            <NavButton active={currentView === 'dashboard'} onClick={() => handleLinkClick('dashboard')} theme={theme}>
              Dashboard
            </NavButton>
            <NavButton active={currentView === 'performance'} onClick={() => handleLinkClick('performance')} theme={theme}>
              Performance
            </NavButton>
            <NavButton active={currentView === 'studyscheduler'} onClick={() => handleLinkClick('studyscheduler')} theme={theme}>
              Study Scheduler
            </NavButton>
            <ThemeToggle />
            {user && (
              <div className="pt-4 mt-4 border-t border-gray-300 dark:border-gray-700">
                <UserDropdown user={user} onViewChange={onViewChange} onSignOut={onSignOut} />
              </div>
            )}
            {user && (
              <div className="pt-4 mt-auto border-t border-gray-300 dark:border-gray-700 text-sm space-y-1">
                <div className={statsTextClasses}>{user.stats.circuitsCreated} Circuits</div>
                <div className={statsTextClasses}>Rank #{user.stats.rank}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  theme: 'light' | 'dark';
}

function NavButton({ active, onClick, children, theme }: NavButtonProps) {
  const base = 'px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 w-full md:w-auto text-left whitespace-nowrap';
  const dark = active
    ? 'bg-blue-900/50 text-blue-400'
    : 'text-gray-300 hover:bg-gray-700 hover:text-white';
  const light = active
    ? 'bg-blue-50 text-blue-600'
    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900';
  return (
    <button onClick={onClick} className={`${base} ${theme === 'dark' ? dark : light}`}>
      {children}
    </button>
  );
}

function Stat({ icon, label, theme }: { icon: React.ReactNode; label: string; theme: string }) {
  return (
    <div className="flex items-center space-x-2 whitespace-nowrap">
      {icon}
      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
        {label}
      </span>
    </div>
  );
}