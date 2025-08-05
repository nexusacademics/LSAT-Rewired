// components/SearchResultsModal.tsx
import React, { useState, useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { ProcessedQuestion, SearchResultsModalProps } from '../types/dashboard.types';

const SearchResultsModal: React.FC<SearchResultsModalProps> = ({ 
  isOpen, 
  onClose, 
  results, 
  onSelect,
  selectedQuestion = null,
  disableBackToResults = false, 

}) => {
  const [selectedQuestionState, setSelectedQuestionState] = useState<ProcessedQuestion | null>(selectedQuestion);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  useEffect(() => {
  setSelectedQuestionState(selectedQuestion);
  setShowCorrectAnswer(false);
}, [isOpen, selectedQuestion]);

  const handleBackToResults = () => {
    setSelectedQuestionState(null);
    setShowCorrectAnswer(false); // Reset when going back
  };

  const handleClose = () => {
    setSelectedQuestionState(null);
    setShowCorrectAnswer(false); // Reset when closing
    onClose();
  };

  const handleQuestionClick = (result: ProcessedQuestion) => {
    setSelectedQuestionState(result);
    setShowCorrectAnswer(false); // Reset when selecting new question
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
    
    // Match patterns like "PrepTest 1", "PrepTest 85", "PT 1", etc.
    const match = testName.match(/(?:PrepTest|PT)\s*(\d+)/i);
    return match ? match[1] : null;
  };

  // Helper function to get test name/number - use processed data fields
  const getTestInfo = (question: ProcessedQuestion) => {
    // Processed data has test_name field
    if (question.test_name) {
      return {
        name: question.test_name,
        number: extractPrepTestNumber(question.test_name)
      };
    }
    
    // Fallback to other possible field names
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

  // Helper function to get section order - use processed data fields
  const getSectionOrder = (question: ProcessedQuestion) => {
    // Processed data has section_order field
    return question.section_order ?? question.sectionOrder ?? null;
  };

  // Helper function to get section type - use processed data fields
  const getSectionType = (question: ProcessedQuestion) => {
    // Use the type field from processed data
    return question.type || question.question_type || question.section_type || 'Unknown';
  };

  // Helper function to get question order - use processed data fields
  const getQuestionOrder = (question: ProcessedQuestion) => {
    // Processed data has question_order field
    return question.question_order ?? question.questionOrder ?? question.order ?? null;
  };

  // Helper function to get question text - use processed data fields
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
    
    // Test number
    if (testInfo.number) {
      parts.push(`PrepTest ${testInfo.number}`);
    } else {
      parts.push('Unknown Test');
    }
    
    // Section number
    if (sectionOrder !== null && sectionOrder !== undefined) {
      parts.push(`Section ${sectionOrder}`);
    } else {
      parts.push('Section ?');
    }
    
    // Question number
    if (questionOrder !== null && questionOrder !== undefined) {
      parts.push(`Q${questionOrder}`);
    } else {
      parts.push('Q?');
    }
    
    return parts.join(', ');
  };


  console.log('disableBackToResults in modal:', disableBackToResults);

  
  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-4xl shadow-xl overflow-y-auto max-h-[90vh]">
          {!selectedQuestionState ? (
            // Search Results List View
            <>
              <Dialog.Title className="text-xl font-bold mb-4">Search Results</Dialog.Title>
              
              {results.length === 0 ? (
                <p className="text-gray-500">No matches found.</p>
              ) : (
                <ul className="space-y-3">
                  {results.map((question, i) => (
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
            // Question Detail View
            <>
              <div className="flex items-center justify-between mb-4">
               {!disableBackToResults && (
                 <>
  <p>disableBackToResults: {String(disableBackToResults)}</p>

  <button
    onClick={handleBackToResults}
    className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
  >
    ← Back to Results
  </button>
</>
                )}
               
              </div>

              <div className="space-y-4">
                {/* Header */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <h3 className="font-bold text-lg">
                    {formatQuestionInfo(selectedQuestionState)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Type: {getSectionType(selectedQuestionState)} • ID: {selectedQuestionState.id}
                  </p>
                </div>

                {/* Passage/Stimulus */}
                {selectedQuestionState.passage && (
                  <div className="border-l-4 border-blue-200 pl-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Passage:</h4>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 p-3 rounded">
                      {selectedQuestionState.passage}
                    </div>
                  </div>
                )}

                {/* Question Stem */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Question:</h4>
                  <div className="text-sm leading-relaxed bg-blue-50 p-3 rounded">
                    {getQuestionText(selectedQuestionState)}
                  </div>
                </div>

                {/* Answer Choices */}
                {selectedQuestionState.options && selectedQuestionState.options.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Answer Options:</h4>
                    <div className="bg-gray-50 p-3 rounded">
                      {renderAnswerChoices(selectedQuestionState.options)}
                    </div>
                  </div>
                )}

                {/* Correct Answer - Hidden by default */}
                {getCorrectAnswerLetter(selectedQuestionState) && (
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
                        {getCorrectAnswerLetter(selectedQuestionState)}
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