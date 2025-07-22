// components/Navigation.tsx
import React from 'react';
import { Brain, Target, TrendingUp } from 'lucide-react';

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
  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => onViewChange('dashboard')}
            >
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-slate-900">LSAT Rewired</span>
            </div>

            <div className="hidden md:flex space-x-6">
              <NavButton
                active={currentView === 'dashboard'}
                onClick={() => onViewChange('dashboard')}
              >
                Dashboard
              </NavButton>
              <NavButton
                active={currentView === 'performance'}
                onClick={() => onViewChange('performance')}
              >
                Performance
              </NavButton>
              <NavButton
                active={currentView === 'subscription'}
                onClick={() => onViewChange('subscription')}
              >
                Subscription
              </NavButton>
            </div>
          </div>

          {userStats && (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-teal-600" />
                <span className="text-sm font-medium text-slate-700">
                  {userStats.circuitsCreated} Circuits
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-slate-700">
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
}

function NavButton({ active, onClick, children }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
        active
          ? 'text-blue-600 bg-blue-50'
          : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  );
}