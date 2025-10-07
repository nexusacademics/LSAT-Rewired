import React, { useState, useEffect, useRef } from 'react';
import { Brain, Target, TrendingUp, Menu, X, User, Settings, LogOut, LogIn } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuthContext } from '../contexts/AuthContext';
import ThemeToggle from '../components/ui/ThemeToggle';

type AppView = 'dashboard' | 'triple-review' | 'performance' | 'studyscheduler' | 'subscription' | 'profile';

interface NavigationProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  onOpenAuth?: () => void;
  userStats?: {
    circuitsCreated: number;
    rank: number;
  };
}

export default function Navigation({ currentView, onViewChange, onOpenAuth, userStats }: NavigationProps) {
  if (currentView === 'triple-review') return null;

  const { theme } = useTheme();
  const { user, profile, signOut } = useAuthContext();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

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
    setProfileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setProfileMenuOpen(false);
    onViewChange('dashboard');
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    if (mobileOpen || profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileOpen, profileMenuOpen]);

  const displayName = profile?.first_name || profile?.username || user?.email?.split('@')[0] || 'User';
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <nav className={`${navClasses} shadow-sm border-b transition-all duration-500 z-50 flex-shrink-0 fixed top-0 left-0 right-0`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div
            className="flex items-center space-x-2 cursor-pointer flex-shrink-0"
            onClick={() => handleLinkClick('dashboard')}
          >
            <Brain className="h-8 w-8 text-blue-600" />
            <span className={`text-xl font-bold ${logoTextClasses}`}>
              LSAT Rewired
            </span>
          </div>

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
            <NavButton active={currentView === 'subscription'} onClick={() => handleLinkClick('subscription')} theme={theme}>
              Subscription
            </NavButton>
            <ThemeToggle />

            {user ? (
              <>
                {userStats && (
                  <div className="flex items-center space-x-4 ml-4">
                    <Stat icon={<Target className="h-4 w-4 text-teal-600" />} label={`${userStats.circuitsCreated} Circuits`} theme={theme} />
                    <Stat icon={<TrendingUp className="h-4 w-4 text-orange-600" />} label={`Rank #${userStats.rank}`} theme={theme} />
                  </div>
                )}
                <div className="relative ml-4" ref={profileMenuRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      theme === 'dark'
                        ? 'hover:bg-gray-700 text-white'
                        : 'hover:bg-gray-100 text-gray-900'
                    }`}
                  >
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                        {initials}
                      </div>
                    )}
                    <span className="text-sm font-medium">{displayName}</span>
                  </button>

                  {profileMenuOpen && (
                    <div
                      className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 z-[100] ${
                        theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                      }`}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLinkClick('profile');
                        }}
                        className={`w-full flex items-center px-4 py-2 text-sm ${
                          theme === 'dark'
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Settings className="h-4 w-4 mr-3" />
                        Profile Settings
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSignOut();
                        }}
                        className={`w-full flex items-center px-4 py-2 text-sm ${
                          theme === 'dark'
                            ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <LogOut className="h-4 w-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={onOpenAuth}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>

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
            <NavButton active={currentView === 'subscription'} onClick={() => handleLinkClick('subscription')} theme={theme}>
              Subscription
            </NavButton>
            <ThemeToggle />

            {user ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className={`p-2 rounded-lg transition-colors ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                      {initials}
                    </div>
                  )}
                </button>

                {profileMenuOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-1 z-[100] ${
                      theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                    }`}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLinkClick('profile');
                      }}
                      className={`w-full flex items-center px-4 py-2 text-sm ${
                        theme === 'dark'
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Settings className="h-4 w-4 mr-3" />
                      Profile Settings
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSignOut();
                      }}
                      className={`w-full flex items-center px-4 py-2 text-sm ${
                        theme === 'dark'
                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <LogIn className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="md:hidden">
            <button onClick={() => setMobileOpen(true)} aria-label="Open menu" className="p-2">
              <Menu className="h-6 w-6 text-blue-600" />
            </button>
          </div>
        </div>
      </div>

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

            {user && (
              <div className={`flex items-center space-x-3 pb-4 mb-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                    {initials}
                  </div>
                )}
                <div>
                  <p className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{displayName}</p>
                  <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                </div>
              </div>
            )}

            <NavButton active={currentView === 'dashboard'} onClick={() => handleLinkClick('dashboard')} theme={theme}>
              Dashboard
            </NavButton>
            <NavButton active={currentView === 'performance'} onClick={() => handleLinkClick('performance')} theme={theme}>
              Performance
            </NavButton>
            <NavButton active={currentView === 'studyscheduler'} onClick={() => handleLinkClick('studyscheduler')} theme={theme}>
              Study Scheduler
            </NavButton>
            <NavButton active={currentView === 'subscription'} onClick={() => handleLinkClick('subscription')} theme={theme}>
              Subscription
            </NavButton>

            {user && (
              <NavButton active={currentView === 'profile'} onClick={() => handleLinkClick('profile')} theme={theme}>
                <Settings className="h-4 w-4 inline mr-2" />
                Profile Settings
              </NavButton>
            )}

            <ThemeToggle />

            {user ? (
              <>
                {userStats && (
                  <div className={`pt-4 mt-auto border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-300'} text-sm space-y-1`}>
                    <div className={statsTextClasses}>{userStats.circuitsCreated} Circuits</div>
                    <div className={statsTextClasses}>Rank #{userStats.rank}</div>
                  </div>
                )}
                <button
                  onClick={handleSignOut}
                  className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  onOpenAuth?.();
                }}
                className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </button>
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
