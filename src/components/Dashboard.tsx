// components/SearchResultsModal.tsx
import React, { useState, useMemo } from 'react';
import { Dialog } from '@headlessui/react';
import { ProcessedQuestion, SearchResultsModalProps } from '../types/dashboard.types';

const SearchResultsModal: React.FC<SearchResultsModalProps> = ({ 
  isOpen = false, 
  onClose, 
  results = [], 
  onSelect 
}) => {
  const [selectedQuestion, setSelectedQuestion] = useState<ProcessedQuestion | null>(null);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  
  // Search state
  const [searchFilters, setSearchFilters] = useState({
    testNumber: '',
    sectionNumber: '',
    questionNumber: '',
    sectionType: '',
    textSearch: ''
  });
  
  const handleBackToResults = () => {
    setSelectedQuestion(null);
    setShowCorrectAnswer(false);
  };

  const handleClose = () => {
    setSelectedQuestion(null);
    setShowCorrectAnswer(false);
    onClose();
  };

  const handleQuestionClick = (result: ProcessedQuestion) => {
    setSelectedQuestion(result);
    setShowCorrectAnswer(false);
  };

  const clearFilters = () => {
    setSearchFilters({
      testNumber: '',
      sectionNumber: '',
      questionNumber: '',
      sectionType: '',
      textSearch: ''
    });
  };

  const renderAnswerChoices = (choices: string[]) => {
    const labels = ['A', 'B', 'C', 'D', 'E'];
    return choices.map((choice, index) => (
      <div key={index} className="flex items-start gap-2 mb-2">
        <span className="font-medium text-sm mt-0.5 min-w-[20px]">({labels[index]})</span>
        <span className="text-sm">{choice}</span>
      </div>
    ));
  };

  // Helper function to extract PrepTest number from test name
  const extractPrepTestNumber = (testName: string | null | undefined) => {
    if (!testName) return null;
    
    const match = testName.match(/(?:PrepTest|PT)\s*(\d+)/i);
    return match ? match[1] : null;
  };

  // Helper function to get test name/number
  const getTestInfo = (question: ProcessedQuestion) => {
    if (question.test_name) {
      return {
        name: question.test_name,
        number: extractPrepTestNumber(question.test_name)
      };
    }
    
    if (question.testName) {
      return {
        name: question.testName,
        number: extractPrepTestNumber(question.testName)
      };
    }
    
    return {
      name: null,
      number: null
    };
  };

  // Helper function to get section order
  const getSectionOrder = (question: ProcessedQuestion) => {
    return question.section_order ?? question.sectionOrder ?? null;
  };

  // Helper function to get section type
  const getSectionType = (question: ProcessedQuestion) => {
    return question.type || question.question_type || question.section_type || 'Unknown';
  };

  // Helper function to get question order
  const getQuestionOrder = (question: ProcessedQuestion) => {
    return question.question_order ?? question.questionOrder ?? question.order ?? null;
  };

  // Helper function to get question text
  const getQuestionText = (question: ProcessedQuestion) => {
    return question.question || question.question_stem || '';
  };

  // Helper function to get correct answer as letter
  const getCorrectAnswerLetter = (question: ProcessedQuestion) => {
    const answerIndex = question.correctAnswer ?? question.correct_answer_index ?? null;
    if (answerIndex === null || answerIndex === undefined) return null;
    return ['A', 'B', 'C', 'D', 'E'][answerIndex] || null;
  };

  // Helper function to format the complete question identifier
  const formatQuestionInfo = (question: ProcessedQuestion) => {
    const testInfo = getTestInfo(question);
    const sectionOrder = getSectionOrder(question);
    const questionOrder = getQuestionOrder(question);
    
    const parts = [];
    
    if (testInfo.number) {
      parts.push(`PrepTest ${testInfo.number}`);
    } else {
      parts.push('Unknown Test');
    }
    
    if (sectionOrder !== null && sectionOrder !== undefined) {
      parts.push(`Section ${sectionOrder}`);
    } else {
      parts.push('Section ?');
    }
    
    if (questionOrder !== null && questionOrder !== undefined) {
      parts.push(`Q${questionOrder}`);
    } else {
      parts.push('Q?');
    }
    
    return parts.join(', ');
  };

  // Get unique section types for filter dropdown
  const uniqueSectionTypes = useMemo(() => {
    if (!results || !Array.isArray(results) || results.length === 0) return [];
    try {
      const types = new Set(results.map(q => getSectionType(q)));
      return Array.from(types).sort();
    } catch (error) {
      console.error('Error getting unique section types:', error);
      return [];
    }
  }, [results]);

  // Filter results based on search criteria
  const filteredResults = useMemo(() => {
    if (!results || !Array.isArray(results) || results.length === 0) return [];
    try {
      return results.filter(question => {
      const testInfo = getTestInfo(question);
      const sectionOrder = getSectionOrder(question);
      const questionOrder = getQuestionOrder(question);
      const sectionType = getSectionType(question);
      const questionText = getQuestionText(question);
      
      // Test number filter
      if (searchFilters.testNumber && testInfo.number !== searchFilters.testNumber) {
        return false;
      }
      
      // Section number filter
      if (searchFilters.sectionNumber && sectionOrder?.toString() !== searchFilters.sectionNumber) {
        return false;
      }
      
      // Question number filter
      if (searchFilters.questionNumber && questionOrder?.toString() !== searchFilters.questionNumber) {
        return false;
      }
      
      // Section type filter
      if (searchFilters.sectionType && sectionType !== searchFilters.sectionType) {
        return false;
      }
      
      // Text search filter
      if (searchFilters.textSearch) {
        const searchTerm = searchFilters.textSearch.toLowerCase();
        const searchableText = [
          questionText,
          question.passage || '',
          ...(question.options || [])
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }
      
      return true;
    });
    } catch (error) {
      console.error('Error filtering results:', error);
      return [];
    }
  }, [results, searchFilters]);

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-5xl shadow-xl overflow-y-auto max-h-[90vh]">
          {!selectedQuestion ? (
            // Search Results List View
            <>
              <Dialog.Title className="text-xl font-bold mb-6">Search Results</Dialog.Title>
              
              {/* Search Filters */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6 space-y-4">
                <h3 className="font-semibold text-gray-700 mb-3">Filter Results</h3>
                
                {/* First row of filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Test Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 85"
                      value={searchFilters.testNumber}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, testNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Section Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 1"
                      value={searchFilters.sectionNumber}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, sectionNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Question Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 15"
                      value={searchFilters.questionNumber}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, questionNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Section Type
                    </label>
                    <select
                      value={searchFilters.sectionType}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, sectionType: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Types</option>
                      {uniqueSectionTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Second row - Text search */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Search Text (question, passage, or answer choices)
                    </label>
                    <input
                      type="text"
                      placeholder="Enter keywords to search within questions..."
                      value={searchFilters.textSearch}
                      onChange={(e) => setSearchFilters(prev => ({ ...prev, textSearch: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <button
                      onClick={clearFilters}
                      className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
                
                {/* Results count */}
                <div className="text-sm text-gray-600">
                  Showing {filteredResults.length} of {results.length} questions
                </div>
              </div>
              
              {/* Results List */}
              {results.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">No questions found.</p>
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-2">No questions match your search criteria.</p>
                  <button
                    onClick={clearFilters}
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    Clear all filters
                  </button>
                </div>
              ) : (
                <ul className="space-y-3">
                  {filteredResults.map((question, i) => (
                    <li 
                      key={question.id || i} 
                      className="border p-4 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors" 
                      onClick={() => handleQuestionClick(question)}
                    >
                      {/* Question Header */}
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-600">
                          {formatQuestionInfo(question)}
                        </p>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                          {getSectionType(question)}
                        </span>
                      </div>
                      
                      {/* Question Content Preview */}
                      <div className="space-y-2">
                        {/* Passage Preview */}
                        {question.passage && (
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">Passage:</p>
                            <p className="text-sm text-gray-700 leading-relaxed bg-blue-50 p-2 rounded">
                              {question.passage.slice(0, 200)}
                              {question.passage.length > 200 && '...'}
                            </p>
                          </div>
                        )}
                        
                        {/* Question Preview */}
                        {getQuestionText(question) && (
                          <div>
                            <p className="text-xs font-medium text-gray-600 mb-1">Question:</p>
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {getQuestionText(question).slice(0, 150)}
                              {getQuestionText(question).length > 150 && '...'}
                            </p>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            // Question Detail View (unchanged)
            <>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handleBackToResults}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                >
                  ← Back to Results
                </button>
                <button
                  onClick={() => onSelect(selectedQuestion)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Select Question
                </button>
              </div>

              <div className="space-y-4">
                {/* Header */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="font-bold text-lg">
                    {formatQuestionInfo(selectedQuestion)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Type: {getSectionType(selectedQuestion)} • ID: {selectedQuestion.id}
                  </p>
                </div>

                {/* Passage/Stimulus */}
                {selectedQuestion.passage && (
                  <div className="border-l-4 border-blue-200 pl-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Passage:</h4>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 p-3 rounded">
                      {selectedQuestion.passage}
                    </div>
                  </div>
                )}

                {/* Question Stem */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Question:</h4>
                  <div className="text-sm leading-relaxed bg-blue-50 p-3 rounded">
                    {getQuestionText(selectedQuestion)}
                  </div>
                </div>

                {/* Answer Choices */}
                {selectedQuestion.options && selectedQuestion.options.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Answer Options:</h4>
                    <div className="bg-gray-50 p-3 rounded">
                      {renderAnswerChoices(selectedQuestion.options)}
                    </div>
                  </div>
                )}

                {/* Correct Answer - Hidden by default */}
                {getCorrectAnswerLetter(selectedQuestion) && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-700">Correct Answer:</h4>
                      <button
                        onClick={() => setShowCorrectAnswer(!showCorrectAnswer)}
                        className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                          showCorrectAnswer 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {showCorrectAnswer ? 'Hide Answer' : 'Reveal Answer'}
                      </button>
                    </div>
                    {showCorrectAnswer && (
                      <div className="bg-green-50 p-2 rounded text-sm font-medium text-green-800 border border-green-200">
                        {getCorrectAnswerLetter(selectedQuestion)}
                      </div>
                    )}
                    {!showCorrectAnswer && (
                      <div className="bg-gray-100 p-2 rounded text-sm text-gray-500 border border-gray-200">
                        Click "Reveal Answer" to see the correct answer
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default SearchResultsModal;