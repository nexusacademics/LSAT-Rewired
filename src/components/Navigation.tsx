import React, { useState, useEffect, useRef } from 'react';
import { Brain, Target, TrendingUp, Menu, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ui/ThemeToggle';

type AppView = 'dashboard' | 'triple-review' | 'performance' | 'subscription';

interface NavigationProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  userStats?: {
    circuitsCreated: number;
    rank: number;
  };
}

export default function Navigation({ currentView, onViewChange, userStats }: NavigationProps) {
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
    <nav className={`${navClasses} shadow-sm border-b transition-all duration-500 relative z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => handleLinkClick('dashboard')}
          >
            <Brain className="h-8 w-8 text-blue-600" />
            <span className={`text-xl font-bold ${logoTextClasses}`}>
              LSAT Rewired
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 items-center">
            <NavButton active={currentView === 'dashboard'} onClick={() => handleLinkClick('dashboard')} theme={theme}>
              Dashboard
            </NavButton>
            <NavButton active={currentView === 'performance'} onClick={() => handleLinkClick('performance')} theme={theme}>
              Performance
            </NavButton>
            <NavButton active={currentView === 'subscription'} onClick={() => handleLinkClick('subscription')} theme={theme}>
              Subscription
            </NavButton>
            <ThemeToggle />
            {userStats && (
              <div className="flex items-center space-x-4 ml-4">
                <Stat icon={<Target className="h-4 w-4 text-teal-600" />} label={`${userStats.circuitsCreated} Circuits`} theme={theme} />
                <Stat icon={<TrendingUp className="h-4 w-4 text-orange-600" />} label={`Rank #${userStats.rank}`} theme={theme} />
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu className="h-6 w-6 text-blue-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Slide-in Drawer */}
      <div
        className={`fixed inset-0 z-40 transition-transform duration-300 ease-in-out transform ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } md:hidden`}
        style={{ backgroundColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)' }}
      >
        <div ref={drawerRef} className="w-64 h-full shadow-lg p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center mb-4">
            <span className={`text-xl font-bold ${logoTextClasses}`}>Menu</span>
            <button onClick={() => setMobileOpen(false)}>
              <X className="h-6 w-6 text-blue-600" />
            </button>
          </div>
          <NavButton active={currentView === 'dashboard'} onClick={() => handleLinkClick('dashboard')} theme={theme}>
            Dashboard
          </NavButton>
          <NavButton active={currentView === 'performance'} onClick={() => handleLinkClick('performance')} theme={theme}>
            Performance
          </NavButton>
          <NavButton active={currentView === 'subscription'} onClick={() => handleLinkClick('subscription')} theme={theme}>
            Subscription
          </NavButton>
          <ThemeToggle />
          {userStats && (
            <div className="pt-4 mt-auto border-t border-gray-300 dark:border-gray-700 text-sm space-y-1">
              <div className={statsTextClasses}>{userStats.circuitsCreated} Circuits</div>
              <div className={statsTextClasses}>Rank #{userStats.rank}</div>
            </div>
          )}
        </div>
      </div>
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
  const base = 'px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 w-full text-left';
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
    <div className="flex items-center space-x-2">
      {icon}
      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-slate-700'}`}>
        {label}
      </span>
    </div>
  );
}
