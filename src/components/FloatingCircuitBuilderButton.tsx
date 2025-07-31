import React from 'react';
import { Puzzle, X, Target, CheckCircle } from 'lucide-react';
import { TestSession } from '../App';

interface FloatingCircuitBuilderButtonProps {
  session: TestSession;
  isOpen: boolean;
  onToggle: () => void;
  showIntroTooltip: boolean;
  onDismissIntroTooltip: () => void;
  showSuccessMessage: boolean;
  analysisQualityScore?: number;
}

export default function FloatingCircuitBuilderButton({
  session,
  isOpen,
  onToggle,
  showIntroTooltip,
  onDismissIntroTooltip,
  showSuccessMessage,
  analysisQualityScore
}: FloatingCircuitBuilderButtonProps) {
  const showButton = session.phase === 'blind-review' || session.phase === 'strategy-review';

  if (!showButton) return null;

  return (
    <div className="fixed bottom-52 left-5 z-50 flex flex-col items-start space-y-2">
     

      {/* The actual floating button */}
      <button
        onClick={() => {
          onToggle();
          if (showIntroTooltip) {
            onDismissIntroTooltip();
          }
        }}
        aria-label="Toggle Circuit Builder"
        className="rounded-full bg-purple-600 hover:bg-purple-700 text-white p-4 shadow-lg transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Puzzle className="w-6 h-6" />}
      </button>
    </div>
  );
}
