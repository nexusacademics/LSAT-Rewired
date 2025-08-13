import React, { useState, useRef, useCallback, useEffect } from 'react';
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
    textAreas.forEach(key => {
      initialHeights[key] = MIN_HEIGHT;
    });
    return initialHeights;
  });

  const [isResizing, setIsResizing] = useState(null);
  const [startY, setStartY] = useState(0);
  const [startHeights, setStartHeights] = useState({});
  const [availableHeight, setAvailableHeight] = useState(0);

  // NEW: State for explanations toggle and navigation
  const [showExplanations, setShowExplanations] = useState(false);
  const [currentExplanationIndex, setCurrentExplanationIndex] = useState(0);

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

  // Reset explanations toggle and index when question changes
  useEffect(() => {
    setShowExplanations(false);
    setCurrentExplanationIndex(0);
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

  // Get available explanations and current explanation
  const getAvailableExplanations = () => {
    if (!currentQuestion?.explanations) return [];
    
    const explanations = currentQuestion.explanations;
    const availableExplanations = [];
    
    // Define the order and check for content
    const explanationOrder = [
      { key: 'conclusion', label: 'Conclusion', content: explanations.conclusion },
      { key: 'roles', label: 'Premises/Roles', content: explanations.roles },
      { key: 'assumption', label: 'Assumption', content: explanations.assumption },
      { key: 'prediction', label: 'Prediction', content: explanations.prediction },
      { key: 'correct', label: 'Correct Answer', content: explanations.correct },
      { key: 'incorrect', label: 'Incorrect Answers', content: explanations.incorrect }
    ];
    
    explanationOrder.forEach(exp => {
      if (exp.content && exp.content.trim()) {
        availableExplanations.push(exp);
      }
    });
    
    return availableExplanations;
  };

  const availableExplanations = getAvailableExplanations();
  const currentExplanation = availableExplanations[currentExplanationIndex];

  const handlePreviousExplanation = () => {
    setCurrentExplanationIndex(prev => 
      prev > 0 ? prev - 1 : availableExplanations.length - 1
    );
  };

  const handleNextExplanation = () => {
    setCurrentExplanationIndex(prev => 
      prev < availableExplanations.length - 1 ? prev + 1 : 0
    );
  };

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
            <div className="flex-1 flex flex-col min-h-0">
              {availableExplanations.length > 0 ? (
                <>
                  {/* Navigation Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                    <div className="flex items-center space-x-2">
                      <div className="text-center">
                        <h4 className="font-semibold text-slate-800 text-lg">
                          {currentExplanation?.label}
                        </h4>
                        <p className="text-sm text-slate-500">
                          Explanation Part {currentExplanationIndex + 1} of {availableExplanations.length}
                        </p>
                      </div>                                           
                    </div>
          
                    {/* Progress dots */}
                    {availableExplanations.length > 1 && (
                      <div className="flex space-x-1">
                        {availableExplanations.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentExplanationIndex(index)}
                            className={`w-2 h-2 rounded-full ${
                              index === currentExplanationIndex
                                ? 'bg-blue-500'
                                : 'bg-slate-300 hover:bg-slate-400'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
          
                  {/* Current Explanation Content */}
                  <div className="flex-1 overflow-auto">
  <div className="prose prose-slate max-w-none space-y-4">
    <div className="flex bg-slate-50 border border-slate-200 shadow-sm rounded-lg p-4">
      {/* Left accent bar */}
      <div className="w-1 bg-blue-500 rounded-l-lg mr-3" />

      {/* Content with highlighting */}
      <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">
        {currentExplanation?.content.split('\n').map((line, idx) => {
          // Match up to 4 words before colon
          const headingMatch = line.match(/^((?:[\w/-]+\s?){1,4}):/);
          const answerChoiceRegex = /\(([A-E])\)/g;

          if (headingMatch) {
            const heading = headingMatch[0]; // includes colon
            const restOfLine = line.slice(heading.length);

            // Highlight (A)-(E) in the rest of line
            const segments = [];
            let lastIndex = 0;
            let match;
            while ((match = answerChoiceRegex.exec(restOfLine)) !== null) {
              segments.push(restOfLine.slice(lastIndex, match.index));
              segments.push(
                <span key={`choice-${idx}-${match.index}`} className="font-bold text-black">
                  {match[0]}
                </span>
              );
              lastIndex = match.index + match[0].length;
            }
            segments.push(restOfLine.slice(lastIndex));

            return (
              <div key={idx}>
                <span className="font-bold text-blue-600">{heading}</span>
                {segments}
              </div>
            );
          } else {
            // Normal line: just highlight (A)-(E)
            const segments = [];
            let lastIndex = 0;
            let match;
            while ((match = answerChoiceRegex.exec(line)) !== null) {
              segments.push(line.slice(lastIndex, match.index));
              segments.push(
                <span key={`choice-${idx}-${match.index}`} className="font-bold text-black">
                  {match[0]}
                </span>
              );
              lastIndex = match.index + match[0].length;
            }
            segments.push(line.slice(lastIndex));
            return <div key={idx}>{segments}</div>;
          }
        })}
      </div>
    </div>
  </div>
</div>
          
                  {/* Navigation Footer */}
                  {availableExplanations.length > 1 && (
                    <div className="mt-4 pt-3 border-t border-slate-200 flex justify-between items-center">
                      <button
                        onClick={handlePreviousExplanation}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-md transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </button>
          
                      <div className="text-sm text-slate-500">
                        Use arrows or dots to navigate
                      </div>
          
                      <button
                        onClick={handleNextExplanation}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-md transition-colors"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-slate-500">
                    <p className="text-lg mb-2">No explanations available</p>
                    <p className="text-sm">for this question</p>
                  </div>
                </div>
              )}
            </div>
          ) :(
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