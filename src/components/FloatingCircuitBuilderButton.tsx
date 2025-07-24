import React, { useState } from 'react';
import { Puzzle, X } from 'lucide-react';
import CircuitBuilder from './CircuitBuilder';
import { TestSession, Circuit, ProcessedQuestion } from '../App';

interface FloatingCircuitBuilderButtonProps {
  session: TestSession;
  onSaveCircuit?: (circuit: Circuit) => void;
  currentQuestionData?: ProcessedQuestion;
  existingCircuit?: Circuit;
}

export default function FloatingCircuitBuilderButton({ 
  session, 
  onSaveCircuit, 
  currentQuestionData, 
  existingCircuit 
}: FloatingCircuitBuilderButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const showButton = session.phase === 'blind-review' || session.phase === 'strategy-review';
  
  // Debug logging - remove this after testing
  console.log('FloatingCircuitBuilderButton render:', {
    phase: session.phase,
    showButton,
    completedPhases: session.completedPhases,
    hasQuestionData: !!currentQuestionData
  });

  if (!showButton) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Circuit Builder"
        className="fixed bottom-32 right-5 z-50 rounded-full bg-purple-600 hover:bg-purple-700 text-white p-4 shadow-lg transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Puzzle className="w-6 h-6" />}
      </button>
      {isOpen && currentQuestionData && (
        <div className="fixed inset-y-0 right-0 z-40 bg-white dark:bg-gray-800 shadow-xl border-l border-gray-300 dark:border-gray-700" style={{ width: 'calc(66.666667% + 1.5rem)' }}>
          <CircuitBuilder
            onBack={() => setIsOpen(false)}
            onSaveCircuit={onSaveCircuit || (() => {})}
            questionData={currentQuestionData}
            session={session}
            existingCircuit={existingCircuit}
          />
        </div>
      )}
    </>
  );
}