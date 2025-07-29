// components/TripleReview/PauseReviewPopup.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import { AlertTriangle, Play, Home, X } from 'lucide-react';

interface PauseReviewPopupProps {
  isOpen: boolean;
  reviewType: 'Blind Review' | 'Strategy Review';
  onReturnToDashboard: () => void;
  onContinueReviewing: () => void;
  onClose: () => void;
}

export const PauseReviewPopup: React.FC<PauseReviewPopupProps> = ({
  isOpen,
  reviewType,
  onReturnToDashboard,
  onContinueReviewing,
  onClose
}) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Pause {reviewType}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-slate-700 text-center leading-relaxed">
              You can resume your Review Session at any time by clicking
              <span className="font-semibold text-blue-600"> Resume Session</span> in your
              <span className="font-semibold"> Active Session</span>.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
           
            <button
              onClick={onContinueReviewing}
              className="w-full px-4 py-3 bg-slate-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4" />
              Continue Reviewing
            </button>
             <button
              onClick={onReturnToDashboard}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Return to Dashboard
            </button>

          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
