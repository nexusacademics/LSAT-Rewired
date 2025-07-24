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
        
          {/* Top Row: Welcome & Start New Session */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Welcome Message */}
            <Card padding="lg" gradient={theme === 'light'}>
              <div className={`${theme === 'dark' ? 'bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-teal-600/20 p-6 -m-6 rounded-3xl' : ''}`}>
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
                
                {user.lawhubCredentials?.verified && (
                  <Badge variant="success" className="inline-flex items-center">
                    <Brain className="h-4 w-4 mr-2" />
                    LawHub Connected: {user.lawhubCredentials.username}
                  </Badge>
                )}
              </div>
            </Card>

            {/* Start New Session */}
            <Card padding="lg" hover>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-2xl font-bold mb-2 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Zap className="h-6 w-6 text-yellow-500 mr-2" />
                    Start New Session
                  </h3>
                  <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                    Begin a new PrepTest session with custom timing
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

          {/* Main Content: Two Column Layout */}
          <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Left Column: Sessions (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Active Sessions */}
              <Card padding="lg" hover>
                <CardHeader>
                  <CardTitle icon={<Activity className="h-6 w-6 text-orange-500" />}>
                    Your Active Sessions
                  </CardTitle>
                </CardHeader>
                
                <CardContent>
                  {activeSessions.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {activeSessions.map((session) => (
                        <Card 
                          key={session.id} 
                          variant="accent" 
                          padding="default"
                          hover
                          className={theme === 'dark' ? 'hover:border-orange-500/50' : 'hover:border-orange-300'}
                        >
                          <div className="mb-4">
                            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatSessionDisplayName(session)}
                            </h4>
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
                    <div className="grid md:grid-cols-2 gap-4">
                      {readyForBlindReviewSessions.map((session) => (
                        <Card 
                          key={session.id} 
                          variant="accent" 
                          padding="default"
                          hover
                          className={theme === 'dark' ? 'border-teal-600/30 bg-teal-900/10 hover:bg-teal-900/20' : 'border-teal-200 bg-teal-50/30 hover:bg-teal-50/50'}
                        >
                          <div className="mb-4">
                            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatSessionDisplayName(session)}
                            </h4>
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Completed: {session.endTime?.toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mb-4">
                            <Badge variant="primary">
                              Timed Phase Completed
                            </Badge>
                          </div>
                          <Button
                            variant="accent"
                            className="w-full"
                            onClick={() => onResumeTestSession(session.id, 'blind-review')}
                          >
                            Start Blind Review
                          </Button>
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
                          <div className="mb-4">
                            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatSessionDisplayName(session)}
                            </h4>
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Completed: {session.endTime?.toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mb-4">
                            <Badge variant="info">
                              Blind Review Completed
                            </Badge>
                          </div>
                          <Button
                            variant="danger"
                            className="w-full"
                            onClick={() => onResumeTestSession(session.id, 'strategy-review')}
                          >
                            Start Strategy Review
                          </Button>
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
                    <div className="grid md:grid-cols-2 gap-4">
                      {archivedSessions.slice(0, 4).map((session) => (
                        <Card 
                          key={session.id} 
                          variant="accent" 
                          padding="default"
                          hover
                        >
                          <div className="mb-4">
                            <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatSessionDisplayName(session)}
                            </h4>
                            <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                              Archived: {session.endTime?.toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mb-4">
                            <Badge variant="warning">
                              Complete
                            </Badge>
                          </div>
                          <Button
                            variant="secondary"
                            className="w-full"
                            onClick={() => alert('Viewing archived session details (not implemented yet)')}
                          >
                            View Details
                          </Button>
                        </Card>
                      ))}
                      {archivedSessions.length > 4 && (
                        <div className="col-span-2 text-center py-4">
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            +{archivedSessions.length - 4} more archived sessions
                          </p>
                        </div>
                      )}
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

            {/* Right Column: Stats & Performance (1/3 width) */}
            <div className="space-y-6">
              
              {/* Performance Overview */}
              <Card padding="lg">
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

              {/* Combined Stats & Leaderboard */}
              <Card padding="lg">
                <CardHeader>
                  <CardTitle icon={<Award className="h-5 w-5 text-yellow-500" />}>
                    Your Stats & Rankings
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Personal Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {user.stats.circuitsCreated}
                      </div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Circuits</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {user.stats.testsCompleted}
                      </div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Tests</div>
                    </div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {user.stats.averageAnalysisScore}%
                      </div>
                      <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Analysis</div>
                    </div>
                  </div>

                  {/* Study Streak */}
                  <div className="text-center py-4 border-t border-b border-gray-200 dark:border-gray-700">
                    <div className={`text-3xl font-bold mb-2 ${
                      theme === 'dark' 
                        ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400' 
                        : 'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500'
                    }`}>7</div>
                    <div className={`text-sm flex items-center justify-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Calendar className="h-4 w-4 mr-1" />
                      Day Streak 🔥
                    </div>
                  </div>

                  {/* Leaderboard */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Circuit Masters</h4>
                      <Users className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className={`flex items-center justify-between p-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-750 border-yellow-600/30' : 'bg-yellow-50 border-yellow-200'
                      }`}>
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-yellow-500 text-gray-900 text-xs font-bold rounded-full flex items-center justify-center mr-2">1</div>
                          <span className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Sarah Chen</span>
                        </div>
                        <span className={`text-xs font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>847</span>
                      </div>
                      
                      <div className={`flex items-center justify-between p-2 rounded-lg border ${
                        theme === 'dark' ? 'bg-gray-750 border-gray-600' : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-center">
                          <div className="w-6 h-6 bg-gradient-to-br from-gray-400 to-gray-500 text-white text-xs font-bold rounded-full flex items-center justify-center mr-2">2</div>
                          <span className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Marcus Johnson</span>
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