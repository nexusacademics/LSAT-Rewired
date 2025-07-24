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

export default function FloatingCircuitBuilderButton({ session }: FloatingCircuitBuilderButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const showButton = session.phase === 'blind-review' || session.phase === 'strategy-review';
  
  // Debug logging - remove this after testing
  console.log('FloatingCircuitBuilderButton render:', {
    phase: session.phase,
    showButton,
    completedPhases: session.completedPhases
  });

  if (!showButton) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Circuit Builder"
        className="fixed bottom-20 left-5 z-50 rounded-full bg-purple-600 hover:bg-purple-700 text-white p-4 shadow-lg transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Puzzle className="w-6 h-6" />}
      </button>
      {isOpen && (
        <div className="fixed bottom-24 left-5 z-50 w-80 max-w-full max-h-[70vh] bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 overflow-auto border border-gray-300 dark:border-gray-700">
          <CircuitBuilder session={session} />
        </div>
      )}
    </>
  );
}