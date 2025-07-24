// FloatingCircuitBuilderButton.tsx
import React from 'react';
import { Puzzle } from 'lucide-react';
import { TestSession, Circuit, ProcessedQuestion } from '../App';

interface FloatingCircuitBuilderButtonProps {
  session: TestSession;
  onOpenCircuitBuilder: () => void;
}

export default function FloatingCircuitBuilderButton({
  session,
  onOpenCircuitBuilder
}: FloatingCircuitBuilderButtonProps) {
  const showButton = session.phase === 'blind-review' || session.phase === 'strategy-review';

  if (!showButton) return null;

  return (
    <button
      onClick={onOpenCircuitBuilder}
      aria-label="Open Circuit Builder"
      className="fixed bottom-32 right-5 z-50 rounded-full bg-purple-600 hover:bg-purple-700 text-white p-4 shadow-lg transition-colors"
    >
      <Puzzle className="w-6 h-6" />
    </button>
  );
}
