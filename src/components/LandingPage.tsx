import React from 'react';
import { Brain } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface LandingPageProps {
  onLogin: () => void;
}

export default function LandingPage({ onLogin }: LandingPageProps) {
  const { theme } = useTheme();

  const backgroundClasses = theme === 'dark'
    ? 'bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900'
    : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50';

  const textClasses = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const subTextClasses = theme === 'dark' ? 'text-gray-300' : 'text-slate-600';

  return (
    <div className={`min-h-screen flex items-center justify-center ${backgroundClasses} transition-all duration-500`}>
      <div className="text-center px-4">
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full"></div>
            <Brain className="h-32 w-32 text-blue-600 relative animate-pulse" />
          </div>
        </div>

        <h1 className={`text-6xl font-bold mb-4 ${textClasses}`}>
          LSAT Rewired
        </h1>

        <p className={`text-xl mb-8 ${subTextClasses} max-w-md mx-auto`}>
          Master the LSAT with AI-powered triple review methodology and intelligent circuit building
        </p>

        <button
          onClick={onLogin}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200 text-lg"
        >
          Log In to Dashboard
        </button>

        <div className={`mt-12 ${subTextClasses} text-sm`}>
          <p>Revolutionize your LSAT preparation</p>
        </div>
      </div>
    </div>
  );
}
