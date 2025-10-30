import React, { useState } from 'react';
import { Play, Activity, Target, Archive, ChevronRight, BookOpen, Brain, Drill } from 'lucide-react';
import { User, TestSession, ProcessedPrepTest } from '../App';
import TimeModeSelectionModal from './TimeModeSelectionModal';
import { useTheme } from '../contexts/ThemeContext';
import Button from './ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from './ui/Card';
import Badge from './ui/Badge';

interface SessionsPageProps {
  user: User;
  userSessions: TestSession[];
  onStartNewTestSession: (testId: string, phase: 'timed' | 'blind-review' | 'strategy-review', timeMode?: 'regular' | '1.5x' | '2x' | 'custom' | 'untimed', customTimeMinutes?: number, selectedSectionId?: string) => void;
  onResumeTestSession: (sessionId: string, targetPhase?: 'blind-review' | 'strategy-review') => void;
  allProcessedTests: { [key: string]: ProcessedPrepTest };
}

const SessionsPage: React.FC<SessionsPageProps> = ({
  user,
  userSessions,
  onStartNewTestSession,
  onResumeTestSession,
  allProcessedTests
}) => {
  const [isTimeModeModalOpen, setIsTimeModeModal] = useState(false);
  const { theme } = useTheme();

  const backgroundClasses = theme === 'dark'
    ? 'bg-gray-900'
    : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100';

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

  return (
    <div className={`min-h-screen w-full transition-all duration-500 ${backgroundClasses}`}>
      <div className="w-full pt-10 px-4 pb-4">
        <div className="max-w-[1600px] mx-auto space-y-4">

          {/* Page Header */}
          <Card padding="default" gradient={theme === 'light'}>
            <div className={`${theme === 'dark' ? 'bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-teal-600/20 p-6 -m-6 rounded-2xl' : ''}`}>
              <h1 className={`text-3xl lg:text-4xl font-bold mb-2 ${
                theme === 'dark'
                  ? 'text-white'
                  : 'bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent'
              }`}>
                Sessions & Drills
              </h1>
              <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Start new sessions, resume in-progress work, or review completed sessions
              </p>
            </div>
          </Card>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-4">

            {/* Left Column - Test Sessions */}
            <div className="space-y-4">
              <Card padding="default" hover>
                <CardHeader className="pb-3">
                  <CardTitle icon={<BookOpen className="h-5 w-5 text-blue-500" />}>
                    PrepTest Sessions
                  </CardTitle>
                </CardHeader>
                <Card variant="accent" padding="sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className={`text-lg font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Start New Test or Section
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Select an official LSAC PrepTest and configure your session
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 shadow-inner' : 'bg-gray-100'}`}>
                      <BookOpen className="h-6 w-6 text-blue-500" />
                    </div>
                  </div>
                  <Button
                    size="md"
                    className="w-full"
                    onClick={handleStartNewSessionClick}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start New Test Session
                  </Button>
                </Card>
              </Card>

              {/* Session Management Sections */}
              <div className="space-y-2">
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

            {/* Right Column - Drill Sessions */}
            <div className="space-y-4">
              <Card padding="default" hover>
                <CardHeader className="pb-3">
                  <CardTitle icon={<Brain className="h-5 w-5 text-purple-500" />}>
                    Drill Sessions
                  </CardTitle>
                </CardHeader>
                <Card variant="accent" padding="sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className={`text-lg font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        Stim Drill
                      </h3>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        Practice Logical Reasoning Stimulus Analysis
                      </p>
                    </div>
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 shadow-inner' : 'bg-gray-100'}`}>
                      <Drill className="h-6 w-6 text-purple-500" />
                    </div>
                  </div>
                  <Button
                    size="md"
                    className="w-full"
                    onClick={handleStartNewSessionClick}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start New Stim Drill
                  </Button>
                </Card>
              </Card>

              {/* Drill Management Sections */}
              <div className="space-y-2">
                <DrillSection
                  title="Active Drills"
                  icon={<Activity className="h-4 w-4 text-orange-500" />}
                  count={0}
                  emptyMessage="No active drills. Start a new drill above!"
                  emptyIcon="🎯"
                  theme={theme}
                />

                <DrillSection
                  title="Archived Drills"
                  icon={<Archive className="h-4 w-4 text-gray-500" />}
                  count={0}
                  emptyMessage="No archived drills yet."
                  emptyIcon="📦"
                  theme={theme}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <TimeModeSelectionModal
        isOpen={isTimeModeModalOpen}
        onClose={() => setIsTimeModeModal(false)}
        onSelectTimeMode={handleTimeModeSelected}
      />
    </div>
  );
};

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

interface DrillSectionProps {
  title: string;
  icon: React.ReactNode;
  count: number;
  emptyMessage: string;
  emptyIcon: string;
  theme: 'light' | 'dark';
}

const DrillSection: React.FC<DrillSectionProps> = ({
  title,
  icon,
  count,
  emptyMessage,
  emptyIcon,
  theme
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card padding="sm" hover>
      <Button
        variant={count > 0 ? 'accent' : 'ghost'}
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
          <div className="text-center py-4">
            <div className="text-2xl mb-2">{emptyIcon}</div>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {emptyMessage}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

export default SessionsPage;
