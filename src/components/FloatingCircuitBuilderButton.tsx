import React from 'react';
import { Puzzle, X } from 'lucide-react';
import { TestSession } from '../App';

interface FloatingCircuitBuilderButtonProps {
  session: TestSession;
  isOpen: boolean;
  onToggle: () => void;
}

export default function FloatingCircuitBuilderButton({
  session,
  isOpen,
  onToggle
}: FloatingCircuitBuilderButtonProps) {
  const showButton = session.phase === 'blind-review' || session.phase === 'strategy-review';

  if (!showButton) return null;

  return (
    <button
      onClick={onToggle}
      aria-label="Toggle Circuit Builder"
      className="fixed bottom-32 right-5 z-50 rounded-full bg-purple-600 hover:bg-purple-700 text-white p-4 shadow-lg transition-colors"
    >
      {isOpen ? <X className="w-6 h-6" /> : <Puzzle className="w-6 h-6" />}
    </button>
  );
}
