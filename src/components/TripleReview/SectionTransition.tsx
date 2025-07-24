// components/TripleReview/SectionTransition.tsx
import React from 'react';
import { TestSession } from '../../App';

interface SectionTransitionProps {
  session: TestSession;
  isLastSection: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const SectionTransition: React.FC<SectionTransitionProps> = ({
  session,
  isLastSection,
  onCancel,
  onConfirm
}) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" 
      onClick={onCancel}
    >
      <div 
        className="bg-white rounded-2xl p-4 sm:p-8 max-w-md w-full mx-4 text-center" 
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-semibold text-slate-900 mb-4">
          {isLastSection ? 'Test Complete!' : `Section ${session.currentSectionIndex + 1} Complete!`}
        </h3>
        <p className="text-slate-600 mb-6">
          {isLastSection
            ? 'You have completed all sections of this test.'
            : `You have completed Section ${session.currentSectionIndex + 1}. Are you ready to move on to the next section? <br/> (You will not be permitted to come back to this section once you move on.)`
          }
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            Continue Working
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isLastSection ? 'Finish Test' : (session.selectedSectionId ? 'Finish Section' : 'Next Section')}
          </button>
        </div>
      </div>
    </div>
  );
};