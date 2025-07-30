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
  // New props for text size and line spacing
  textSize: 'small' | 'medium' | 'large';
  lineSpacing: 'normal' | 'relaxed' | 'loose';
}

export const PassagePanel: React.FC<PassagePanelProps> = ({
  currentQuestionData,
  session,
  selectedAnswerText,
  selectedAnswerIndex,
  isCircuitBuilderOpen,
  selectedTool,
  onClearPassageFormatting,
  textSize,
  lineSpacing
}) => {
  const passageRef = useRef<HTMLDivElement>(null);

  // Get text size classes
  const getTextSizeClass = () => {
    switch (textSize) {
      case 'small': return 'text-sm';
      case 'medium': return 'text-base';
      case 'large': return 'text-lg';
      default: return 'text-base';
    }
  };

  // Get line spacing classes
  const getLineSpacingClass = () => {
    switch (lineSpacing) {
      case 'normal': return 'leading-relaxed';
      case 'relaxed': return 'leading-loose';
      case 'loose': return 'leading-8';
      default: return 'leading-relaxed';
    }
  };

 const removeFormatting = () => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  if (!range || range.collapsed) return;

  const passageElement = passageRef.current;
  if (!passageElement || !passageElement.contains(range.commonAncestorContainer)) {
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

    // Create and insert the 3 parts
    if (before) {
      const beforeNode = document.createTextNode(before);
      const beforeSpan = parent.cloneNode(false) as HTMLElement;
      beforeSpan.textContent = before;
      grandParent.insertBefore(beforeSpan, parent);
    }

    if (selected) {
      const unwrappedNode = document.createTextNode(selected);
      grandParent.insertBefore(unwrappedNode, parent);
    }

    if (after) {
      const afterNode = document.createTextNode(after);
      const afterSpan = parent.cloneNode(false) as HTMLElement;
      afterSpan.textContent = after;
      grandParent.insertBefore(afterSpan, parent);
    }

    // Remove original span
    parent.remove();
  };

  // Case 1: single text node
  if (
    range.startContainer === range.endContainer &&
    range.startContainer.nodeType === Node.TEXT_NODE
  ) {
    unwrapSpan(range.startContainer as Text, range.startOffset, range.endOffset);
  } else {
    // Case 2: multi-node
    const selectedContents = range.cloneContents();
    const walker = document.createTreeWalker(selectedContents, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    const textNodes: Text[] = [];

    while ((node = walker.nextNode())) {
      if (node.nodeType === Node.TEXT_NODE) {
        textNodes.push(node as Text);
      }
    }

    // We need to map those text nodes back to the live DOM
    for (const node of textNodes) {
      const original = findMatchingTextNodeInDOM(passageElement, node.nodeValue || '');
      if (!original) continue;

      const isStart = node === textNodes[0];
      const isEnd = node === textNodes[textNodes.length - 1];

      const start = isStart ? range.startOffset : 0;
      const end = isEnd ? range.endOffset : (original.nodeValue || '').length;

      unwrapSpan(original, start, end);
    }
  }

  selection.removeAllRanges();
  passageRef.current?.normalize();
};

// Utility: finds a text node in the DOM that matches by content and isn't already processed
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
          while (element.first