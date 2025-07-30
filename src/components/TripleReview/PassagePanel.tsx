// components/TripleReview/PassagePanel.tsx
import React, { useRef, useEffect } from 'react';
import { TestSession, ProcessedQuestion, Circuit } from '../../App';

interface PassagePanelProps {
  currentQuestionData: ProcessedQuestion;
  session: TestSession;
  selectedAnswerText: string | null;
  selectedAnswerIndex: number | undefined;
  existingCircuitForQuestion: Circuit | undefined;
  onShowCircuitBuilder: () => void;
  isCircuitBuilderOpen: boolean;
  // New props for formatting
  selectedTool: string | null;
  onClearPassageFormatting: () => void;
}

export const PassagePanel: React.FC<PassagePanelProps> = ({
  currentQuestionData,
  session,
  selectedAnswerText,
  selectedAnswerIndex,
  isCircuitBuilderOpen,
  selectedTool,
  onClearPassageFormatting
}) => {
  const passageRef = useRef<HTMLDivElement>(null);

  const applyFormatting = (type: string, color: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    const selectedText = range.toString();
    
    if (!selectedText) return;

    // Check if selection is within the passage area
    const passageElement = passageRef.current;
    if (!passageElement || !passageElement.contains(range.commonAncestorContainer)) {
      return; // Don't apply formatting outside passage
    }

    // Don't format if we're selecting across different elements
    try {
      const span = document.createElement('span');
      
      if (type === 'highlight') {
        span.style.backgroundColor = color;
        span.style.padding = '2px 1px';
        span.style.borderRadius = '3px';
        span.style.boxDecorationBreak = 'clone';
      } else if (type === 'underline') {
        span.style.borderBottom = `2px solid ${color}`;
        span.style.paddingBottom = '1px';
      }
      
      span.className = `formatted-text ${type}`;
      span.setAttribute('data-format-type', type);
      span.setAttribute('data-color', color);
      
      // Try to wrap the selection
      range.surroundContents(span);
      selection.removeAllRanges();
    } catch (e) {
      // Handle complex selections by extracting and wrapping contents
      try {
        const span = document.createElement('span');
        
        if (type === 'highlight') {
          span.style.backgroundColor = color;
          span.style.padding = '2px 1px';
          span.style.borderRadius = '3px';
          span.style.boxDecorationBreak = 'clone';
        } else if (type === 'underline') {
          span.style.borderBottom = `2px solid ${color}`;
          span.style.paddingBottom = '1px';
        }
        
        span.className = `formatted-text ${type}`;
        span.setAttribute('data-format-type', type);
        span.setAttribute('data-color', color);
        
        const contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);
        selection.removeAllRanges();
      } catch (e2) {
        console.warn('Could not apply formatting to complex selection');
      }
    }
  };

  const handleMouseUp = () => {
    if (!selectedTool) return;
    
    // Small delay to ensure selection is complete
    setTimeout(() => {
      if (selectedTool === 'underline') {
        applyFormatting('underline', '#ff0000');
      } else if (selectedTool.startsWith('highlight-')) {
        const colors = {
          'highlight-yellow': '#ffff00',
          'highlight-pink': '#ffb3d9',
          'highlight-red': '#ff6b6b'
        };
        applyFormatting('highlight', colors[selectedTool as keyof typeof colors]);
      }
    }, 10);
  };

  const clearFormatting = () => {
    if (passageRef.current) {
      const formattedElements = passageRef.current.querySelectorAll('.formatted-text');
      formattedElements.forEach(element => {
        const parent = element.parentNode;
        if (parent) {
          while (element.firstChild) {
            parent.insertBefore(element.firstChild, element);
          }
          parent.removeChild(element);
        }
      });
      // Normalize the text content to remove empty text nodes
      passageRef.current.normalize();
    }
  };

  // Expose clear formatting function to parent
  useEffect(() => {
    onClearPassageFormatting.current = clearFormatting;
  }, [onClearPassageFormatting]);

  return (
    <div className="lg:col-span-1 space-y-6 h-full overflow-y-auto">
      {/* Passage */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="prose max-w-none">
          <div 
            ref={passageRef}
            className={`text-slate-700 leading-relaxed ${selectedTool ? 'select-text cursor-text' : ''}`}
            onMouseUp={handleMouseUp}
            style={{ userSelect: selectedTool ? 'text' : 'auto' }}
          >
            <div className="whitespace-pre-line">{currentQuestionData.passage}</div>
          </div>
        </div>
        
        {/* Formatting Instructions */}
        {selectedTool && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>{selectedTool === 'underline' ? 'Underline' : 'Highlight'} mode active:</strong> 
              {' '}Select text in the passage above to apply formatting.
            </p>
          </div>
        )}
      </div>
      
      {/* Conditional Answer Display - Only show when circuit builder is open */}
      {isCircuitBuilderOpen && session.phase === 'blind-review' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Your Selected Answer</h3>
          {selectedAnswerText ? (
            <p className="text-slate-700 font-medium">
              ({String.fromCharCode(65 + selectedAnswerIndex!)}) {selectedAnswerText}
            </p>
          ) : (
            <p className="text-slate-500 italic">
              No answer selected yet. Your choice will appear here.
            </p>
          )}
        </div>
      )}
      
      {isCircuitBuilderOpen && session.phase === 'strategy-review' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Correct Answer</h3>
          <p className="text-slate-700 font-medium">
            ({String.fromCharCode(65 + currentQuestionData.correctAnswer)}) {currentQuestionData.options[currentQuestionData.correctAnswer]}
          </p>
        </div>
      )}
    </div>
  );
};