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
  
  // Filter user sessions into categories
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

  // Helper to format session display name
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
      <div className="w-full p-6">
        <div className="max-w-7xl mx-auto space-y-6">
        
          {/* Compact Welcome Header */}
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Welcome Message */}
            <div className="lg:col-span-2">
              <Card padding="lg" gradient={theme === 'light'}>
                <div className={`${theme === 'dark' ? 'bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-teal-600/20 p-6 -m-6 rounded-3xl' : ''}`}>
                  <h1 className={`text-3xl font-bold mb-2 ${
                    theme === 'dark' 
                      ? 'text-white' 
                      : 'bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent'
                  }`}>
                    Welcome back, {user.name}!
                  </h1>
                  <p className={`text-lg mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Ready to continue your LSAT mastery journey?
                  </p>
                  
                  {user.lawhubCredentials?.verified && (
                    <Badge variant="success" className="inline-flex items-center">
                      <Brain className="h-4 w-4 mr-2" />
                      LawHub Connected: {user.lawhubCredentials.username}
                    </Badge>
                  )}
                </div>
              </Card>
            </div>

            {/* Stats Grid */}
            <div className="lg:col-span-2 grid grid-cols-3 gap-4">
              <Card padding="default" hover>
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {user.stats.circuitsCreated}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Circuits</div>
                </div>
              </Card>
              <Card padding="default" hover>
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {user.stats.testsCompleted}
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Tests</div>
                </div>
              </Card>
              <Card padding="default" hover>
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {user.stats.averageAnalysisScore}%
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Analysis</div>
                </div>
              </Card>
            </div>
          </div>

          {/* Main Action Row */}
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Start New Session */}
            <div className="lg:col-span-2">
              <Card padding="lg" hover>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className={`text-xl font-bold mb-2 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      <Zap className="h-6 w-6 text-yellow-500 mr-2" />
                      Start New Session
                    </h3>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                      Begin a new PrepTest session
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
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
            </div>

            {/* Performance Overview */}
            <div className="lg:col-span-2">
              <Card padding="lg">
                <CardHeader>
                  <CardTitle icon={<TrendingUp className="h-5 w-5 text-green-500" />}>
                    Performance Overview
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Circuit Quality</span>
                    <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>85%</span>
                  </div>
                  <ProgressBar value={85} variant="success" />
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Analysis Depth</span>
                    <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>92%</span>
                  </div>
                  <ProgressBar value={92} variant="primary" />
                </CardContent>
              </Card>
            </div>

            {/* Study Streak */}
            <div className="lg:col-span-1">
              <Card padding="lg">
                <CardHeader>
                  <CardTitle icon={<Calendar className="h-5 w-5 text-orange-500" />}>
                    Streak
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  <div className="text-center">
                    <div className={`text-4xl font-bold mb-2 ${
                      theme === 'dark' 
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400' 
                        : 'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500'
                    }`}>7</div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Days 🔥</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sessions Overview */}
          <div className="grid lg:grid-cols-4 gap-6">
            
            {/* Active Sessions */}
            <Card padding="lg" hover>
              <CardHeader>
                <CardTitle icon={<Activity className="h-6 w-6 text-orange-500" />}>
                  Active Sessions
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                {activeSessions.length > 0 ? (
                  <div className="space-y-3">
                    {activeSessions.slice(0, 2).map((session) => (
                      <Card 
                        key={session.id} 
                        variant="accent" 
                        padding="default"
                        hover
                        className={theme === 'dark' ? 'hover:border-orange-500/50' : 'hover:border-orange-300'}
                      >
                        <div className="mb-3">
                          <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatSessionDisplayName(session)}
                          </h4>
                          <div className="flex items-center justify-between mt-1">
                            <Badge variant="primary" className="text-xs">
                              {session.phase === 'timed' && session.timeMode ? `${session.timeMode}` : session.phase}
                            </Badge>
                            <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Q{session.currentSectionIndex + 1}
                            </span>
                          </div>
                        </div>
                        
                        <Button 
                          variant="accent" 
                          size="sm"
                          className="w-full"
                          onClick={() => onResumeTestSession(session.id)}
                        >
                          Resume
                        </Button>
                      </Card>
                    ))}
                    {activeSessions.length > 2 && (
                      <p className={`text-sm text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        +{activeSessions.length - 2} more
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-3xl mb-2">🎯</div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      No active sessions
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ready for Review */}
            <Card padding="lg" hover>
              <CardHeader>
                <CardTitle icon={<Target className="h-6 w-6 text-teal-500" />}>
                  Ready for Review
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                {readyForBlindReviewSessions.length > 0 || readyForStrategyReviewSessions.length > 0 ? (
                  <div className="space-y-3">
                    {[...readyForBlindReviewSessions, ...readyForStrategyReviewSessions].slice(0, 2).map((session) => {
                      const isBlindReview = readyForBlindReviewSessions.includes(session);
                      return (
                        <Card 
                          key={session.id} 
                          variant="accent" 
                          padding="default"
                          hover
                          className={theme === 'dark' ? 
                            (isBlindReview ? 'border-teal-600/30 bg-teal-900/10' : 'border-orange-600/30 bg-orange-900/10') : 
                            (isBlindReview ? 'border-teal-200 bg-teal-50/30' : 'border-orange-200 bg-orange-50/30')
                          }
                        >
                          <div className="mb-3">
                            <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatSessionDisplayName(session)}
                            </h4>
                            <Badge variant={isBlindReview ? "primary" : "info"} className="text-xs mt-1">
                              {isBlindReview ? "Start Blind Review" : "Start Strategy Review"}
                            </Badge>
                          </div>
                          
                          <Button
                            variant="accent"
                            size="sm"
                            className="w-full"
                            onClick={() => onResumeTestSession(session.id, isBlindReview ? 'blind-review' : 'strategy-review')}
                          >
                            Review
                          </Button>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-3xl mb-2">📝</div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      No sessions ready
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Leaderboard Preview */}
            <Card padding="lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle icon={<Award className="h-5 w-5 text-yellow-500" />}>
                    Circuit Masters
                  </CardTitle>
                  <Users className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-2">
                <div className={`flex items-center justify-between p-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-750 border-yellow-600/30' : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-500 text-gray-900 text-xs font-bold rounded-full flex items-center justify-center mr-2">1</div>
                    <span className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Sarah</span>
                  </div>
                  <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>847</span>
                </div>
                
                <div className={`flex items-center justify-between p-2 rounded-lg border ${
                  theme === 'dark' ? 'bg-gray-750 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-500 text-white text-xs font-bold rounded-full flex items-center justify-center mr-2">2</div>
                    <span className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Marcus</span>
                  </div>
                  <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>792</span>
                </div>
                
                <div className={`flex items-center justify-between p-2 rounded-lg border-2 ${
                  theme === 'dark' ? 'bg-gray-750 border-blue-500/50' : 'bg-blue-50 border-blue-300'
                }`}>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center mr-2">{user.stats.rank}</div>
                    <span className={`font-medium text-sm ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>You</span>
                  </div>
                  <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{user.stats.circuitsCreated}</span>
                </div>
              </CardContent>
            </Card>

            {/* Archived Sessions */}
            <Card padding="lg" hover>
              <CardHeader>
                <CardTitle icon={<Archive className="h-6 w-6 text-gray-500" />}>
                  Archived
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                {archivedSessions.length > 0 ? (
                  <div className="space-y-3">
                    {archivedSessions.slice(0, 2).map((session) => (
                      <Card 
                        key={session.id} 
                        variant="accent" 
                        padding="default"
                        hover
                      >
                        <div className="mb-3">
                          <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatSessionDisplayName(session)}
                          </h4>
                          <Badge variant="warning" className="text-xs mt-1">
                            Complete
                          </Badge>
                        </div>
                        
                        <Button
                          variant="secondary"
                          size="sm"
                          className="w-full"
                          onClick={() => alert('Viewing archived session details (not implemented yet)')}
                        >
                          View Details
                        </Button>
                      </Card>
                    ))}
                    {archivedSessions.length > 2 && (
                      <p className={`text-sm text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        +{archivedSessions.length - 2} more
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="text-3xl mb-2">📚</div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      No archived sessions
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
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
    </div>
  );
};

export default Dashboard;