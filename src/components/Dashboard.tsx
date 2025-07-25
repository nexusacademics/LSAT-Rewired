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
      <div className="w-full pt-24 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Theme Toggle */}
     

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

            {/* Ready for Review Sessions */}
            <Card padding="lg" hover>
              <CardHeader>
                <CardTitle icon={<Target className="h-6 w-6 text-teal-500" />}>
                  Ready for Review
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                {readyForBlindReviewSessions.length > 0 || readyForStrategyReviewSessions.length > 0 ? (
                  <div className="space-y-4">
                    {readyForBlindReviewSessions.map((session) => (
                      <Card 
                        key={session.id} 
                        variant="accent" 
                        padding="default"
                        hover
                        className={theme === 'dark' ? 'border-teal-600/30 bg-teal-900/10 hover:bg-teal-900/20' : 'border-teal-200 bg-teal-50/30 hover:bg-teal-50/50'}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatSessionDisplayName(session)}
                          </h3>
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Completed: {session.endTime?.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="primary">
                            Timed Phase Completed
                          </Badge>
                          <Button
                            variant="accent"
                            size="sm"
                            onClick={() => onResumeTestSession(session.id, 'blind-review')}
                            className="flex items-center"
                          >
                            Start Blind Review <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </Card>
                    ))}

                    {readyForStrategyReviewSessions.map((session) => (
                      <Card 
                        key={session.id} 
                        variant="accent" 
                        padding="default"
                        hover
                        className={theme === 'dark' ? 'border-orange-600/30 bg-orange-900/10 hover:bg-orange-900/20' : 'border-orange-200 bg-orange-50/30 hover:bg-orange-50/50'}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatSessionDisplayName(session)}
                          </h3>
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Completed: {session.endTime?.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="info">
                            Blind Review Completed
                          </Badge>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => onResumeTestSession(session.id, 'strategy-review')}
                            className="flex items-center"
                          >
                            Start Strategy Review <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                      No sessions ready for review.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Archived Sessions */}
            <Card padding="lg" hover>
              <CardHeader>
                <CardTitle icon={<Archive className="h-6 w-6 text-gray-500" />}>
                  Archived Sessions
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                {archivedSessions.length > 0 ? (
                  <div className="space-y-4">
                    {archivedSessions.map((session) => (
                      <Card 
                        key={session.id} 
                        variant="accent" 
                        padding="default"
                        hover
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {formatSessionDisplayName(session)}
                          </h3>
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            Archived: {session.endTime?.toLocaleDateString()}
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
                            View Details <Archive className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                      No archived sessions.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Performance Overview */}
            <Card padding="default">
              <CardHeader>
                <CardTitle icon={<TrendingUp className="h-5 w-5 text-green-500" />}>
                  Performance Overview
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Circuit Quality</span>
                    <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>85%</span>
                  </div>
                  <ProgressBar value={85} variant="success" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Analysis Depth</span>
                    <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>92%</span>
                  </div>
                  <ProgressBar value={92} variant="primary" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Consistency</span>
                    <span className={`text-lg font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>78%</span>
                  </div>
                  <ProgressBar value={78} variant="warning" />
                </div>
              </CardContent>
            </Card>

            {/* Leaderboard Preview */}
            <Card padding="default">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle icon={<Award className="h-5 w-5 text-yellow-500" />}>
                    Circuit Masters
                  </CardTitle>
                  <Users className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className={`flex items-center justify-between p-4 rounded-2xl border ${
                  theme === 'dark' ? 'bg-gray-750 border-yellow-600/30' : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-500 text-gray-900 text-sm font-bold rounded-full flex items-center justify-center mr-3 shadow-lg">1</div>
                    <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Sarah Chen</span>
                  </div>
                  <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>847 circuits</span>
                </div>
                
                <div className={`flex items-center justify-between p-4 rounded-2xl border ${
                  theme === 'dark' ? 'bg-gray-750 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 text-white text-sm font-bold rounded-full flex items-center justify-center mr-3 shadow-lg">2</div>
                    <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Marcus Johnson</span>
                  </div>
                  <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>792 circuits</span>
                </div>
                
                <div className={`flex items-center justify-between p-4 rounded-2xl border ${
                  theme === 'dark' ? 'bg-gray-750 border-orange-600/30' : 'bg-orange-50 border-orange-200'
                }`}>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 text-gray-900 text-sm font-bold rounded-full flex items-center justify-center mr-3 shadow-lg">3</div>
                    <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Emily Rodriguez</span>
                  </div>
                  <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>738 circuits</span>
                </div>
                
                <div className={`flex items-center justify-between p-4 rounded-2xl border-2 ${
                  theme === 'dark' ? 'bg-gray-750 border-blue-500/50' : 'bg-blue-50 border-blue-300'
                }`}>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm font-bold rounded-full flex items-center justify-center mr-3 shadow-lg">{user.stats.rank}</div>
                    <span className={`font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>You</span>
                  </div>
                  <span className={`text-sm font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{user.stats.circuitsCreated} circuits</span>
                </div>
              </CardContent>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button variant="ghost" className="w-full text-sm">
                  View Full Leaderboard
                </Button>
              </div>
            </Card>

            {/* Study Streak */}
            <Card padding="default">
              <CardHeader>
                <CardTitle icon={<Calendar className="h-5 w-5 text-orange-500" />}>
                  Study Streak
                </CardTitle>
              </CardHeader>
              
              <CardContent>
                <div className="text-center">
                  <div className={`text-5xl font-bold mb-3 ${
                    theme === 'dark' 
                      ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400' 
                      : 'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500'
                  }`}>7</div>
                  <div className={`text-sm mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Days in a row 🔥</div>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {[...Array(7)].map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 shadow-lg transform hover:scale-110 transition-transform ${
                          theme === 'dark' ? 'border border-orange-400/30' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
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
    </div>
  );
};

export default Dashboard;