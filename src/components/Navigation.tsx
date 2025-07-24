// components/Navigation.tsx
import React from 'react';
import { Brain, Target, TrendingUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import ThemeToggle from '../components/ui/ThemeToggle'; // adjust path as needed

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
  const { theme } = useTheme();

  // Theme-aware classes
  const navClasses = theme === 'dark' 
    ? 'bg-gray-800 border-gray-700' 
    : 'bg-white border-slate-200';

  const logoTextClasses = theme === 'dark' 
    ? 'text-white' 
    : 'text-slate-900';

  const statsTextClasses = theme === 'dark' 
    ? 'text-gray-300' 
    : 'text-slate-700';

  return (
    <nav className={`${navClasses} shadow-sm border-b transition-all duration-500`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => onViewChange('dashboard')}
            >
              <Brain className="h-8 w-8 text-blue-600" />
              <span className={`text-xl font-bold ${logoTextClasses} transition-colors duration-500`}>
                LSAT Rewired
              </span>
            </div>
            <div className="hidden md:flex space-x-6">
              <NavButton
                active={currentView === 'dashboard'}
                onClick={() => onViewChange('dashboard')}
                theme={theme}
              >
                Dashboard
              </NavButton>
              <NavButton
                active={currentView === 'performance'}
                onClick={() => onViewChange('performance')}
                theme={theme}
              >
                Performance
              </NavButton>
              <NavButton
                active={currentView === 'subscription'}
                onClick={() => onViewChange('subscription')}
                theme={theme}
              >
                Subscription
              </NavButton>
                 <div className="flex justify-end">
          <ThemeToggle />
        </div>
            </div>
          </div>
          {userStats && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-teal-600" />
                <span className={`text-sm font-medium ${statsTextClasses} transition-colors duration-500`}>
                  {userStats.circuitsCreated} Circuits
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <span className={`text-sm font-medium ${statsTextClasses} transition-colors duration-500`}>
                  Rank #{userStats.rank}
                </span>
              </div>
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
  // Theme-aware button classes
  const buttonClasses = theme === 'dark' 
    ? active
      ? 'text-blue-400 bg-blue-900/50'
      : 'text-gray-300 hover:text-white hover:bg-gray-700'
    : active
      ? 'text-blue-600 bg-blue-50'
      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50';

  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 ${buttonClasses}`}
    >
      {children}
    </button>
  );
}