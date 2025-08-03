// components/SearchResultsModal.tsx
import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { ProcessedQuestion } from '../types/user';

interface SearchResult {
  question: ProcessedQuestion;
  matchedText: string;
  matchContext: string;
  matchType: 'passage' | 'question_stem' | 'answer_choice' | 'explanation';
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  results: SearchResult[];
  onSelect: (question: ProcessedQuestion) => void;
}

const SearchResultsModal = ({ isOpen, onClose, results, onSelect }: Props) => {
  const [selectedQuestion, setSelectedQuestion] = useState<ProcessedQuestion | null>(null);
  
  const handleBackToResults = () => {
    setSelectedQuestion(null);
  };

  const handleClose = () => {
    setSelectedQuestion(null);
    onClose();
  };

  const handleQuestionClick = (result: SearchResult) => {
    setSelectedQuestion(result.question);
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
    
    const regex = new RegExp(`(${matchedText.replace(/[.*+?^${}()|[\]\\]/g, '\\const SearchResultsModal = ({ isOpen, onClose, results, onSelect }: Props) => {
  const [selectedQuestion, setSelectedQuestion] = useState<ProcessedQuestion | null>(null);
  
  const handleBackToResults = () => {
    setSelectedQuestion(null);
  };

  const handleClose = () => {
    setSelectedQuestion(null);
    onClose();
  };

  const handleQuestionClick = (question: ProcessedQuestion) => {
    setSelectedQuestion(question);
  };')})`, 'gi');
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
              {results.length === 0 ? (
                <p className="text-gray-500">No matches found.</p>
              ) : (
                <ul className="space-y-3">
                  {results.map((result, i) => (
                    <li 
                      key={i} 
                      className="border p-4 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors" 
                      onClick={() => handleQuestionClick(result)}
                    >
                      {/* Question Header */}
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-slate-600">
                          PrepTest {result.question.preptest}, Section {result.question.section}, Q{result.question.question}
                        </p>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          Match in {getMatchTypeLabel(result.matchType)}
                        </span>
                      </div>
                      
                      {/* Match Context */}
                      <div className="mb-3">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {highlightMatchedText(result.matchContext, result.matchedText)}
                        </p>
                      </div>
                      
                      {/* Question Preview */}
                      <div className="text-xs text-gray-500 border-t pt-2">
                        <strong>Question:</strong> {(result.question.question_stem || result.question.question || '').slice(0, 100)}
                        {((result.question.question_stem?.length || result.question.question?.length || 0) > 100) && '...'}
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
                    PrepTest {selectedQuestion.preptest}, Section {selectedQuestion.section}, Question {selectedQuestion.question}
                  </h3>
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
                    {selectedQuestion.question_stem || selectedQuestion.question}
                  </div>
                </div>

                {/* Answer Choices */}
                {selectedQuestion.answer_choices && selectedQuestion.answer_choices.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Answer Choices:</h4>
                    <div className="bg-gray-50 p-3 rounded">
                      {renderAnswerChoices(selectedQuestion.answer_choices)}
                    </div>
                  </div>
                )}

                {/* Correct Answer (if available) */}
                {selectedQuestion.correct_answer && (
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Correct Answer:</h4>
                    <div className="bg-green-50 p-2 rounded text-sm font-medium text-green-800">
                      {selectedQuestion.correct_answer}
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