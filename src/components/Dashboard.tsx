import React, { useState } from 'react';
import { BookOpen, Play, TrendingUp, Calendar, Upload, Download, Users, Brain, Target, Archive, ChevronRight } from 'lucide-react';
import { User, TestSession, ProcessedPrepTest } from '../App'; // Import TestSession and ProcessedPrepTest types
import TimeModeSelectionModal from './TimeModeSelectionModal'; // Import the new modal

interface DashboardProps {
  user: User;
  userSessions: TestSession[]; // Pass all user sessions from App.tsx
  onStartNewTestSession: (testId: string, phase: 'timed' | 'blind-review' | 'strategy-review', timeMode?: 'regular' | '1.5x' | '2x' | 'custom' | 'untimed', customTimeMinutes?: number, selectedSectionId?: string) => void;
  onResumeTestSession: (sessionId: string, targetPhase?: 'blind-review' | 'strategy-review') => void; // Updated prop to resume a session or start new phase
  allProcessedTests: { [key: string]: ProcessedPrepTest }; // New prop for all processed test data
}

const Dashboard: React.FC<DashboardProps> = ({ user, userSessions, onStartNewTestSession, onResumeTestSession, allProcessedTests }) => {
  const [isTimeModeModalOpen, setIsTimeModeModal] = useState(false);
  
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
    if (!test) return session.testId; // Fallback if test data not found

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
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between"> {/* Adjusted for flex layout */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome back, {user.name}!
            </h1>
            <p className="text-slate-600">
              Ready to continue your LSAT mastery journey?
            </p>
          </div>
          
          {user.lawhubCredentials?.verified && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2 mt-4 sm:mt-0 sm:ml-6 w-fit max-w-xs"> {/* Adjusted width and margin */}
              <div className="flex items-center">
                <Brain className="h-4 w-4 text-green-600 mr-2" /> {/* Adjusted icon size */}
                <span className="text-xs font-medium text-green-800"> {/* Adjusted font size */}
                  LawHub Connected: {user.lawhubCredentials.username}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-6 mt-6 sm:mt-0"> {/* Adjusted margin for smaller screens */}
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{user.stats.circuitsCreated}</div>
              <div className="text-sm text-slate-600">Circuits Built</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">{user.stats.testsCompleted}</div>
              <div className="text-sm text-slate-600">Tests Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{user.stats.averageAnalysisScore}%</div>
              <div className="text-sm text-slate-600">Analysis Score</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Test Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Start a New Session</h2>
             
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-xl border-2 border-slate-200 hover:border-slate-300 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">Begin a New PrepTest Session</h3>
                    <p className="text-sm text-slate-600">
                      Select a PrepTest and configure your session.
                    </p>
                  </div>
                  <BookOpen className="h-5 w-5 text-slate-400" />
                </div>
                
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={handleStartNewSessionClick}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Play className="h-4 w-4 inline mr-2" />
                    Start New Test Session
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Your Active Sessions</h2>
            
            <div className="space-y-4">
              {activeSessions.length > 0 ? (
                activeSessions.map((session) => (
                  <div key={session.id} className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-slate-900">
                        {formatSessionDisplayName(session)}
                      </h3>
                      <span className="text-sm text-slate-500">
                        Started: {session.startTime.toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className={`px-3 py-1 rounded-full ${
                        session.phase === 'strategy-review' 
                          ? 'bg-orange-100 text-orange-700'
                          : session.phase === 'blind-review'
                          ? 'bg-teal-100 text-teal-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {session.phase === 'timed' && session.timeMode ? `Timed (${session.timeMode})` : session.phase.replace('-', ' ')}
                      </span>
                      
                      <div className="flex space-x-4 text-slate-600">
                        <span>Q: {session.currentSectionIndex + 1}-{Object.keys(session.answeredQuestions).length}</span> {/* Simplified Q display */}
                        <span>Circuits: {session.circuits.length}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={() => onResumeTestSession(session.id)}
                        className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                      >
                        Resume Session
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-4">No active sessions. Start a new PrepTest above!</p>
              )}
            </div>
          </div>

          {/* Ready for Review Sessions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Ready for Review</h2>
            <div className="space-y-4">
              {readyForBlindReviewSessions.length > 0 || readyForStrategyReviewSessions.length > 0 ? (
                <>
                  {readyForBlindReviewSessions.map((session) => (
                    <div key={session.id} className="p-4 border border-teal-200 rounded-xl bg-teal-50 hover:bg-teal-100 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-slate-900">
                          {formatSessionDisplayName(session)}
                        </h3>
                        <span className="text-sm text-slate-500">
                          Completed: {session.endTime?.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                          Timed Phase Completed
                        </span>
                        <button
                          onClick={() => onResumeTestSession(session.id, 'blind-review')}
                          className="py-1.5 px-3 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors flex items-center"
                        >
                          Start Blind Review <ChevronRight className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {readyForStrategyReviewSessions.map((session) => (
                    <div key={session.id} className="p-4 border border-orange-200 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-slate-900">
                          {formatSessionDisplayName(session)}
                        </h3>
                        <span className="text-sm text-slate-500">
                          Completed: {session.endTime?.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-700">
                          Blind Review Completed
                        </span>
                        <button
                          onClick={() => onResumeTestSession(session.id, 'strategy-review')}
                          className="py-1.5 px-3 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center"
                        >
                          Start Strategy Review <ChevronRight className="h-4 w-4 ml-1" />
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-slate-500 text-center py-4">No sessions ready for review.</p>
              )}
            </div>
          </div>

          {/* Archived Sessions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-6">Archived Sessions</h2>
            <div className="space-y-4">
              {archivedSessions.length > 0 ? (
                archivedSessions.map((session) => (
                  <div key={session.id} className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-slate-900">
                        {formatSessionDisplayName(session)}
                      </h3>
                      <span className="text-sm text-slate-500">
                        Archived: {session.endTime?.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-700">
                        Strategy Review Completed
                      </span>
                      <button
                        onClick={() => alert('Viewing archived session details (not implemented yet)')}
                        className="py-1.5 px-3 bg-slate-600 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors flex items-center"
                      >
                        View Details <Archive className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-4">No archived sessions.</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Performance Overview */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Performance Overview</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Circuit Quality</span>
                  <span className="text-sm font-medium text-slate-900">85%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-teal-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Analysis Depth</span>
                  <span className="text-sm font-medium text-slate-900">92%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-600">Consistency</span>
                  <span className="text-sm font-medium text-slate-900">78%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-orange-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard Preview */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Circuit Masters</h3>
              <Users className="h-5 w-5 text-slate-400" />
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-yellow-500 text-white text-xs font-bold rounded-full flex items-center justify-center mr-3">1</span>
                  <span className="font-medium text-slate-900">Sarah Chen</span>
                </div>
                <span className="text-sm text-slate-600">847 circuits</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-slate-400 text-white text-xs font-bold rounded-full flex items-center justify-center mr-3">2</span>
                  <span className="font-medium text-slate-900">Marcus Johnson</span>
                </div>
                <span className="text-sm text-slate-600">792 circuits</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center mr-3">3</span>
                  <span className="font-medium text-slate-900">Emily Rodriguez</span>
                </div>
                <span className="text-sm text-slate-600">738 circuits</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center">
                  <span className="w-6 h-6 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center mr-3">{user.stats.rank}</span>
                  <span className="font-medium text-slate-900">You</span>
                </div>
                <span className="text-sm text-slate-600">{user.stats.circuitsCreated} circuits</span>
              </div>
            </div>
            
            <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium">
              View Full Leaderboard
            </button>
          </div>

          {/* Study Streak */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Study Streak</h3>
              <Calendar className="h-5 w-5 text-slate-400" />
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">7</div>
              <div className="text-sm text-slate-600 mb-4">Days in a row</div>
              
              <div className="grid grid-cols-7 gap-1">
                {[...Array(7)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-8 w-8 rounded ${
                      i < 7 ? 'bg-orange-500' : 'bg-slate-200'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time Mode Selection Modal */}
      <TimeModeSelectionModal
        isOpen={isTimeModeModalOpen}
        onClose={() => setIsTimeModeModal(false)}
        onSelectTimeMode={handleTimeModeSelected}
        allProcessedTests={allProcessedTests} // Pass all processed test data
      />
    </div>
  );
};

export default Dashboard;
