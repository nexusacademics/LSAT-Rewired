import React, { icons, useState } from 'react';
import { Search, Calendar, Brain } from 'lucide-react';
import { User, TestSession, ProcessedPrepTest } from '../App';
import SearchResultsModal from './SearchResultsModal';
import WhatsNext from './WhatsNext';

import { GoogleGenerativeAI } from '@google/generative-ai';

// Import your new design system components
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Badge from '../components/ui/Badge';

interface DashboardProps {
  user: User;
  allProcessedTests: { [key: string]: ProcessedPrepTest };
  onNavigateToScheduleOptions?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  user,
  allProcessedTests,
  onNavigateToScheduleOptions
}) => {
  const { theme } = useTheme();
 
  //item search
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
  
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
    // TODO: navigate to Triple Review for this question
  };


const [errorMessage, setErrorMessage] = useState("");
  
  //Direct Search
 const handleDirectSearch = () => {


  // Assuming allProcessedTests is an object with test ids as keys
  const testsArray = Object.values(allProcessedTests);

  // Find the test by matching the number in the test name
  const selectedTest = testsArray.find(test => {
    const match = test.name?.match(/\d+/);
    return match && match[0] === directTest.trim();
  });

 if (!selectedTest) {
  setErrorMessage("PrepTest not found. Please check the test number and try again.");
  return;
}

  const sectionIndex = parseInt(directSection, 10) - 1;
  const questionIndex = parseInt(directQuestion, 10) - 1;

  const selectedSection = selectedTest.sections?.[sectionIndex];
  if (!selectedSection) {
     setErrorMessage("Section number not found. Please check the section number and try again.");
    return;
  }

  const selectedQuestion = selectedSection.questions?.[questionIndex];
  if (!selectedQuestion) {
    setErrorMessage("Question number not found. Please check the question number and try again.");
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

  const normalizedSearchTerm = searchTerm.toLowerCase().trim();
  const searchWords = normalizedSearchTerm.split(/\s+/).filter(Boolean);

  Object.values(allProcessedTests).forEach((test) => {
    test.sections.forEach((section, sectionIndex) => {
      section.questions.forEach((question, questionIndex) => {
        // Include metadata in search
        const combinedText = `
          ${test.name ?? ''}
          ${section.name ?? ''}
          ${question.passage ?? ''}
          ${question.question ?? ''}
          ${question.type ?? ''}
        `.toLowerCase();

        // Debug logs
        console.log('---');
        console.log('Test Name:', test.name);
        console.log('Section Name:', section.name);
        console.log('Question Stem:', question.question);
        console.log('Passage snippet:', (question.passage ?? '').slice(0, 100));
        console.log('Question Type:', question.type);
        console.log('Combined Text snippet:', combinedText.slice(0, 200));
        console.log('Search words:', searchWords);

        const isMatch = searchWords.every(word => combinedText.includes(word));
        console.log('Is Match:', isMatch);

        if (isMatch) {
          console.log('*** Match found! Question ID:', question.id);
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

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Left Column - What's Next */}
          <div className="space-y-4">
            <WhatsNext userId={user.id} onNavigateToScheduleOptions={onNavigateToScheduleOptions} />
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
                      <Search className="h-4 w-4 mr-2" />
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
                </button>
              </div>

              </Card>
             
            </Card>
          </div>
        </div>
       </div>
        </div>
       {/* Error Message for Direct Search */}
          <div>
          {errorMessage && (
        <ErrorModal 
          message={errorMessage} 
          onClose={() => setErrorMessage("")} 
        />
      )}
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
              searchTerm={searchTerm}
          />


      </div>
     
      </div>
  
  );
};

// Simple Error Modal Component
interface ErrorModalProps {
  message: string;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ message, onClose }) => {
  const { theme } = useTheme();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`max-w-md w-full mx-4 p-6 rounded-lg shadow-lg ${
        theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}>
        <h3 className="text-lg font-semibold mb-4">Search Error</h3>
        <p className="mb-6">{message}</p>
        <Button 
          variant="primary" 
          onClick={onClose}
          className="w-full"
        >
          OK
        </Button>
      </div>
    </div>
  );
};
export default Dashboard;