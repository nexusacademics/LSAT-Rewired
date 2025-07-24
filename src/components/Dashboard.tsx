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
    <div className={`flex-1 min-h-0 w-full transition-all duration-500 ${backgroundClasses} overflow-hidden`}>
      <div className="w-full h-full p-3">
        <div className="max-w-7xl mx-auto h-full flex flex-col">
          
          {/* Top Row: Welcome & Start New Session - Fixed height */}
          <div className="flex-shrink-0 grid lg:grid-cols-2 gap-4 mb-4">
            {/* Welcome Message */}
            <Card padding="default">
              <div className={`${theme === 'dark' ? 'bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-teal-600/20 p-4 -m-4 rounded-2xl' : ''}`}>
                <h1 className={`text-2xl font-bold mb-1 ${
                  theme === 'dark' 
                    ? 'text-white' 
                    : 'bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent'
                }`}>
                  Welcome back, {user.name}!
                </h1>
                <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Ready to continue your LSAT mastery journey?
                </p>
                
                {user.lawhubCredentials?.verified && (
                  <Badge variant="success" className="inline-flex items-center text-xs">
                    <Brain className="h-3 w-3 mr-1" />
                    LawHub: {user.lawhubCredentials.username}
                  </Badge>
                )}
              </div>
            </Card>

            {/* Start New Session */}
            <Card padding="default" hover>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className={`text-lg font-bold mb-1 flex items-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                    Start New Session
                  </h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Begin a new PrepTest
                  </p>
                </div>
                <div className={`p-2 rounded-xl ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <BookOpen className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              
              <Button 
                size="default" 
                className="w-full"
                onClick={handleStartNewSessionClick}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Test Session
              </Button>
            </Card>
          </div>

          {/* Main Content: Flexible height container */}
          <div className="flex-1 min-h-0 grid lg:grid-cols-3 gap-4">
            
            {/* Left Column: Sessions (2/3 width) */}
            <div className="lg:col-span-2 min-h-0 flex flex-col">
              
              {/* Active Sessions - Takes available space */}
              <div className="flex-1 min-h-0 mb-4">
                <Card padding="default" className="h-full flex flex-col">
                  <CardHeader className="pb-2 flex-shrink-0">
                    <CardTitle icon={<Activity className="h-5 w-5 text-orange-500" />} className="text-lg">
                      Active Sessions
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-1 min-h-0 overflow-y-auto">
                    {activeSessions.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-3">
                        {activeSessions.slice(0, 6).map((session) => (
                          <Card 
                            key={session.id} 
                            variant="accent" 
                            padding="default"
                            hover
                            className={`${theme === 'dark' ? 'hover:border-orange-500/50' : 'hover:border-orange-300'}`}
                          >
                            <div className="mb-2">
                              <h4 className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {formatSessionDisplayName(session)}
                              </h4>
                              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                {session.startTime.toLocaleDateString()}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between mb-2">
                              <Badge variant="primary" className="text-xs">
                                {session.phase === 'timed' && session.timeMode ? `${session.timeMode}` : session.phase}
                              </Badge>
                              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Q: {Object.keys(session.answeredQuestions).length}
                              </span>
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
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="text-4xl mb-2">🎯</div>
                          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            No active sessions
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Review & Archived - Fixed height bottom section */}
              <div className="flex-shrink-0 grid grid-cols-2 gap-3 h-48">
                {/* Ready for Review */}
                <Card padding="default" hover className="h-full flex flex-col">
                  <CardHeader className="pb-2 flex-shrink-0">
                    <CardTitle icon={<Target className="h-4 w-4 text-teal-500" />} className="text-sm">
                      Ready for Review
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-1 min-h-0 overflow-y-auto">
                    {readyForBlindReviewSessions.length > 0 || readyForStrategyReviewSessions.length > 0 ? (
                      <div className="space-y-2">
                        {[...readyForBlindReviewSessions, ...readyForStrategyReviewSessions].slice(0, 4).map((session) => {
                          const isBlindReview = readyForBlindReviewSessions.includes(session);
                          return (
                            <div key={session.id} className={`p-2 rounded-lg border text-center ${
                              theme === 'dark' ? 
                                (isBlindReview ? 'border-teal-600/30 bg-teal-900/10' : 'border-orange-600/30 bg-orange-900/10') : 
                                (isBlindReview ? 'border-teal-200 bg-teal-50/30' : 'border-orange-200 bg-orange-50/30')
                            }`}>
                              <div className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                {formatSessionDisplayName(session).split(' - ')[0]}
                              </div>
                              <Button
                                variant="accent"
                                size="sm"
                                className="w-full text-xs"
                                onClick={() => onResumeTestSession(session.id, isBlindReview ? 'blind-review' : 'strategy-review')}
                              >
                                {isBlindReview ? 'Blind Review' : 'Strategy Review'}
                              </Button>
                            </div>
                          );
                        })}
                        {(readyForBlindReviewSessions.length + readyForStrategyReviewSessions.length) > 4 && (
                          <p className={`text-xs text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            +{(readyForBlindReviewSessions.length + readyForStrategyReviewSessions.length) - 4} more
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          None ready
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Archived Sessions */}
                <Card padding="default" hover className="h-full flex flex-col">
                  <CardHeader className="pb-2 flex-shrink-0">
                    <CardTitle icon={<Archive className="h-4 w-4 text-gray-500" />} className="text-sm">
                      Archived
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-1 min-h-0 overflow-y-auto">
                    {archivedSessions.length > 0 ? (
                      <div className="space-y-2">
                        {archivedSessions.slice(0, 4).map((session) => (
                          <div key={session.id} className={`p-2 rounded-lg border text-center ${
                            theme === 'dark' ? 'bg-gray-750 border-gray-600' : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className={`text-xs font-medium mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                              {formatSessionDisplayName(session).split(' - ')[0]}
                            </div>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="w-full text-xs"
                              onClick={() => alert('View details')}
                            >
                              View Details
                            </Button>
                          </div>
                        ))}
                        {archivedSessions.length > 4 && (
                          <p className={`text-xs text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                            +{archivedSessions.length - 4} more
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          None archived
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Column: Stats & Performance (1/3 width) */}
            <div className="min-h-0 flex flex-col">
              
              {/* Performance Overview - Takes half of available space */}
              <div className="flex-1 min-h-0 mb-4">
                <Card padding="default" className="h-full flex flex-col">
                  <CardHeader className="pb-2 flex-shrink-0">
                    <CardTitle icon={<TrendingUp className="h-4 w-4 text-green-500" />} className="text-sm">
                      Performance
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col justify-center space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Circuit Quality</span>
                        <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>85%</span>
                      </div>
                      <ProgressBar value={85} variant="success" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Analysis Depth</span>
                        <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>92%</span>
                      </div>
                      <ProgressBar value={92} variant="primary" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Consistency</span>
                        <span className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>78%</span>
                      </div>
                      <ProgressBar value={78} variant="warning" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Combined Stats & Leaderboard - Takes remaining space */}
              <div className="flex-1 min-h-0">
                <Card padding="default" className="h-full flex flex-col">
                  <CardHeader className="pb-2 flex-shrink-0">
                    <CardTitle icon={<Award className="h-4 w-4 text-yellow-500" />} className="text-sm">
                      Stats & Rankings
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col justify-center">
                    {/* Two Column Layout: Stats Left, Rankings Right */}
                    <div className="grid grid-cols-2 gap-4 h-full">
                      
                      {/* Left Column: Personal Stats */}
                      <div className="flex flex-col justify-center space-y-3">
                        <div className="text-center">
                          <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {user.stats.circuitsCreated}
                          </div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Circuits</div>
                        </div>
                        
                        <div className="text-center">
                          <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {user.stats.testsCompleted}
                          </div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Tests</div>
                        </div>
                        
                        <div className="text-center">
                          <div className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {user.stats.averageAnalysisScore}%
                          </div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Analysis</div>
                        </div>

                        {/* Study Streak */}
                        <div className="text-center pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className={`text-lg font-bold mb-1 ${
                            theme === 'dark' 
                              ? 'text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400' 
                              : 'text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500'
                          }`}>7</div>
                          <div className={`text-xs flex items-center justify-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            <Calendar className="h-3 w-3 mr-1" />
                            Day Streak 🔥
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Rankings */}
                      <div className="flex flex-col justify-center min-w-0">
                        <div className={`text-xs font-medium mb-2 text-center ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Leaderboard
                        </div>
                        
                        <div className="space-y-1 min-w-0">
                          <div className={`flex items-center justify-between p-1.5 rounded border text-xs min-w-0 ${
                            theme === 'dark' ? 'bg-gray-750 border-yellow-600/30' : 'bg-yellow-50 border-yellow-200'
                          }`}>
                            <div className="flex items-center min-w-0 flex-shrink">
                              <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-yellow-500 text-gray-900 text-xs font-bold rounded-full flex items-center justify-center mr-1 flex-shrink-0">1</div>
                              <span className={`font-medium truncate ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Sarah</span>
                            </div>
                            <span className={`font-semibold ml-1 flex-shrink-0 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>847</span>
                          </div>
                          
                          <div className={`flex items-center justify-between p-1.5 rounded border text-xs min-w-0 ${
                            theme === 'dark' ? 'bg-gray-750 border-blue-500/50' : 'bg-blue-50 border-blue-300'
                          }`}>
                            <div className="flex items-center min-w-0 flex-shrink">
                              <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center mr-1 flex-shrink-0">{user.stats.rank}</div>
                              <span className={`font-medium truncate ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>You</span>
                            </div>
                            <span className={`font-semibold ml-1 flex-shrink-0 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{user.stats.circuitsCreated}</span>
                          </div>
                          
                          <div className={`flex items-center justify-between p-1.5 rounded border text-xs min-w-0 ${
                            theme === 'dark' ? 'bg-gray-750 border-gray-600' : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex items-center min-w-0 flex-shrink">
                              <div className="w-4 h-4 bg-gradient-to-br from-gray-400 to-gray-500 text-white text-xs font-bold rounded-full flex items-center justify-center mr-1 flex-shrink-0">3</div>
                              <span className={`font-medium truncate ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>Alex</span>
                            </div>
                            <span className={`font-semibold ml-1 flex-shrink-0 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>203</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
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
    </div>
  );
};

export default Dashboard;