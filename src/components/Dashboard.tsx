import React, { icons, useState } from 'react';
import { Search, Drill, BookOpen, Play, TrendingUp, Calendar, Upload, Download, Users, Brain, Target, Archive, ChevronRight, Zap, Award, Activity } from 'lucide-react';
import { User, TestSession, ProcessedPrepTest } from '../App';
import TimeModeSelectionModal from './TimeModeSelectionModal';

//import search functions
import { parseSearchQuery } from '../utils/parseSearchQuery';
import Fuse from 'fuse.js';

import { supabase } from '../lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';
import SearchResultsModal from './SearchResultsModal';

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
 
  //item search
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  
  const [searchResults, setSearchResults] = useState<ProcessedQuestion[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [directTest, setDirectTest] = useState('');
  const [directSection, setDirectSection] = useState('');
  const [directQuestion, setDirectQuestion] = useState('');
  const [directSearchMode, setDirectSearchMode] = useState(false);

  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [modalSelectedQuestion, setModalSelectedQuestion] = useState<ProcessedQuestion | null>(null);

   // Dynamic background based on theme
  const backgroundClasses = theme === 'dark' 
    ? 'bg-gray-900' 
    : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100';
  
  const handleSelect = (question: ProcessedQuestion) => {
    setSearchModalOpen(false);
    // navigate or trigger TripleReview for this question
    setCurrentSession({
      preptest: question.preptest,
      section: question.section,
      questionIndex: question.index, // if you store index
    });
  };

  
  //Direct Search
 const handleDirectSearch = () => {
  if (!directTest || !directSection || !directQuestion) {
    alert("Please fill all search fields.");
    return;
  }

  // Assuming allProcessedTests is an object with test ids as keys
  const testsArray = Object.values(allProcessedTests);

  // Find the test by matching the number in the test name
  const selectedTest = testsArray.find(test => {
    const match = test.name?.match(/\d+/);
    return match && match[0] === directTest.trim();
  });

  if (!selectedTest) {
    alert("PrepTest not found.");
    return;
  }

  const sectionIndex = parseInt(directSection, 10) - 1;
  const questionIndex = parseInt(directQuestion, 10) - 1;

  const selectedSection = selectedTest.sections?.[sectionIndex];
  if (!selectedSection) {
    alert("Section not found.");
    return;
  }

  const selectedQuestion = selectedSection.questions?.[questionIndex];
  if (!selectedQuestion) {
    alert("Question not found.");
    return;
  }

  // Construct a question object with necessary fields for SearchResultsModal
  const questionForModal: ProcessedQuestion = {
    ...selectedQuestion,
    test_name: selectedTest.name,
    section_order: sectionIndex + 1,
    question_order: questionIndex + 1,
  };

setModalSelectedQuestion(questionForModal);  // NEW: sets the question to show on modal open
setSearchResults([questionForModal]);
setSearchModalOpen(true);
setDirectSearchMode(true);  // optional local state flag
};


//Fuzzy Logic Search
const handleSearch = () => {
  const results: ProcessedQuestion[] = [];

  Object.values(allProcessedTests).forEach((test) => {
    test.sections.forEach((section, sectionIndex) => {
      section.questions.forEach((question, questionIndex) => {
        const stem = question.question ?? '';
const combinedText = `
  ${test.name ?? ''}
  ${section.name ?? ''}
  ${question.passage ?? ''}
  ${stem}
  ${question.type ?? ''}
`.toLowerCase();

const normalizedSearchTerm = searchTerm.toLowerCase().trim();
const searchWords = normalizedSearchTerm.split(/\s+/).filter(Boolean);

console.log('---');
console.log('Test Name:', test.name);
console.log('Section Name:', section.name);
console.log('Question Stem:', stem);
console.log('Passage snippet:', (question.passage ?? '').slice(0, 100)); // first 100 chars
console.log('Question Type:', question.type);
console.log('Combined Text snippet:', combinedText.slice(0, 200));
console.log('Search words:', searchWords);

const isMatch = searchWords.every(word => combinedText.includes(word));
console.log('Is Match:', isMatch);

if (isMatch) {
  console.log('*** Match found! Question ID:', question.id);
  // your push to results here
}// Include metadata in search
        const combinedText = `
          ${test.name ?? ''}
          ${section.name ?? ''}
          ${question.passage ?? ''}
          ${question.question ?? ''}
          ${question.type ?? ''}
        `.toLowerCase();

          // Add debug logs here - inside the scope where combinedText exists
      console.log("Search term:", searchTerm.toLowerCase());
      console.log("Combined text sample:", combinedText);
        
        if (combinedText.includes(searchTerm.toLowerCase())) {
          const enhancedQuestion = {
            ...question,
            test_name: test.name,
            test_id: test.id,
            section_name: section.name,
            section_id: section.id,
            section_order: sectionIndex + 1,
            question_order: questionIndex + 1,
            section_type: section.name?.startsWith('LR') ? 'LR' :
                          section.name?.startsWith('RC') ? 'RC' :
                          section.id?.startsWith('LR') ? 'LR' :
                          section.id?.startsWith('RC') ? 'RC' : 'Unknown'
          };
          results.push(enhancedQuestion);
        }
      });
    });
  });

  setSearchResults(results);
  setSearchModalOpen(true);
};
  
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


  return (
    <div className={`min-h-screen w-full transition-all duration-500 ${backgroundClasses}`}>
      <div className="w-full pt-10 px-4 pb-4">
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
                      Tests and Sections
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Select a an Official LSAC PrepTest and configure your session.
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
           {/* Center Column - Drill Section */}
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
                      Stim Drill
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Practice Logical Reasoning Stimulus Analysis.
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 shadow-inner' : 'bg-gray-100'}`}>
                    <Drill className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
                
                <Button 
                  size="default" 
                  className="w-full"
                  onClick={handleStartNewSessionClick}
                >
                  <Play className="h-4 w-4 mr-2" />
                 Start New Stim Drill
                </Button>
              </Card>
            </Card>

            {/* Active Drills */}
           <div className="space-y-2"><DrillSection
                title="Active Drills"
                icon={<Activity className="h-4 w-4 text-orange-500" />}
                count={0} // Replace with actual active drill count if available
                emptyMessage="No active drills. Start a new drill above!"
                emptyIcon="🎯"
                theme={theme}
              />
            <DrillSection
                title="Archived Drills"
                icon={<Archive className="h-4 w-4 text-gray-500" />}
                count={0} // Replace with actual archived drill count if available
                emptyMessage="No archived drills yet."
                emptyIcon="📦"
                theme={theme}
              />
          </div>
             </div>
          
          {/* Right Column - Item Search */}
          <div className="space-y-4">
            <Card padding="default" hover>
              <CardHeader className="pb-3">
                <CardTitle icon={<Search className="h-5 w-5 text-yellow-500" />}>
                  Item Search
                </CardTitle>
              </CardHeader>
              <Card variant="accent" padding="sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className={`text-lg font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      Find a Question or Passage from an official LSAC PrepTest 
                    </h3>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Use the Preptest, Section, and Question numbers in the boxes below
                    </p>
                  </div>
                </div>
              {/* Direct search inputs */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <input
                    type="number"
                    placeholder="PT #"
                    value={directTest}
                    onChange={(e) => setDirectTest(e.target.value)}
                    className={`w-full px-3 py-2 rounded-md no-spinner border ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <input
                    type="number"
                    placeholder="S #"
                    value={directSection}
                    onChange={(e) => setDirectSection(e.target.value)}
                    className={`w-full px-3 py-2 rounded-md no-spinner border ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <input
                    type="number"
                    placeholder="Q #"
                    value={directQuestion}
                    onChange={(e) => setDirectQuestion(e.target.value)}
                    className={`w-full px-3 py-2 rounded-md no-spinner border ${
                      theme === 'dark'
                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <Button
                       size="default" 
                       className="w-full"
                       onClick={handleDirectSearch}
                        disabled={
                                !directTest.trim() || !directSection.trim() || !directQuestion.trim()
                      } >
                      Submit
                    </Button>
                </div>

          

              {/* Keyword fallback input */}
              <div className="relative">
                 <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      Or, use Keywords in the textbox below, for example:
                      <br/> <br/>
                     "Han Purple"<br/>"Reading Comp Passage about mirrors"
                    </p>
                <br/>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                  placeholder="Enter keywords or phrase..."
                  className={`w-full px-4 py-3 pr-12 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    theme === 'dark'
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 hover:border-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 hover:border-gray-400'
                  }`}
                />
                 
                <button
                  onClick={handleSearch}
                  disabled={
                    !searchTerm?.trim() &&
                    !directTest?.trim() &&
                    !directSection?.trim() &&
                    !directQuestion?.trim()
                  }
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md transition-all duration-200 ${
                    theme === 'dark'
                      ? 'text-blue-400 hover:text-blue-300 hover:bg-gray-700 active:bg-gray-600'
                      : 'text-blue-500 hover:text-blue-600 hover:bg-gray-100 active:bg-gray-200'
                  }`}
                  aria-label="Search"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>

              </Card>
             
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
      <div>
        {/*Search Results Modal */}
        <SearchResultsModal
            isOpen={searchModalOpen}
            onClose={() => {
              setSearchModalOpen(false);
              setModalSelectedQuestion(null);
              setSearchResults([]);
              setDirectSearchMode(false);
            }}
            results={searchResults}
            initialSelectedQuestion={modalSelectedQuestion}  // pass initialSelectedQuestion, NOT selectedQuestion
            onSelect={(question) => {
              setSearchModalOpen(false);
              setModalSelectedQuestion(null);
              setSearchResults([]);
              handleSelect(question);
            }}
            disableBackToResults={directSearchMode}  // <-- pass this prop here
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
          {/* Replace with actual drill list logic when available */}
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

export default Dashboard;