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
  const [isTimeModeModalOpen, setIsTimeModeModal] = useState(false);
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
    setIsTimeModeModal(true);
  };

  const handleTimeModeSelected = (testId: string, timeMode: 'regular' | '1.5x' | '2x' | 'custom' | 'untimed', customTimeMinutes?: number, selectedSectionId?: string) => {
    onStartNewTestSession(testId, 'timed', timeMode, customTimeMinutes, selectedSectionId);
    setIsTimeModeModal(false);
  };

  // Dynamic background based on theme
  const backgroundClasses = theme === 'dark' 
    ? 'bg-gray-900' 
    : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100';

  return (
    <div className={`min-h-screen w-full transition-all duration-500 ${backgroundClasses}`}>
      <div className="w-full pt-20 px-4 pb-4">
        <div className="max-w-[1600px] mx-auto space-y-4">
        
        {/* Welcome Header with Study Streak */}
        <Card padding="default" gradient={theme === 'light'}>
          <div className={`${theme === 'dark' ? 'bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-teal-600/20 p-6 -m-6 rounded-2xl' : ''}`}>
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
              <div className="mb-4 lg:mb-0">
                <h1 className={`text-3xl lg:text-4xl font-bold mb-2 ${
                  theme === 'dark' 
                    ? 'text-white' 
                    : 'bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent'
                }`}>
                  Welcome back, {user.name}!
                </h1>
                <p className={`text-lg mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Ready to continue your LSAT mastery journey?
                </p>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {user.lawhubCredentials?.verified && (
                    <Badge variant="success" className="inline-flex items-center">
                      <Brain className="h-4 w-4 mr-2" />
                      LawHub Connected: {user.lawhubCredentials.username}
                    </Badge>
                  )}
                  
                  {/* Study Streak */}
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-orange-500" />
                    <div className="flex items-center space-x-2">
                      <span className={`text-2xl font-bold ${
                        theme === 'dark' 
                          ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400' 
                          : 'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500'
                      }`}>7</span>
                      <div>
                        <div className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Day Streak 🔥</div>
                        <div className="flex space-x-1">
                          {[...Array(7)].map((_, i) => (
                            <div 
                              key={i} 
                              className={`h-2 w-2 rounded-full bg-gradient-to-br from-orange-500 to-red-500 shadow-sm ${
                                theme === 'dark' ? 'border border-orange-400/30' : ''
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-center group cursor-pointer">
                  <div className={`text-3xl font-bold mb-1 transition-colors duration-300 ${
                    theme === 'dark' 
                      ? 'text-white group-hover:text-blue-400' 
                      : 'text-gray-900 group-hover:text-blue-600'
                  }`}>
                    {user.stats.circuitsCreated}
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Circuits Built</div>
                </div>
                <div className="text-center group cursor-pointer">
                  <div className={`text-3xl font-bold mb-1 transition-colors duration-300 ${
                    theme === 'dark' 
                      ? 'text-white group-hover:text-teal-400' 
                      : 'text-gray-900 group-hover:text-teal-600'
                  }`}>
                    {user.stats.testsCompleted}
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Tests Completed</div>
                </div>
                <div className="text-center group cursor-pointer">
                  <div className={`text-3xl font-bold mb-1 transition-colors duration-300 ${
                    theme === 'dark' 
                      ? 'text-white group-hover:text-orange-400' 
                      : 'text-gray-900 group-hover:text-orange-600'
                  }`}>
                    {user.stats.averageAnalysisScore}%
                  </div>
                  <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Analysis Score</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-4">
          {/* Test Selection - Now takes 2 columns */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Start New Session - Compressed */}
            <Card padding="default" hover>
              <CardHeader className="pb-3">
                <CardTitle icon={<Zap className="h-5 w-5 text-yellow-500" />}>
                  Start Your Next Session
                </CardTitle>
              </CardHeader>

              <Card variant="accent" padding="sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className={`text-lg font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Begin a New PrepTest Session
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Select a PrepTest and configure your session.
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 shadow-inner' : 'bg-gray-100'}`}>
                    <BookOpen className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
                
                <Button 
                  size="default" 
                  className="w-full"
                  onClick={handleStartNewSessionClick}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start New Test Session
                </Button>
              </Card>
            </Card>

            {/* Session Management - Collapsible Sections */}
            <div className="space-y-2">
              {/* Active Sessions */}
              <SessionSection
                title="Active Sessions"
                icon={<Activity className="h-4 w-4 text-orange-500" />}
                count={activeSessions.length}
                sessions={activeSessions}
                emptyMessage="No active sessions. Start a new PrepTest above!"
                emptyIcon="🎯"
                theme={theme}
                onResumeSession={onResumeTestSession}
                formatSessionDisplayName={formatSessionDisplayName}
                type="active"
              />

              {/* Ready for Review Sessions */}
              <SessionSection
                title="Ready for Review"
                icon={<Target className="h-4 w-4 text-teal-500" />}
                count={readyForBlindReviewSessions.length + readyForStrategyReviewSessions.length}
                sessions={[...readyForBlindReviewSessions, ...readyForStrategyReviewSessions]}
                emptyMessage="No sessions ready for review."
                emptyIcon="📝"
                theme={theme}
                onResumeSession={onResumeTestSession}
                formatSessionDisplayName={formatSessionDisplayName}
                type="review"
              />

              {/* Archived Sessions */}
              <SessionSection
                title="Archived Sessions"
                icon={<Archive className="h-4 w-4 text-gray-500" />}
                count={archivedSessions.length}
                sessions={archivedSessions}
                emptyMessage="No archived sessions."
                emptyIcon="📦"
                theme={theme}
                onResumeSession={() => {}}
                formatSessionDisplayName={formatSessionDisplayName}
                type="archived"
              />
            </div>
          </div>
           {/* Center Column - Empty*/}
          <div className="lg:col-span-1 space-y-4">
            <Card padding="default" hover>
              <CardHeader className="pb-3">
                <CardTitle icon={<Brain className="h-5 w-5 text-yellow-500" />}>
                  Start Your Next Drill
                </CardTitle>
              </CardHeader>

              <Card variant="accent" padding="sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className={`text-lg font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Begin a New PrepTest Session
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Select a PrepTest and configure your session.
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 shadow-inner' : 'bg-gray-100'}`}>
                    <BookOpen className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
                
                <Button 
                  size="default" 
                  className="w-full"
                  onClick={handleStartNewSessionClick}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start New Test Session
                </Button>
              </Card>
            </Card>
            </div>
          {/* Right Column - Now takes 1 column and combines Performance + Leaderboard */}
          <div className="space-y-4">
            
            {/* Performance Overview - Compressed */}
            <Card padding="sm">
              <CardHeader className="pb-2">
                <CardTitle icon={<TrendingUp className="h-4 w-4 text-green-500" />}>
                  Performance Overview
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Circuit Quality</span>
                    <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>85%</span>
                  </div>
                  <ProgressBar value={85} variant="success" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Analysis Depth</span>
                    <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>92%</span>
                  </div>
                  <ProgressBar value={92} variant="primary" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Consistency</span>
                    <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>78%</span>
                  </div>
                  <ProgressBar value={78} variant="warning" />
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard Preview - Compressed */}
            <Card padding="sm">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle icon={<Award className="h-4 w-4 text-yellow-500" />}>
                    Circuit Masters
                  </CardTitle>
                  <Users className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-2">
                <div className={`flex items-center justify-between p-3 rounded-xl border ${
                  theme === 'dark' ? 'bg-gray-750 border-yellow-600/30' : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-500 text-gray-900 text-xs font-bold rounded-full flex items-center justify-center mr-2 shadow-lg">1</div>
                    <span className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Sarah Chen</span>
                  </div>
                  <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>847</span>
                </div>
                
                <div className={`flex items-center justify-between p-3 rounded-xl border ${
                  theme === 'dark' ? 'bg-gray-750 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-500 text-white text-xs font-bold rounded-full flex items-center justify-center mr-2 shadow-lg">2</div>
                    <span className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Marcus Johnson</span>
                  </div>
                  <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>792</span>
                </div>
                
                <div className={`flex items-center justify-between p-3 rounded-xl border ${
                  theme === 'dark' ? 'bg-gray-750 border-orange-600/30' : 'bg-orange-50 border-orange-200'
                }`}>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-orange-400 to-orange-500 text-gray-900 text-xs font-bold rounded-full flex items-center justify-center mr-2 shadow-lg">3</div>
                    <span className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Emily Rodriguez</span>
                  </div>
                  <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>738</span>
                </div>
                
                <div className={`flex items-center justify-between p-3 rounded-xl border-2 ${
                  theme === 'dark' ? 'bg-gray-750 border-blue-500/50' : 'bg-blue-50 border-blue-300'
                }`}>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center mr-2 shadow-lg">{user.stats.rank}</div>
                    <span className={`font-bold text-sm ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>You</span>
                  </div>
                  <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{user.stats.circuitsCreated}</span>
                </div>
              </CardContent>
              
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  View Full Leaderboard
                </Button>
              </div>
            </Card>
          </div>
        </div>
       </div>
        {/* Time Mode Selection Modal */}
        <TimeModeSelectionModal
          isOpen={isTimeModeModalOpen}
          onClose={() => setIsTimeModeModal(false)}
          onSelectTimeMode={handleTimeModeSelected}
          allProcessedTests={allProcessedTests}
        />
        </div>
      </div>
  
  );
};

// Collapsible Session Section Component
interface SessionSectionProps {
  title: string;
  icon: React.ReactNode; 
  count: number;
  sessions: TestSession[];
  emptyMessage: string;
  emptyIcon: string;
  theme: 'light' | 'dark';
  onResumeSession: (sessionId: string, targetPhase?: 'blind-review' | 'strategy-review') => void;
  formatSessionDisplayName: (session: TestSession) => string;
  type: 'active' | 'review' | 'archived';
}

const SessionSection: React.FC<SessionSectionProps> = ({
  title,
  icon,
  count,
  sessions,
  emptyMessage,
  emptyIcon,
  theme,
  onResumeSession,
  formatSessionDisplayName,
  type
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getButtonVariant = () => {
    if (type === 'active') return count > 0 ? 'accent' : 'ghost';
    if (type === 'review') return count > 0 ? 'primary' : 'ghost';
    return count > 0 ? 'secondary' : 'ghost';
  };

  const renderSession = (session: TestSession) => {
    const isBlindReview = session.endTime && session.completedPhases.includes('timed') && !session.completedPhases.includes('blind-review');
    const isStrategyReview = session.endTime && session.completedPhases.includes('blind-review') && !session.completedPhases.includes('strategy-review');
    const isArchived = session.endTime && session.completedPhases.includes('strategy-review');

    if (type === 'active') {
      return (
        <Card 
          key={session.id} 
          variant="accent" 
          padding="sm"
          hover
          className={theme === 'dark' ? 'hover:border-orange-500/50' : 'hover:border-orange-300'}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {formatSessionDisplayName(session)}
            </h3>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {session.startTime.toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex items-center justify-between mb-2">
            <Badge variant={
              session.phase === 'strategy-review' ? 'warning' :
              session.phase === 'blind-review' ? 'info' : 'primary'
            }>
              {session.phase === 'timed' && session.timeMode ? `Timed (${session.timeMode})` : session.phase.replace('-', ' ')}
            </Badge>
            
            <div className={`flex space-x-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              <span>Q: {session.currentSectionIndex + 1}-{Object.keys(session.answeredQuestions).length}</span>
              <span>Circuits: {session.circuits.length}</span>
            </div>
          </div>
          
          <Button 
            variant="accent" 
            size="sm"
            className="w-full"
            onClick={() => onResumeSession(session.id)}
          >
            Resume Session
          </Button>
        </Card>
      );
    }

    if (type === 'review') {
      return (
        <Card 
          key={session.id} 
          variant="accent" 
          padding="sm"
          hover
          className={
            isBlindReview 
              ? (theme === 'dark' ? 'border-teal-600/30 bg-teal-900/10 hover:bg-teal-900/20' : 'border-teal-200 bg-teal-50/30 hover:bg-teal-50/50')
              : (theme === 'dark' ? 'border-orange-600/30 bg-orange-900/10 hover:bg-orange-900/20' : 'border-orange-200 bg-orange-50/30 hover:bg-orange-50/50')
          }
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {formatSessionDisplayName(session)}
            </h3>
            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {session.endTime?.toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <Badge variant={isBlindReview ? "primary" : "info"}>
              {isBlindReview ? "Timed Phase Completed" : "Blind Review Completed"}
            </Badge>
            <Button
              variant={isBlindReview ? "accent" : "danger"}
              size="sm"
              onClick={() => onResumeSession(session.id, isBlindReview ? 'blind-review' : 'strategy-review')}
              className="flex items-center"
            >
              {isBlindReview ? 'Start Blind Review' : 'Start Strategy Review'} 
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </Card>
      );
    }

    // Archived sessions
    return (
      <Card 
        key={session.id} 
        variant="accent" 
        padding="sm"
        hover
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {formatSessionDisplayName(session)}
          </h3>
          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {session.endTime?.toLocaleDateString()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <Badge variant="warning">
            Strategy Review Completed
          </Badge>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => alert('Viewing archived session details (not implemented yet)')}
            className="flex items-center"
          >
            View Details <Archive className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <Card padding="sm" hover>
      <Button
        variant={getButtonVariant()}
        className="w-full flex items-center justify-between p-3 mb-0"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          {icon}
          <span className="font-medium">{title}</span>
          <Badge variant="secondary" className="text-xs">
            {count}
          </Badge>
        </div>
        <ChevronRight 
          className={`h-4 w-4 transition-transform duration-200 ${
            isExpanded ? 'rotate-90' : ''
          }`} 
        />
      </Button>
      
      {isExpanded && (
        <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 duration-200">
          {sessions.length > 0 ? (
            sessions.map(renderSession)
          ) : (
            <div className="text-center py-4">
              <div className="text-2xl mb-2">{emptyIcon}</div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                {emptyMessage}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default Dashboard;