// components/TripleReview/PausedOverlay.tsx
import React from 'react';
import { Play } from 'lucide-react';

interface PausedOverlayProps {
  onResume: () => void;
  onExit: () => void;
}

export const PausedOverlay: React.FC<PausedOverlayProps> = ({
  onResume,
  onExit
}) => {
  return (
    <div className="absolute inset-0 bg-slate-100 bg-opacity-95 flex flex-col items-center justify-center z-40 p-6">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">Test Paused</h2>
      <p className="text-lg text-slate-700 mb-8">Your test is currently paused. Choose an option:</p>
      <div className="flex space-x-4">
        <button
          onClick={onResume}
          className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors"
        >
          <Play className="h-6 w-6 inline mr-2" />
          Resume Test
        </button>
        <button
          onClick={onExit}
          className="px-8 py-4 bg-red-600 text-white rounded-xl font-semibold text-lg hover:bg-red-700 transition-colors"
        >
          Exit Testing Session
        </button>
      </div>
    </div>
  );
};