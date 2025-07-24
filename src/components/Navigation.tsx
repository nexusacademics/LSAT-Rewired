import React, { useState } from 'react';
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
  const { theme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navClasses = theme === 'dark' 
    ? 'bg-gray-800 border-gray-700' 
    : 'bg-white border-slate-200';

  const logoTextClasses = theme === 'dark' 
    ? 'text-white' 
    : 'text-slate-900';

  const statsTextClasses = theme === 'dark' 
    ? 'text-gray-300' 
    : 'text-slate-700';

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  return (
    <nav className={`${navClasses} shadow-sm border-b transition-all duration-500`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => onViewChange('dashboard')}
            >
              <Brain className="h-8 w-8 text-blue-600" />
              <span className={`text-xl font-bold ${logoTextClasses} transition-colors duration-500`}>
                LSAT Rewired
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-6">
              <NavButton active={currentView === 'dashboard'} onClick={() => onViewChange('dashboard')} theme={theme}>
                Dashboard
              </NavButton>
              <NavButton active={currentView === 'performance'} onClick={() => onViewChange('performance')} theme={theme}>
                Performance
              </NavButton>
              <NavButton active={currentView === 'subscription'} onClick={() => onViewChange('subscription')} theme={theme}>
                Subscription
              </NavButton>
              <div className="flex justify-end">
                <ThemeToggle />
              </div>
            </div>
          </div>

          {/* User Stats (always visible on md+) */}
          <div className="hidden md:flex items-center space-x-4">
            {userStats && (
              <>
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-teal-600" />
                  <span className={`text-sm font-medium ${statsTextClasses}`}>
                    {userStats.circuitsCreated} Circuits
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                  <span className={`text-sm font-medium ${statsTextClasses}`}>
                    Rank #{userStats.rank}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={toggleMobileMenu} aria-label="Toggle menu">
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-blue-600" />
              ) : (
                <Menu className="h-6 w-6 text-blue-600" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden px-4 pb-4 space-y-2 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} transition-all`}>
          <NavButton active={currentView === 'dashboard'} onClick={() => { onViewChange('das
