// components/TripleReview/QuestionPanel.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, ChevronRight } from 'lucide-react';
import { TestSession, ProcessedQuestion } from '../../App';

interface QuestionPanelProps {
  currentQuestionData: ProcessedQuestion;
  session: TestSession;
  isTimerRunning: boolean;
  greyedOutOptions: { [questionId: string]: number[] };
  onAnswerSelection: (optionIndex: number) => void;
  onToggleGreyOut: (questionId: string, optionIndex: number) => void;
  selectedTool: string | null;
  onClearAnswerFormatting: React.MutableRefObject<(() => void) | null>;
  searchQuery: string;
}

export const QuestionPanel: React.FC<QuestionPanelProps> = ({
  currentQuestionData,
  session,
  isTimerRunning,
  greyedOutOptions,
  onAnswerSelection,
  onToggleGreyOut,
  selectedTool,
  onClearAnswerFormatting,
  searchQuery
}) => {
  const [showAnswerChoices, setShowAnswerChoices] = useState(false);
  const answerChoicesRef = useRef<HTMLDivElement>(null);

  // Helper function to highlight search matches
  const highlightSearchMatches = (text: string, query: string): React.ReactNode => {
    if (!query || query.trim() === '') {
      return text;
    }

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (regex.test(part)) {
        return (
          <mark
            key={index}
            className="bg-blue-300 text-slate-900 rounded px-0.5"
            style={{ backgroundColor: '#93c5fd' }}
          >
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  // Reset overlay when question changes during blind review
  React.useEffect(() => {
    if (session.phase === 'blind-review') {
      setShowAnswerChoices(false);
    }
  }, [currentQuestionData.id, session.phase]);

  const removeFormatting = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (!range || range.collapsed) return;

    const answerElement = answerChoicesRef.current;
    if (!answerElement || !answerElement.contains(range.commonAncestorContainer)) {
      return;
    }

    const unwrapSpan = (textNode: Text, start: number, end: number) => {
      const parent = textNode.parentElement;
      if (!parent || !parent.classList.contains('formatted-text')) return;

      const fullText = textNode.nodeValue || '';
      const before = fullText.slice(0, start);
      const selected = fullText.slice(start, end);
      const after = fullText.slice(end);

      const grandParent = parent.parentNode;
      if (!grandParent) return;

      if (before) {
        const beforeSpan = parent.cloneNode(false) as HTMLElement;
        beforeSpan.textContent = before;
        grandParent.insertBefore(beforeSpan, parent);
      }

      if (selected) {
        const unwrappedNode = document.createTextNode(selected);
        grandParent.insertBefore(unwrappedNode, parent);
      }

      if (after) {
        const afterSpan = parent.cloneNode(false) as HTMLElement;
        afterSpan.textContent = after;
        grandParent.insertBefore(afterSpan, parent);
      }

      parent.remove();
    };

    if (
      range.startContainer === range.endContainer &&
      range.startContainer.nodeType === Node.TEXT_NODE
    ) {
      unwrapSpan(range.startContainer as Text, range.startOffset, range.endOffset);
    } else {
      const selectedContents = range.cloneContents();
      const walker = document.createTreeWalker(selectedContents, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      const textNodes: Text[] = [];

      while ((node = walker.nextNode())) {
        if (node.nodeType === Node.TEXT_NODE) {
          textNodes.push(node as Text);
        }
      }

      for (const node of textNodes) {
        const original = findMatchingTextNodeInDOM(answerElement, node.nodeValue || '');
        if (!original) continue;

        const isStart = node === textNodes[0];
        const isEnd = node === textNodes[textNodes.length - 1];

        const start = isStart ? range.startOffset : 0;
        const end = isEnd ? range.endOffset : (original.nodeValue || '').length;

        unwrapSpan(original, start, end);
      }
    }

    selection.removeAllRanges();
    answerChoicesRef.current?.normalize();
  };

  const findMatchingTextNodeInDOM = (root: HTMLElement, text: string): Text | null => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node: Node | null;

    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.TEXT_NODE && node.nodeValue === text) {
        return node as Text;
      }
    }

    return null;
  };

  const applyFormatting = (type: string, color: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (!selectedText) return;

    const answerElement = answerChoicesRef.current;
    if (!answerElement || !answerElement.contains(range.commonAncestorContainer)) {
      return;
    }

    const commonAncestor = range.commonAncestorContainer;
    let hasExistingFormatting = false;

    if (commonAncestor.nodeType === Node.ELEMENT_NODE) {
      const element = commonAncestor as Element;
      const formattedElements = element.querySelectorAll('.formatted-text');
      hasExistingFormatting = formattedElements.length > 0;
    } else if (commonAncestor.parentElement?.classList.contains('formatted-text')) {
      hasExistingFormatting = true;
    }

    if (hasExistingFormatting) {
      selection.removeAllRanges();
      return;
    }

    try {
      const span = document.createElement('span');

      if (type === 'highlight') {
        span.style.backgroundColor = color;
        span.style.padding = '2px 1px';
        span.style.borderRadius = '3px';
        span.style.boxDecorationBreak = 'clone';
      } else if (type === 'underline') {
        span.style.borderBottom = '4px solid #000000';
        span.style.paddingBottom = '1px';
      }

      span.className = `formatted-text ${type}`;
      span.setAttribute('data-format-type', type);
      span.setAttribute('data-color', type === 'underline' ? '#000000' : color);

      range.surroundContents(span);
      selection.removeAllRanges();
    } catch (e) {
      try {
        const span = document.createElement('span');

        if (type === 'highlight') {
          span.style.backgroundColor = color;
          span.style.padding = '2px 1px';
          span.style.borderRadius = '3px';
          span.style.boxDecorationBreak = 'clone';
        } else if (type === 'underline') {
          span.style.borderBottom = '4px solid #000000';
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

    setTimeout(() => {
      if (selectedTool === 'eraser') {
        removeFormatting();
      } else if (selectedTool === 'underline') {
        applyFormatting('underline', '#000000');
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
    if (answerChoicesRef.current) {
      const formattedElements = answerChoicesRef.current.querySelectorAll('.formatted-text');
      formattedElements.forEach(element => {
        const parent = element.parentNode;
        if (parent) {
          while (element.firstChild) {
            parent.insertBefore(element.firstChild, element);
          }
          parent.removeChild(element);
        }
      });
      answerChoicesRef.current.normalize();
    }
  };

  useEffect(() => {
    onClearAnswerFormatting.current = clearFormatting;
  }, [onClearAnswerFormatting]);

  return (
    <div className="lg:col-span-1 space-y-6 h-full overflow-y-auto">
      {/* Question Stem */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-serif font-semibold text-slate-900">
            <div className="whitespace-pre-line">
              {searchQuery ? highlightSearchMatches(currentQuestionData.question, searchQuery) : currentQuestionData.question}
            </div>
          </h3>
        </div>
      </div>

      {/* Answer Choices */}
      <div
        ref={answerChoicesRef}
        className="bg-white font-serif rounded-2xl shadow-sm border border-slate-200 p-6 relative"
        onMouseUp={handleMouseUp}
        style={{ userSelect: selectedTool ? 'text' : 'auto' }}
      >
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Answer Choices</h3>
        
        {/* Overlay for Blind Review */}
        {session.phase === 'blind-review' && !showAnswerChoices && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center z-10">
            <div className="text-center p-8 max-w-sm">
              <div className="mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h4 className="text-xl font-semibold text-slate-900 mb-3">
                Stimulus Analysis First
              </h4>
              <p className="text-slate-600 mb-6 text-md leading-relaxed">
                We suggest completing your stimulus analysis before looking at the answer choices. 
                This helps you form your own understanding first.
              </p>
              <button
                onClick={() => setShowAnswerChoices(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Reveal Answer Choices
                <ChevronRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {currentQuestionData.options.map((option, index) => {
            const isGreyedOut = greyedOutOptions[currentQuestionData.id]?.includes(index);
            const isCorrect = index === currentQuestionData.correctAnswer;
            const timedAnswerChosen = session.timedAnswers[currentQuestionData.id];
            const blindReviewAnswerChosen = session.blindReviewAnswers[currentQuestionData.id];

            return (
              <div
                key={index}
                className={`flex items-start space-x-3 p-4 border rounded-xl transition-colors ${
                  isCorrect && session.phase === 'strategy-review'
                    ? 'border-green-500 bg-green-50'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <label className="flex items-start space-x-3 flex-1 cursor-pointer">
                  <div className="flex flex-col items-center space-y-1">
                    <input
                      type="radio"
                      name="answer"
                      value={index}
                      checked={
                        session.phase === 'strategy-review'
                          ? false
                          : session.answeredQuestions[currentQuestionData.id] === index
                      }
                      onChange={() => onAnswerSelection(index)}
                      className="mt-1 text-blue-600"
                      disabled={
                        (session.phase === 'timed' && !isTimerRunning) ||
                        session.phase === 'strategy-review'
                      }
                    />
                    {session.phase === 'strategy-review' && (
                      <div className="flex flex-col items-center space-y-1 mt-2">
                        {isCorrect && (
                          <span className="text-xs font-medium text-green-600 whitespace-nowrap">
                            Correct
                          </span>
                        )}
                        {timedAnswerChosen === index && (
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                            isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-100 text-red-700'
                          }`}>
                            Timed {isCorrect ? '✓' : '✗'}
                          </span>
                        )}
                        {blindReviewAnswerChosen === index && (
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                            isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-100 text-red-700'
                          }`}>
                            Blind {isCorrect ? '✓' : '✗'}
                          </span>
                        )}
                        {timedAnswerChosen === undefined && index === currentQuestionData.correctAnswer && (
                          <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 whitespace-nowrap">
                            Timed Ø
                          </span>
                        )}
                        {blindReviewAnswerChosen === undefined && index === currentQuestionData.correctAnswer && (
                          <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 whitespace-nowrap">
                            Blind Ø
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-slate-700 mr-3">
                    ({String.fromCharCode(65 + index)})
                  </span>
                  <span className={`text-slate-700 flex-1 ${
                    isGreyedOut ? 'opacity-50 text-slate-400 line-through' : ''
                  }`}>
                    {searchQuery ? highlightSearchMatches(option, searchQuery) : option}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => onToggleGreyOut(currentQuestionData.id, index)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  title={isGreyedOut ? "Show option" : "Grey out option"}
                >
                  {isGreyedOut ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};