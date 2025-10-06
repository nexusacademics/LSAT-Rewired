import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ForgotPasswordForm from './ForgotPasswordForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'register' | 'forgot-password';
}

export default function AuthModal({ isOpen, onClose, initialView = 'login' }: AuthModalProps) {
  const { theme } = useTheme();
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'forgot-password'>(initialView);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-md rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
            theme === 'dark'
              ? 'hover:bg-gray-700 text-gray-400 hover:text-white'
              : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'
          }`}
          aria-label="Close modal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8">
          {currentView === 'login' && (
            <LoginForm
              onSwitchToRegister={() => setCurrentView('register')}
              onSwitchToForgotPassword={() => setCurrentView('forgot-password')}
              onSuccess={onClose}
            />
          )}

          {currentView === 'register' && (
            <RegisterForm
              onSwitchToLogin={() => setCurrentView('login')}
              onSuccess={onClose}
            />
          )}

          {currentView === 'forgot-password' && (
            <ForgotPasswordForm
              onSwitchToLogin={() => setCurrentView('login')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
