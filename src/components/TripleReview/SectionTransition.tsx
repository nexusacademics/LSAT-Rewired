// components/TripleReview/SectionTransition.tsx
import React, { useState, useEffect } from 'react';
import { TestSession } from '../../App';
import { Play, X, Clock } from 'lucide-react';

interface SectionTransitionProps {
  session: TestSession;
  isLastSection: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  triggeredByTimer: boolean;
  isTimedSession?: boolean;
  isCompleteTest?: boolean;
}

export const SectionTransition: React.FC<SectionTransitionProps> = ({
  session,
  isLastSection,
  onCancel,
  onConfirm,
  triggeredByTimer,
  isTimedSession = false,
  isCompleteTest = false,
}) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isIntermission, setIsIntermission] = useState(false);

  // Derived flags
  const shouldShowCountdown = isTimedSession && isCompleteTest && !isLastSection;
  const isAfterSection2 = session.currentSectionIndex === 1;

  // showingCountdown derived from countdown state
  const showingCountdown = countdown !== null;

  // Debugging logs - uncomment if needed
  console.log({
  countdown,
   showingCountdown,
   isIntermission,
   shouldShowCountdown,
   triggeredByTimer,
   isLastSection,
  });
useEffect(() => {
  console.log('shouldShowCountdown changed:', shouldShowCountdown);
  if (!shouldShowCountdown) {
    console.log('Resetting countdown & intermission because shouldShowCountdown is false');
    setCountdown(null);
    setIsIntermission(false);
  }
}, [shouldShowCountdown]);
 
  
  // Reset countdown & intermission when countdown no longer needed
  useEffect(() => {
    if (!shouldShowCountdown) {
      setCountdown(null);
      setIsIntermission(false);
    }
  }, [shouldShowCountdown]);

  // Start the countdown (called on timer trigger or manual)
  const startCountdown = () => {
    const initialTime = isAfterSection2 ? 600 : 60;
    setCountdown(initialTime);
    setIsIntermission(isAfterSection2);
  };
useEffect(() => {
  console.log({
    countdown,
    showingCountdown: countdown !== null,
    isIntermission,
    shouldShowCountdown,
    triggeredByTimer,
    isLastSection,
    sessionSectionIndex: session.currentSectionIndex,
  });
});
  // Auto-start countdown if triggered by timer and countdown not started
  useEffect(() => {
    if (shouldShowCountdown && triggeredByTimer && countdown === null) {
      startCountdown();
    }
  }, [shouldShowCountdown, triggeredByTimer, isAfterSection2, countdown]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          setCountdown(null); // Hide countdown UI after finishing
          setIsIntermission(false);
          setTimeout(() => onConfirm(), 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, onConfirm]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTransitionTitle = (): string => {
    if (isLastSection) return 'Section Complete!';
    if (showingCountdown && isIntermission) return 'Intermission';
    if (showingCountdown) return 'Section Break';
    return `Section ${session.currentSectionIndex + 1} Complete!`;
  };

  const getTransitionMessage = (): React.ReactNode => {
    if (isLastSection) {
      return 'Once you click the End Testing Session button, you will no longer be able to work on this session and will move on to the next phase of review.';
    }

    if (showingCountdown) {
      if (isIntermission) {
        return (
          <>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {countdown !== null ? formatTime(countdown) : '--:--'}
              </div>
              <p className="text-slate-600">
                Take a break! Stretch, hydrate, or just relax.
              </p>
            </div>
            <p className="text-sm text-slate-500 text-center">
              The next section will begin automatically when the timer reaches zero, or you can
              advance immediately using the button below.
            </p>
          </>
        );
      } else {
        return (
          <>
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {countdown !== null ? formatTime(countdown) : '--:--'}
              </div>
              <p className="text-slate-600">{triggeredByTimer ? 'Time is up! ' : ''}Prepare for the next section</p>
            </div>
            <p className="text-sm text-slate-500 text-center">
              Review the upcoming section instructions or advance immediately.
            </p>
          </>
        );
      }
    }

    if (shouldShowCountdown && !triggeredByTimer) {
      return (
        <>
          Are you ready to move on to the next section?
          <br />
          <br />
          <span>
            <span className="font-semibold text-red-600">NOTE:</span> You will not be permitted to come
            back to this section once you move on.
          </span>
        </>
      );
    }

    return (
      <>
        Are you ready to move on to the next section?
        <br />
        <br />
        <span>
          <span className="font-semibold text-red-600">NOTE:</span> You will not be permitted to come
          back to this section once you move on.
        </span>
      </>
    );
  };

  const renderButtons = () => {
    if (showingCountdown) {
      return (
        <button
          onClick={onConfirm}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Play size={16} />
          {isIntermission ? 'Resume Test' : 'Advance Immediately to Next Section'}
        </button>
      );
    }

    if (shouldShowCountdown && !triggeredByTimer) {
      return (
        <>
          <button
            onClick={onCancel}
            className="w-full px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            Continue Working
          </button>
          <button
            onClick={startCountdown}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            Start Break Before Next Section
          </button>
        </>
      );
    }

    return (
      <>
        <button
          onClick={onCancel}
          className="w-full px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg font-medium transition-colors flex items-center justify-center"
        >
          Continue Working
        </button>
        <button
          onClick={onConfirm}
          className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
        >
          {isLastSection ? 'End Testing Session' : 'Next Section'}
        </button>
      </>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]"
      onClick={(e) => {
        if (!showingCountdown) {
          onCancel();
        }
        e.stopPropagation();
      }}
    >
      <div
        className={`bg-white rounded-2xl shadow-lg max-w-md w-full mx-4 transform transition-all ${
          isIntermission ? 'max-w-lg' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-2">
            {showingCountdown && <Clock size={20} className="text-blue-600" />}
            <h3 className="text-xl font-bold text-slate-900">{getTransitionTitle()}</h3>
          </div>
          {!showingCountdown && (
            <button
              onClick={onCancel}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-slate-700 leading-relaxed mb-6">{getTransitionMessage()}</div>

          {/* Next Section Preview (for non-intermission breaks) */}
          {showingCountdown && !isIntermission && (
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-slate-900 mb-2">
                Next: Section {session.currentSectionIndex + 2}
              </h4>
              <p className="text-sm text-slate-600">
                Prepare for the upcoming section. Review instructions and get ready.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-3 mt-6">{renderButtons()}</div>
        </div>
      </div>
    </div>
  );
};
