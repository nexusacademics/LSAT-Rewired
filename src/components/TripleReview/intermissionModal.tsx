import React, { useEffect, useState, useCallback } from 'react';

interface IntermissionModalProps {
  countdownSeconds: number;
  onFinish: () => void;
  isIntermission: boolean;
  triggeredByTimer: boolean;
}

export const IntermissionModal: React.FC<IntermissionModalProps> = ({
  countdownSeconds,
  onFinish,
  isIntermission,
  triggeredByTimer
}) => {
  const [countdown, setCountdown] = useState(countdownSeconds);

  useEffect(() => {
    if (countdown <= 0) {
      onFinish();
      return;
    }
    const timerId = setInterval(() => {
      setCountdown(c => c - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [countdown, onFinish]);

  const formatTime = useCallback((seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 text-center"
      >
        {isIntermission ? (
          <>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {countdown !== null ? formatTime(countdown) : '--:--'}
              </div>
              <p className="text-slate-600">
                Take a break! Stretch, hydrate, or just relax.
              </p>
            </div>
            <p className="text-sm text-slate-500 text-center mb-4">
              The next section will begin automatically when the timer reaches zero, 
              or you can advance immediately using the button below.
            </p>
          </>
        ) : (
          <>
            <div className="text-center mb-4">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {countdown !== null ? formatTime(countdown) : '--:--'}
              </div>
              <p className="text-slate-600">
                {triggeredByTimer ? 'Time is up! ' : ''}Prepare for the next section
              </p>
            </div>
            <p className="text-sm text-slate-500 text-center mb-4">
              Review the upcoming section instructions or advance immediately.
            </p>
          </>
        )}
        <button
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          onClick={onFinish}
        >
          Advance Now
        </button>
      </div>
    </div>
  );
};
