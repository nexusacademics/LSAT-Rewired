import React, { useRef, useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import AIChat from './AIChat';
import { User, TestSession, ProcessedQuestion, ProcessedPrepTest, Message } from '../App';

interface FloatingChatButtonProps {
  user: User;
  currentView: 'landing' | 'dashboard' | 'triple-review' | 'circuit-builder' | 'performance' | 'chat';
  currentSession: TestSession | null;
  currentQuestionData: ProcessedQuestion | null;
  allProcessedTests: { [key: string]: ProcessedPrepTest };
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  lastProcessedQuestionIdForChat: { questionId: string; phase: string } | null;
  setLastProcessedQuestionIdForChat: React.Dispatch<React.SetStateAction<{ questionId: string; phase: string } | null>>;
  hasInitialChatWelcomeBeenSent: boolean;
  setHasInitialChatWelcomeBeenSent: React.Dispatch<React.SetStateAction<boolean>>;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  user,
  currentView,
  currentSession,
  currentQuestionData,
  allProcessedTests,
  messages,
  setMessages,
  isOpen,
  setIsOpen,
  lastProcessedQuestionIdForChat,
  setLastProcessedQuestionIdForChat,
  hasInitialChatWelcomeBeenSent,
  setHasInitialChatWelcomeBeenSent,
}) => {
  const chatRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 500 });
  const [isResizing, setIsResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 500, height: 500 });

  const isNonChatPhase =
    currentView === 'dashboard' ||
    currentView !== 'triple-review' ||
    (currentSession?.phase !== 'blind-review' && currentSession?.phase !== 'strategy-review');

  if (isNonChatPhase) return null;

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({ width: dimensions.width, height: dimensions.height });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const dx = e.clientX - startPos.x;
      const dy = startPos.y - e.clientY; // resizing from top

      setDimensions(prev => ({
        width: Math.max(300, startSize.width + dx),
        height: Math.max(300, startSize.height + dy),
      }));
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, startPos, startSize]);

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-32 left-5 p-4 rounded-full shadow-lg transition-all duration-300 ease-in-out z-50
          ${isOpen ? 'bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'}
        `}
        title="Toggle AI Assistant"
      >
        {isOpen ? (
          <X className="h-7 w-7 text-white" />
        ) : (
          <MessageCircle className="h-7 w-7 text-white" />
        )}
      </button>

      {/* Chat Window */}
      <div
        ref={chatRef}
        className={`fixed bottom-24 left-20 bg-white rounded-2xl shadow-xl border border-slate-200 z-50
          transform transition-all duration-300 ease-in-out overflow-hidden
          ${isOpen ? 'translate-y-0 opacity-100 visible' : 'translate-y-4 opacity-0 invisible'}
        `}
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
        }}
      >
        {isOpen && (
          <>
            <div
              onMouseDown={startResize}
              className="absolute top-0 right-0 cursor-nwse-resize w-4 h-4 bg-purple-300 rounded-tr-2xl z-50"
              title="Resize"
            />
            <AIChat
              user={user}
              isChatDisabled={false}
              currentView={currentView}
              currentSession={currentSession}
              currentQuestionData={currentQuestionData}
              allProcessedTests={allProcessedTests}
              messages={messages}
              setMessages={setMessages}
              isOpen={isOpen}
              lastProcessedQuestionIdForChat={lastProcessedQuestionIdForChat}
              setLastProcessedQuestionIdForChat={setLastProcessedQuestionIdForChat}
              hasInitialChatWelcomeBeenSent={hasInitialChatWelcomeBeenSent}
              setHasInitialChatWelcomeBeenSent={setHasInitialChatWelcomeBeenSent}
            />
          </>
        )}
      </div>
    </>
  );
};

export default FloatingChatButton;
