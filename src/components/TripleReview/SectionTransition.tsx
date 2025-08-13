import React from 'react';
import { TestSession } from '../../App';

interface SectionTransitionProps {
  session: TestSession;
  isLastSection: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  triggeredByTimer?: boolean;  // modal triggered by timer expiring
  onResetTimer?: () => void;   // callback to reset timer if needed
  isTimedSession?: boolean;
}

export const SectionTransition: React.FC<SectionTransitionProps> = ({
  session,
  isLastSection,
  onCancel,
  onConfirm,
  triggeredByTimer = false,
  onResetTimer,
}) => {
  const handleConfirm = () => {
    if (!triggeredByTimer && onResetTimer) {
      onResetTimer();
    }
    onConfirm();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
      onClick={triggeredByTimer ? undefined : onCancel} // disable click outside cancel if triggered by timer
      role="dialog"
      aria-modal="true"
      aria-labelledby="section-transition-title"
      aria-describedby="section-transition-desc"
    >
      <div
        className="bg-white rounded-2xl p-4 sm:p-8 max-w-md w-full mx-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          id="section-transition-title"
          className="text-2xl font-semibold text-slate-900 mb-4"
        >
          {isLastSection ? 'Test Complete!' : ``}
        </h3>
        <p id="section-transition-desc" className="text-slate-600 mb-6">
          {isLastSection ? (
            'You have completed all sections of this test.'
          ) : triggeredByTimer ? (
            <>
              Time is up for this section!
              <br /><br />
              <b>NOTE:</b> You will not be permitted to come back to this section once you move on.
            </>
          ) : (
            <>
              Are you ready to move on to the next section?
              <br /><br />
              <b>NOTE:</b> You will not be permitted to come back to this section once you move on.
            </>
          )}
        </p>

        <div className="flex space-x-3">
          {/* Show Continue Working button only if NOT triggered by timer */}
          {!triggeredByTimer && (
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Continue Working
            </button>
          )}

          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isLastSection
              ? 'Finish Test'
              : session.selectedSectionId
              ? 'Finish Section'
              : 'Next Section'}
          </button>
        </div>
      </div>
    </div>
  );
};
