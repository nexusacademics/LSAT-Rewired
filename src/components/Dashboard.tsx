import React, { useState } from 'react';
import { BookOpen, Play, TrendingUp, Calendar, Upload, Download, Users, Brain, Target, Archive, ChevronRight, Zap, Award, Activity } from 'lucide-react';
import { User, TestSession, ProcessedPrepTest } from '../App';
import TimeModeSelectionModal from './TimeModeSelectionModal';

// Import your new design system components
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import ThemeToggle from '../components/ui/ThemeToggle';

interface DashboardProps {
  user: User;
  userSessions: TestSession[];
  onStartNewTestSession: (testId: string, phase: 'timed' | 'blind-review' | 'strategy-review', timeMode?: 'regular' | '1.5x' | '2x' | 'custom' | 'untimed', customTimeMinutes?: number, selectedSectionId?: string) => void;
  onResumeTestSession: (sessionId: string, targetPhase?: 'blind-review' | 'strategy-review') => void;
  allProcessedTests: { [key: string]: ProcessedPrepTest };
}

const Dashboard: React.FC<DashboardProps> = ({ 
  user, 
  userSessions, 
  onStartNewTestSession, 
  onResumeTestSession, 
  allProcessedTests 
}) => {
  // Fixed the state setter name to be consistent
  const [isTimeModeModalOpen, setIsTimeModeModalOpen] = useState(false);
  const { theme } = useTheme();
  
  // Filter user sessions into categories (keeping your existing logic)
  const activeSessions = userSessions.filter(session => !session.endTime);
  const readyForBlindReviewSessions = userSessions.filter(session => 
    session.endTime && session.completedPhases.includes('timed') && !session.completedPhases.includes('blind-review')
  );
  const readyForStrategyReviewSessions = userSessions.filter(session => 
    session.endTime && session.completedPhases.includes('blind-review') && !session.completedPhases.includes('strategy-review')
  );
  const archivedSessions = userSessions.filter(session => 
    session.endTime && session.completedPhases.includes('strategy-review')
  );

  // Helper to format session display name (keeping your existing logic)
  const formatSessionDisplayName = (session: TestSession) => {
    const test = allProcessedTests[session.testId];
    if (!test) return session.testId;

    const sectionNumber = session.selectedSectionId ? test.sections.findIndex(s => s.id === session.selectedSectionId) + 1 : null;
    return sectionNumber ? `${test.name} - Section ${sectionNumber}` : test.name;
  };

  const handleStartNewSessionClick = () => {
    setIsTimeModeModalOpen(true);
  };

  const handleTimeModeSelected = (testId: string, timeMode: 'regular' | '1.5x' | '2x' | 'custom' | 'untimed', customTimeMinutes?: number, selectedSectionId?: string) => {
    onStartNewTestSession(testId, 'timed', timeMode, customTimeMinutes, selectedSectionId);
    setIsTimeModeModalOpen(false);
  };

  // Dynamic background based on theme
  const backgroundClasses = theme === 'dark' 
    ? 'bg-gray-900' 
    : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100';

  return (
    <div className={`min-h-screen transition-all duration-500 ${backgroundClasses} p-6`}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Theme Toggle */}
        <div className="flex justify-end">
          <ThemeToggle />
        </div>

        {/* Welcome Header */}
        <Card padding="lg" gradient={theme === 'light'}>
          <div className={`${theme === 'dark' ? 'bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-teal-600/20 p-8 -m-8 rounded-3xl' : ''}`}>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
              <div className="mb-6 lg:mb-0">
                <h1 className={`text-4xl lg:text-5xl font-bold mb-3 ${
                  theme === 'dark' 
                    ? 'text-white' 
                    : 'bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent'
                }`}>
                  Welcome back, {user.name}!
                </h1>
                <p className={`text-xl mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Ready to continue your LSAT mastery journey?
                </p>
                
                {user.lawhubCredentials?.verified && (
                  <Badge variant="success" className="inline-flex items-center">
                    <Brain className="h-4 w-4 mr-2" />
                    LawHub Connected: {user.lawhubCredentials.username}
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-8">
                <div className="text-center group cursor-pointer">
                  <div className={`text-4xl font-bold mb-1 transition-colors duration-300 ${
                    theme === 'dark' 
                      ? 'text-white group-hover:text-blue-400' 
                      : 'text-gray-900 group-hover:text-blue-600'
                  }`}>
                    {user.stats.circuitsCreated}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Circuits Built</div>
                </div>
                <div className="text-center group cursor-pointer">
                  <div className={`text-4xl font-bold mb-1 transition-colors duration-300 ${
                    theme === 'dark' 
                      ? 'text-white group-hover:text-teal-400' 
                      : 'text-gray-900 group-hover:text-teal-600'
                  }`}>
                    {user.stats.testsCompleted}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Tests Completed</div>
                </div>
                <div className="text-center group cursor-pointer">
                  <div className={`text-4xl font-bold mb-1 transition-colors duration-300 ${
                    theme === 'dark' 
                      ? 'text-white group-hover:text-orange-400' 
                      : 'text-gray-900 group-hover:text-orange-600'
                  }`}>
                    {user.stats.averageAnalysisScore}%
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Analysis Score</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Test Selection */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Start New Session */}
            <Card padding="lg" hover>
              <CardHeader>
                <CardTitle icon={<Zap className="h-6 w-6 text-yellow-500" />}>
                  Start Your Next Session
                </CardTitle>
              </CardHeader>

              <Card variant="accent" padding="default">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className={`text-xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Begin a New PrepTest Session
                    </h3>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      Select a PrepTest and configure your session.
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700 shadow-inner' : 'bg-gray-100'}`}>
                    <BookOpen className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
                
                <Button 
                  size="lg" 
                  className="w-full"
                  onClick={handleStartNewSessionClick}
                >
                  <Play className="h-5 w-5 mr-3" />
                  Start New Test Session
                </Button>
              </Card>
            </Card>

            {/* Active Sessions */}
            <Card padding="lg" hover>
              <CardHeader>
                <CardTitle icon={<Activity className="h-6 w-6 text-orange-500" />}>
                  Your Active Sessions
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                {activeSessions.length > 0 ? (
                  <div className="space-y-4">
                    {activeSessions.map((session) => (
                      <Card 
                        key={session.id} 
                        variant="accent" 
                        padding="default"
                        hover
                        className={theme === 'dark' ? 'hover:border-orange-500/50' : 'hover:border-orange-300'}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatSessionDisplayName(session)}
                          </h3>
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Started: {session.startTime.toLocaleDateString()}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant={
                            session.phase === 'strategy-review' ? 'warning' :
                            session.phase === 'blind-review' ? 'info' : 'primary'
                          }>
                            {session.phase === 'timed' && session.timeMode ? `Timed (${session.timeMode})` : session.phase.replace('-', ' ')}
                          </Badge>
                          
                          <div className={`flex space-x-4 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <span>Q: {session.currentSectionIndex + 1}-{Object.keys(session.answeredQuestions).length}</span>
                            <span>Circuits: {session.circuits.length}</span>
                          </div>
                        </div>
                        
                        <Button 
                          variant="accent" 
                          className="w-full"
                          onClick={() => onResumeTestSession(session.id)}
                        >
                          Resume Session
                        </Button>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎯</div>
                    <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      No active sessions. Start a new PrepTest above!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ready