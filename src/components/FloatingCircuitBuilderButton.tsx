// components/FloatingCircuitBuilderButton.tsx
import React, { useState } from 'react';
import { Puzzle, X } from 'lucide-react'; // Example icon, replace as needed
import CircuitBuilder from './CircuitBuilder';
import { TestSession } from '../App';

interface FloatingCircuitBuilderButtonProps {
  session: TestSession;
}

export default function FloatingCircuitBuilderButton({ session }: FloatingCircuitBuilderButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Show only during blind-review or strategy-review
  const showButton = session.phase === 'blind-review' || session.phase === 'strategy-review';

  if (!showButton) {
    return null;
  }

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Circuit Builder"
        className="fixed bottom-20 right-5 z-50 rounded-full bg-purple-600 hover:bg-purple-700 text-white p-4 shadow-lg transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <PuzzlePiece className="w-6 h-6" />}
      </button>

      {/* Floating panel overlay */}
      {isOpen && (
        <div className="fixed bottom-24 right-5 z-50 w-80 max-w-full max-h-[70vh] bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 overflow-auto border border-gray-300 dark:border-gray-700">
          <CircuitBuilder session={session} />
        </div>
      )}
    </>
  );
}
