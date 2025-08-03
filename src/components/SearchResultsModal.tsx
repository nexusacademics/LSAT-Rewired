// components/SearchResultsModal.tsx
import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';

// Enhanced question type with metadata from joined tables
interface EnhancedQuestion {
  id: string;
  passage: string;
  question: string;
  options: string[];
  correctAnswer: string;
  type: string;
  // Metadata from joined tables
  test_name?: string;           // from tests.name
  section_type?: string;        // from sections.section_type
  section_order?: number;       // from sections.section_order
  question_order?: number;      // from questions.question_order
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  results: EnhancedQuestion[];
  onSelect: (question: EnhancedQuestion) => void;
}

const SearchResultsModal = ({ isOpen, onClose, results, onSelect }: Props) => {
  const [selectedQuestion, setSelectedQuestion] = useState<EnhancedQuestion | null>(null);
  
  const handleBackToResults = () => {
    setSelectedQuestion(null);
  };

  const handleClose = () => {
    setSelectedQuestion(null);
    onClose();
  };

  const handleQuestionClick = (result: EnhancedQuestion) => {
    setSelectedQuestion(result);
  };

  const getMatchTypeLabel = (type: string) => {
    switch (type) {
      case 'passage': return 'Passage';
      case 'question_stem': return 'Question';
      case 'answer_choice': return 'Answer Choice';
      case 'explanation': return 'Explanation';
      default: return 'Content';
    }
  };

  const highlightMatchedText = (text: string, matchedText: string) => {
    if (!matchedText) return text;
    
    const regex = new RegExp(`(${matchedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">{part}</mark>
      ) : part
    );
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

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl p-6 w-full max-w-4xl shadow-xl overflow-y-auto max-h-[90vh]">
          {!selectedQuestion ? (
            // Search Results List View
            <>
              <Dialog.Title className="text-xl font-bold mb-4">Search Results</Dialog.Title>
              
              <Dialog.Title className="text-xl font-bold mb-4">Search Results</Dialog.Title>
              
              {results.length === 0 ? (
                <p className="text-gray-500">No matches found.</p>
              ) : (
                <ul className="space-y-3">
                  {results.map((result, i) => {
                    // Since results are direct question objects, not SearchResult wrappers
                    const question = result;
                    
                    return (
                      <li 
                        key={question.id || i} 
                        className="border p-4 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors" 
                        onClick={() => handleQuestionClick(result)}
                      >
                        {/* Question Header */}
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-slate-600">
                            {question.test_name ? `PrepTest ${question.test_name}` : 'Unknown Test'}, 
                            {question.section_type && question.section_order ? ` Section ${question.section_order} (${question.section_type})` : ' Unknown Section'}, 
                            {question.question_order ? ` Q${question.question_order}` : ' Q?'}
                          </p>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                            {question.type || 'Question'}
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
                          {question.question && (
                            <div>
                              <p className="text-xs font-medium text-gray-600 mb-1">Question:</p>
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {question.question.slice(0, 150)}
                                {question.question.length > 150 && '...'}
                              </p>
                            </div>
                          )}
                          
                          {/* Answer Options Indicator */}
                          {question.options && question.options.length > 0 && (
                            <p className="text-xs text-gray-500">
                              {question.options.length} answer options available
                              {question.correctAnswer && ` • Correct: ${question.correctAnswer}`}
                            </p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          ) : (
            // Question Detail View
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
                    {selectedQuestion.test_name ? `PrepTest ${selectedQuestion.test_name}` : 'Unknown Test'}, 
                    {selectedQuestion.section_type && selectedQuestion.section_order ? ` Section ${selectedQuestion.section_order} (${selectedQuestion.section_type})` : ' Unknown Section'}, 
                    {selectedQuestion.question_order ? ` Question ${selectedQuestion.question_order}` : ' Question ?'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedQuestion.type && `Type: ${selectedQuestion.type} • `}
                    ID: {selectedQuestion.id}
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
                    {selectedQuestion.question}
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

                {/* Correct Answer */}
                {selectedQuestion.correctAnswer && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Correct Answer:</h4>
                    <div className="bg-green-50 p-2 rounded text-sm font-medium text-green-800">
                      {selectedQuestion.correctAnswer}
                    </div>
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