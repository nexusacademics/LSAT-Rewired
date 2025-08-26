import React from 'react';
import { TestSession } from '../../App';

interface SectionTransitionProps {
  session: TestSession;
  isLastSection: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  triggeredByTimer?: boolean;  // modal triggered by timer expiring
  onResetTimer?: () => void;
  isTimedSession?: boolean;
   isCompleteTest?: boolean; // ADD THIS LINE
}

export const SectionTransition: React.FC<SectionTransitionProps> = ({
  session,
  isLastSection,
  onCancel,
  onConfirm,
  triggeredByTimer = false,
  onResetTimer,
   isCompleteTest, // ADD THIS LINE
}) => {
  const currentSectionNumber = session.currentSectionIndex + 1;

  const handleConfirm = () => {
    if (!triggeredByTimer && onResetTimer) {
      onResetTimer();
    }
    onConfirm();
  };

   const renderMessage = () => {
    // Case 1: Single section test (when isCompleteTest is false, meaning session.selectedSectionId is defined)
    if (!isCompleteTest) {
      return (
        <>
          Are you ready to finish this {session.phase === 'timed' ? 'timed' : ''} section?
          <br /><br />
          <b>NOTE:</b> You will only be able to review this section in review once you click Finish Session below.
        </>
      );
    }
    // Case 2: Full test scenarios (when isCompleteTest is true)
    else {
      if (triggeredByTimer && isLastSection) {
        // Timer triggered in last section of a full test
        return (
          <>
            Test Complete! You have completed all sections of this test.
          </>
        );
      } else if (!triggeredByTimer) {
        // Called by button in a full test
        if (!isLastSection) { // Mid-test section, button clicked
          return (
            <>
              Are you ready to move on to the next section?
              <br /><br />
              <b>NOTE:</b> You will not be permitted to come back to this section once you move on.
            </>
          );
        } else { // Last section of a full test, button clicked
          return (
            <>
              This is the last section of the test. Are you ready to complete your session?
            </>
          );
        }
      } else {
        // Timer triggered in a mid-test section of a full test
        return (
          <>
            Time is up for this section!
            <br /><br />
            <b>NOTE:</b> You will not be permitted to come back to this section once you move on.
          </>
        );
      }
    }
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
          {triggeredByTimer && isLastSection
            ? 'Test Complete!'
            : `Section ${currentSectionNumber} Complete!`}
        </h3>
        <p id="section-transition-desc" className="text-slate-600 mb-6">
          {renderMessage()}
        </p>

        <div className="flex space-x-3">
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
              ? 'Finish Session'
              : session.selectedSectionId
              ? 'Finish Section'
              : 'Next Section'}
          </button>
        </div>
      </div>
    </div>
  );
};
