// components/LoadingSpinner.tsx
import React from 'react';
import { Brain } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="flex items-center space-x-3">
        <Brain className="h-8 w-8 text-blue-600 animate-pulse" />
        <span className="text-xl text-slate-700">Loading LSAT Rewired...</span>
      </div>
    </div>
  );
}