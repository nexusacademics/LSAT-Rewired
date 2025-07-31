import React, { useState, useRef, useCallback, useEffect } from 'react';

export const AnalysisPanel = ({ 
  isBlindReview, 
  analysisNotes = {}, 
  onNoteChange, 
  focusRingColor = 'focus:ring-2 focus:ring-blue-500' 
}) => {
  const containerRef = useRef(null);
  const innerPanelRef = useRef(null);
  
  // Define the four text areas
  const textAreas = ['summary', 'strengths', 'weaknesses', 'recommendations'];
  
  const labelMap = {
    summary: 'Summary',
    strengths: 'Strengths',
    weaknesses: 'Weaknesses', 
    recommendations: 'Recommendations'
  };
  
  const placeholderMap = {
    summary: 'Enter summary...',
    strengths: 'Enter strengths...',
    weaknesses: 'Enter weaknesses...',
    recommendations: 'Enter recommendations...'
  };

  // Minimum height for each textarea (2 lines approximately)
  const MIN_HEIGHT = 48; // pixels
  const LABEL_HEIGHT = 20; // approximate height for label + margin

  // Use internal state if onNoteChange is not provided, otherwise sync with props
  const [internalNotes, setInternalNotes] = useState(() => ({
    summary: analysisNotes.summary || '',
    strengths: analysisNotes.strengths || '',
    weaknesses: analysisNotes.weaknesses || '',
    recommendations: analysisNotes.recommendations || ''
  }));

  // State to track heights of each textarea
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

  // Update internal state when props change
  useEffect(() => {
    if (onNoteChange && analysisNotes) {
      setInternalNotes({
        summary: analysisNotes.summary || '',
        strengths: analysisNotes.strengths || '',
        weaknesses: analysisNotes.weaknesses || '',
        recommendations: analysisNotes.recommendations || ''
      });
    }
  }, [analysisNotes, onNoteChange]);

  // Always use internal state for the UI, but sync with parent
  const handleTextChange = (key, value) => {
    console.log('handleTextChange called:', key, value);
    
    // Update internal state immediately
    setInternalNotes(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Also notify parent if callback exists
    if (onNoteChange) {
      onNoteChange(key, value);
    }
  };

  // Calculate available height for textareas
  useEffect(() => {
    const updateAvailableHeight = () => {
      if (innerPanelRef.current) {
        const containerHeight = innerPanelRef.current.clientHeight;
        // Subtract space for labels and margins (4 textareas * label height + gaps)
        const usedByLabels = textAreas.length * LABEL_HEIGHT + (textAreas.length - 1) * 12; // 12px gap between items
        setAvailableHeight(containerHeight - usedByLabels);
      }
    };

    updateAvailableHeight();
    window.addEventListener('resize', updateAvailableHeight);
    return () => window.removeEventListener('resize', updateAvailableHeight);
  }, []);

  // Initialize heights when available height changes
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
    
    // Calculate new height for the resizing textarea
    const proposedHeight = Math.max(MIN_HEIGHT, startHeights[isResizing] + deltaY);
    const heightDiff = proposedHeight - startHeights[isResizing];
    
    // Calculate total height of other textareas that can be shrunk
    const otherKeys = textAreas.filter(key => key !== isResizing);
    const totalOtherHeight = otherKeys.reduce((sum, key) => sum + startHeights[key], 0);
    const totalOtherMinHeight = otherKeys.length * MIN_HEIGHT;
    const maxShrinkage = totalOtherHeight - totalOtherMinHeight;
    
    // Limit the expansion based on how much others can shrink
    const actualHeightDiff = Math.min(Math.max(heightDiff, -startHeights[isResizing] + MIN_HEIGHT), maxShrinkage);
    const actualNewHeight = startHeights[isResizing] + actualHeightDiff;
    
    newHeights[isResizing] = actualNewHeight;
    
    // Distribute the height change among other textareas
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

  // Add and remove event listeners for mouse events
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

  return (
    <div ref={containerRef} className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-shrink-0">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">
            {isBlindReview ? 'Analysis Template' : 'Answer Explanations'}
          </h3>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col flex-1 min-h-0 overflow-hidden mt-2">
        <div 
          className="flex-1 min-h-0 p-4 flex flex-col overflow-hidden" 
          ref={innerPanelRef}
          style={{ gap: '12px' }}
        >
          {textAreas.map((key, index) => (
            <div
              key={key}
              className="flex flex-col relative transition-all duration-200 ease-in-out"
              style={{ 
                height: `${heights[key] + LABEL_HEIGHT}px`,
                minHeight: `${MIN_HEIGHT + LABEL_HEIGHT}px`
              }}
            >
              <label className="block text-xs font-medium text-slate-700 mb-1 flex-shrink-0">
                {labelMap[key]}
              </label>
              <textarea
                className={`w-full border border-slate-300 rounded-lg p-2 text-xs ${focusRingColor} resize-none overflow-auto`}
                placeholder={placeholderMap[key]}
                defaultValue={internalNotes[key]}
                onChange={(e) => {
                  console.log('textarea onChange:', key, e.target.value);
                  handleTextChange(key, e.target.value);
                }}
                style={{ 
                  height: `${heights[key]}px`,
                  minHeight: `${MIN_HEIGHT}px`
                }}
              />
              
              {/* Resize handle (except for last item) */}
              {index < textAreas.length - 1 && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-2 cursor-row-resize hover:bg-blue-100 hover:bg-opacity-50 transition-colors duration-150 flex items-center justify-center group"
                  onMouseDown={(e) => handleMouseDown(key, e)}
                  style={{ transform: 'translateY(6px)' }}
                >
                  <div className="w-8 h-0.5 bg-slate-300 group-hover:bg-blue-400 transition-colors duration-150 rounded-full" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Debug info */}
      <div className="text-xs text-gray-500 p-2">
        Debug: {JSON.stringify(internalNotes)}
      </div>
    </div>
  );
};