import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const AnalysisPanel = ({
  isBlindReview,
  isStrategyReview = false,
  currentQuestion = null,
  analysisNotes = {},
  onNoteChange,
  focusRingColor = 'focus:ring-2 focus:ring-blue-500'
}) => {
  const containerRef = useRef(null);
  const innerPanelRef = useRef(null);

  const textAreas = ['Conclusion', 'Premises', 'Assumption', 'Answers'];
  const labelMap = {
    Conclusion: 'Conclusion',
    Premises: 'Premises',
    Assumption: 'Assumption',
    Answers: 'Answer Choice Analyses'
  };
  const placeholderMap = {
    Conclusion: 'Enter Conclusion...',
    Premises: 'Enter Premises...',
    Assumption: 'Enter Assumption...',
    Answers: 'Enter Notes on the Answer Choices...'
  };

  const MIN_HEIGHT = 48;
  const LABEL_HEIGHT = 20;

  const [internalNotes, setInternalNotes] = useState(() => ({
    Conclusion: analysisNotes.Conclusion || '',
    Premises: analysisNotes.Premises || '',
    Assumption: analysisNotes.Assumption || '',
    Answers: analysisNotes.Answers || ''
  }));

  const [heights, setHeights] = useState(() => {
    const initialHeights = {};
    textAreas.forEach((key) => {
      initialHeights[key] = MIN_HEIGHT;
    });
    return initialHeights;
  }));

  const handleTextChange = (key, value) => {
    setInternalNotes(prev => ({ ...prev, [key]: value }));
    if (onNoteChange) onNoteChange(key, value);
  };

  // Reset notes if analysisNotes changes
  useEffect(() => {
    setInternalNotes({
      Conclusion: analysisNotes.Conclusion || '',
      Premises: analysisNotes.Premises || '',
      Assumption: analysisNotes.Assumption || '',
      Answers: analysisNotes.Answers || ''
    });
  }, [analysisNotes]);

  // Reset when question changes
  useEffect(() => {
    setInternalNotes({
      Conclusion: '',
      Premises: '',
      Assumption: '',
      Answers: ''
    });
  }, [currentQuestion?.id]);

  // Highlighting logic
  const highlightText = (text = '') => {
    const headingRegex = /^((?:[\w/-]+\s?){1,4}):/; // up to 4 words before colon
    const answerChoiceRegex = /\(([A-E])\)/g;

    return text.split('\n').map((line, lineIndex) => {
      const headingMatch = line.match(headingRegex);
      if (headingMatch) {
        const heading = headingMatch[0];
        const restOfLine = line.slice(heading.length);

        // Process (A)-(E) inside rest of line
        const segments = [];
        let last = 0;
        let match;
        while ((match = answerChoiceRegex.exec(restOfLine)) !== null) {
          const idx = match.index;
          segments.push(restOfLine.slice(last, idx));
          segments.push(
            <span
              key={`choice-${lineIndex}-${idx}`}
              className="bg-black text-white font-bold"
            >
              {match[0]}
            </span>
          );
          last = idx + match[0].length;
        }
        segments.push(restOfLine.slice(last));

        return (
          <div key={`line-${lineIndex}`} className="whitespace-pre-wrap">
            <span className="bg-yellow-300 font-bold">{heading}</span>
            {segments}
          </div>
        );
      } else {
        // Highlight (A)-(E) in normal lines
        const segments = [];
        let last = 0;
        let match;
        while ((match = answerChoiceRegex.exec(line)) !== null) {
          const idx = match.index;
          segments.push(line.slice(last, idx));
          segments.push(
            <span
              key={`choice-${lineIndex}-${idx}`}
              className="bg-black text-white font-bold"
            >
              {match[0]}
            </span>
          );
          last = idx + match[0].length;
        }
        segments.push(line.slice(last));

        return (
          <div key={`line-${lineIndex}`} className="whitespace-pre-wrap">
            {segments}
          </div>
        );
      }
    });
  };

  return (
    <div ref={containerRef} className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-shrink-0">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-md font-semibold text-slate-900">
            {isBlindReview ? 'Analysis Template' : 'Analysis Notes'}
          </h3>
          {isStrategyReview && (
            <label className="flex items-center space-x-2 text-sm cursor-pointer">
              <span>Show Explanations</span>
              <input
                type="checkbox"
                checked={isStrategyReview}
                onChange={() => {}}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col flex-1 min-h-0 overflow-hidden mt-2">
        <div
          className="flex-1 min-h-0 p-4 flex flex-col overflow-auto"
          ref={innerPanelRef}
          style={{ gap: '12px' }}
        >
          {isStrategyReview ? (
            <div className="flex-1 overflow-auto prose prose-slate max-w-none">
              {highlightText(currentQuestion?.explanations?.content)}
            </div>
          ) : (
            textAreas.map((key) => (
              <div
                key={key}
                className="flex flex-col mb-4"
                style={{ height: `${heights[key] + LABEL_HEIGHT}px` }}
              >
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {labelMap[key]}
                </label>
                <textarea
                  className={`w-full border border-slate-300 rounded-lg p-2 text-sm ${focusRingColor} resize-none`}
                  placeholder={placeholderMap[key]}
                  value={internalNotes[key]}
                  onChange={(e) => handleTextChange(key, e.target.value)}
                  style={{ height: `${heights[key]}px`, minHeight: `${MIN_HEIGHT}px` }}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
