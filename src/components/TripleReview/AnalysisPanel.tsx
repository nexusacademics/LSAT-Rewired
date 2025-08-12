import React, { useState, useRef, useCallback, useEffect } from 'react';

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
    textAreas.forEach(key => {
      initialHeights[key] = MIN_HEIGHT;
    });
    return initialHeights;
  });

  const [isResizing, setIsResizing] = useState(null);
  const [startY, setStartY] = useState(0);
  const [startHeights, setStartHeights] = useState({});
  const [availableHeight, setAvailableHeight] = useState(0);

  // NEW: State for explanations toggle
  const [showExplanations, setShowExplanations] = useState(false);

  useEffect(() => {
    if (onNoteChange && analysisNotes) {
      setInternalNotes({
        Conclusion: analysisNotes.Conclusion || '',
        Premises: analysisNotes.Premises || '',
        Assumption: analysisNotes.Assumption || '',
        Answers: analysisNotes.Answers || ''
      });
    }
  }, [analysisNotes, onNoteChange]);

  // Reset explanations toggle when question changes
  useEffect(() => {
    setShowExplanations(false);
  }, [currentQuestion?.id]);

  const handleTextChange = (key, value) => {
    setInternalNotes(prev => ({
      ...prev,
      [key]: value
    }));
    if (onNoteChange) {
      onNoteChange(key, value);
    }
  };

  useEffect(() => {
    const updateAvailableHeight = () => {
      if (innerPanelRef.current) {
        const containerHeight = innerPanelRef.current.clientHeight;
        const usedByLabels = textAreas.length * LABEL_HEIGHT + (textAreas.length - 1) * 12;
        setAvailableHeight(containerHeight - usedByLabels);
      }
    };

    updateAvailableHeight();
    window.addEventListener('resize', updateAvailableHeight);
    return () => window.removeEventListener('resize', updateAvailableHeight);
  }, []);

  useEffect(() => {
    if (availableHeight > 0) {
      const equalHeight = Math.max(MIN_HEIGHT, availableHeight / textAreas.length);
      const newHeights = {};
      textAreas.forEach(key => {
        newHeights[key] = equalHeight;
      });
      setHeights(newHeights);
    }
  }, [availableHeight]);

  const handleMouseDown = useCallback((key, e) => {
    e.preventDefault();
    setIsResizing(key);
    setStartY(e.clientY);
    setStartHeights({ ...heights });
  }, [heights]);

  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return;
    const deltaY = e.clientY - startY;
    const newHeights = { ...startHeights };
    const proposedHeight = Math.max(MIN_HEIGHT, startHeights[isResizing] + deltaY);
    const heightDiff = proposedHeight - startHeights[isResizing];
    const otherKeys = textAreas.filter(key => key !== isResizing);
    const totalOtherHeight = otherKeys.reduce((sum, key) => sum + startHeights[key], 0);
    const totalOtherMinHeight = otherKeys.length * MIN_HEIGHT;
    const maxShrinkage = totalOtherHeight - totalOtherMinHeight;
    const actualHeightDiff = Math.min(Math.max(heightDiff, -startHeights[isResizing] + MIN_HEIGHT), maxShrinkage);
    const actualNewHeight = startHeights[isResizing] + actualHeightDiff;
    newHeights[isResizing] = actualNewHeight;
    if (actualHeightDiff !== 0) {
      const changePerOther = -actualHeightDiff / otherKeys.length;
      otherKeys.forEach(key => {
        const newHeight = startHeights[key] + changePerOther;
        newHeights[key] = Math.max(MIN_HEIGHT, newHeight);
      });
    }
    setHeights(newHeights);
  }, [isResizing, startY, startHeights, textAreas]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(null);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Get explanation content from currentQuestion
  const getExplanationContent = () => {
    if (!currentQuestion?.explanations) return null;
    
    const explanations = currentQuestion.explanations;
    return {
      Conclusion: explanations.conclusion,
      Premises: explanations.roles, // Assuming roles = premises
      Assumption: explanations.assumption,
      Prediction: explanations.prediction,
      Correct: explanations.correct,
      Incorrect: explanations.incorrect
    };
  };

  return (
    <div ref={containerRef} className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-shrink-0">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-md font-semibold text-slate-900">
            {isBlindReview ? 'Analysis Template' : 'Analysis Notes'}
          </h3>

          {/* Toggle only if in Strategy Review */}
          {isStrategyReview && (
            <label className="flex items-center space-x-2 text-sm cursor-pointer">
              <span>Show Explanations</span>
              <input
                type="checkbox"
                checked={showExplanations}
                onChange={() => setShowExplanations(v => !v)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>
          )}
        </div>
      </div>
      
      {/* Main content area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col flex-1 min-h-0 overflow-hidden mt-2">
        <div 
          className="flex-1 min-h-0 p-4 flex flex-col overflow-hidden" 
          ref={innerPanelRef}
          style={{ gap: '12px' }}
        >
          {isStrategyReview && showExplanations ? (
            <div className="flex-1 overflow-auto space-y-4">
              {getExplanationContent() ? (
                <>
                  {/* Render explanations */}
                  {Object.entries(getExplanationContent()).map(([key, content]) => (
                    content && (
                      <div key={key} className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold text-slate-800 mb-2">{key} Explanation</h4>
                        <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {content}
                        </div>
                      </div>
                    )
                  ))}
                </>
              ) : (
                <div className="flex items-center justify-center h-32">
                  <div className="text-slate-500">No explanations available for this question</div>
                </div>
              )}
            </div>
          ) : (
            textAreas.map((key, index) => (
              <div
                key={key}
                className="flex flex-col relative transition-all duration-200 ease-in-out"
                style={{ 
                  height: `${heights[key] + LABEL_HEIGHT}px`,
                  minHeight: `${MIN_HEIGHT + LABEL_HEIGHT}px`
                }}
              >
                <label className="block text-sm font-medium text-slate-700 mb-1 flex-shrink-0">
                  {labelMap[key]}
                </label>
                <textarea
                  className={`w-full border border-slate-300 rounded-lg p-2 text-sm ${focusRingColor} resize-none overflow-auto`}
                  placeholder={placeholderMap[key]}
                  defaultValue={internalNotes[key]}
                  onChange={(e) => handleTextChange(key, e.target.value)}
                  style={{ 
                    height: `${heights[key]}px`,
                    minHeight: `${MIN_HEIGHT}px`
                  }}
                />
                {index < textAreas.length - 1 && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-2 cursor-row-resize hover:bg-blue-100 hover:bg-opacity-50 flex items-center justify-center group"
                    onMouseDown={(e) => handleMouseDown(key, e)}
                    style={{ transform: 'translateY(6px)' }}
                  >
                    <div className="w-8 h-0.5 bg-slate-300 group-hover:bg-blue-400 rounded-full" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};