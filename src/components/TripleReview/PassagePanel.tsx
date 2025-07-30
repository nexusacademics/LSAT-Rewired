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
  onClearPassageFormatting: React.MutableRefObject<(() => void) | null>;
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

  const removeFormatting = () => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  if (!range || range.collapsed) return;

  const passageElement = passageRef.current;
  if (!passageElement || !passageElement.contains(range.commonAncestorContainer)) {
    return;
  }

  // Workaround: use document fragment to hold modified content
  const fragment = document.createDocumentFragment();

  const startContainer = range.startContainer;
  const endContainer = range.endContainer;

  const isTextNode = (node: Node) => node.nodeType === Node.TEXT_NODE;

  const processTextNode = (node: Text, start: number, end: number) => {
    const parent = node.parentElement;
    const isFormatted = parent?.classList.contains('formatted-text');

    const originalText = node.nodeValue || '';
    const beforeText = originalText.slice(0, start);
    const selectedText = originalText.slice(start, end);
    const afterText = originalText.slice(end);

    const parts: Node[] = [];

    if (beforeText) {
      const beforeNode = document.createTextNode(beforeText);
      parts.push(isFormatted ? wrapInSpan(beforeNode, parent!) : beforeNode);
    }

    if (selectedText) {
      parts.push(document.createTextNode(selectedText)); // unwrapped!
    }

    if (afterText) {
      const afterNode = document.createTextNode(afterText);
      parts.push(isFormatted ? wrapInSpan(afterNode, parent!) : afterNode);
    }

    return parts;
  };

  const wrapInSpan = (node: Text, originalSpan: HTMLElement) => {
    const newSpan = document.createElement('span');
    newSpan.className = originalSpan.className;
    newSpan.setAttribute('data-format-type', originalSpan.getAttribute('data-format-type') || '');
    newSpan.setAttribute('data-color', originalSpan.getAttribute('data-color') || '');
    newSpan.appendChild(node);
    return newSpan;
  };

  if (startContainer === endContainer && isTextNode(startContainer)) {
    // Selection within a single text node
    const pieces = processTextNode(startContainer as Text, range.startOffset, range.endOffset);
    const parent = (startContainer as Text).parentNode!;
    pieces.forEach(node => parent.insertBefore(node, startContainer));
    parent.removeChild(startContainer);
  } else {
    // More complex multi-node selection
    const extracted = range.extractContents();

   const walker = document.createTreeWalker(extracted, NodeFilter.SHOW_TEXT);
let node: Node | null;

while ((node = walker.nextNode())) {
  const parent = node.parentElement;
  if (parent?.classList.contains('formatted-text')) {
    const grandParent = parent.parentNode;
    if (grandParent) {
      const unwrapped = document.createTextNode(node.textContent || '');
      grandParent.insertBefore(unwrapped, parent);
      parent.removeChild(node);
      if (!parent.hasChildNodes()) {
        parent.remove(); // remove empty span
      }
    }
  }
}


    range.insertNode(extracted);
  }

  selection.removeAllRanges();
  passageRef.current?.normalize();
};

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

    // Check if the selection contains already formatted text
    const commonAncestor = range.commonAncestorContainer;
    let hasExistingFormatting = false;
    
    // Check if we're selecting within or across formatted elements
    if (commonAncestor.nodeType === Node.ELEMENT_NODE) {
      const element = commonAncestor as Element;
      const formattedElements = element.querySelectorAll('.formatted-text');
      hasExistingFormatting = formattedElements.length > 0;
    } else if (commonAncestor.parentElement?.classList.contains('formatted-text')) {
      hasExistingFormatting = true;
    }

    // If there's existing formatting, don't apply new formatting
    if (hasExistingFormatting) {
      selection.removeAllRanges();
      return;
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
        span.style.borderBottom = `4px solid #000000`; // Always black for underline
        span.style.paddingBottom = '1px';
      }
      
      span.className = `formatted-text ${type}`;
      span.setAttribute('data-format-type', type);
      span.setAttribute('data-color', type === 'underline' ? '#000000' : color);
      
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
          span.style.borderBottom = `4px solid #000000`; // Always black for underline
          span.style.paddingBottom = '1px';
        }
        
        span.className = `formatted-text ${type}`;
        span.setAttribute('data-format-type', type);
        span.setAttribute('data-color', type === 'underline' ? '#000000' : color);
        
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
      if (selectedTool === 'eraser') {
        removeFormatting();
      } else if (selectedTool === 'underline') {
        applyFormatting('underline', '#000000'); // Black underline
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
              {selectedTool === 'eraser' ? (
                <><strong>Eraser mode active:</strong> Select formatted text in the passage to remove highlighting or underlining.</>
              ) : (
                <><strong>{selectedTool === 'underline' ? 'Underline' : 'Highlight'} mode active:</strong> Select text in the passage above to apply formatting.</>
              )}
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