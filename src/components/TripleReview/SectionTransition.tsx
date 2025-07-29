// components/TripleReview/SectionTransition.tsx
import React from 'react';
import { TestSession } from '../../App';
import { AlertTriangle, Play, Home, X } from 'lucide-react';

interface SectionTransitionProps {
  session: TestSession;
  isLastSection: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  triggeredByTimer: boolean; // Add this new prop
}

export const SectionTransition: React.FC<SectionTransitionProps> = ({
  session,
  isLastSection,
  onCancel,
  onConfirm,
  triggeredByTimer
}) => {
  return (
   <div 
  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
  onClick={onCancel}
>
  <div 
    className="bg-white rounded-2xl shadow-lg max-w-md w-full mx-4 transform transition-all"
    onClick={(e) => e.stopPropagation()}
  >
    {/* Header */}
    <div className="flex items-center justify-between p-6 border-b border-slate-200">
      <h3 className="text-xl font-bold text-slate-900">
        {isLastSection ? 'Section Complete!' : `Section ${session.currentSectionIndex + 1} Complete!`}
      </h3>
      <button
        onClick={onCancel}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
      >
        <X className="w-4 h-4 text-slate-500" />
      </button>
    </div>

    {/* Content */}
    <div className="p-6">
      <p className="text-slate-700 text-center leading-relaxed mb-6">
        {isLastSection ? (
          'Once you click the Finish Test button, you will no longer be able to work on this session and will move on to the next phase of review.'
        ) : (
          <>
            Are you ready to move on to the next section?
            <br /><br />
            <span className="font-semibold text-red-600">NOTE:</span> You will not be permitted to come back to this section once you move on.
          </>
        )}
      </p>

      {/* Buttons */}
      <div className="flex flex-col gap-3">
         {!triggeredByTimer && (
            <button
                  onClick={onCancel}
                  className="w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  Continue Working
                </button>
                <button
                  onClick={onConfirm}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
                >
                  {isLastSection
                    ? 'Finish Test'
                    : session.selectedSectionId
                      ? 'Finish Section'
                      : 'Next Section'}
                </button>
      )}
      </div>
    </div>
  </div>
</div>
  );
};