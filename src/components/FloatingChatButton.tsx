import React from 'react'; // Removed useState, useEffect as they are no longer needed here
import { MessageCircle, X } from 'lucide-react';
import AIChat from './AIChat';
// Import types from App.tsx as they are now exported from there
import { User, TestSession, ProcessedQuestion, ProcessedPrepTest, Message } from '../App';

interface FloatingChatButtonProps {
  user: User;
  currentView: 'landing' | 'dashboard' | 'triple-review' | 'circuit-builder' | 'performance' | 'chat';
  currentSession: TestSession | null;
  currentQuestionData: ProcessedQuestion | null;
  allProcessedTests: { [key: string]: ProcessedPrepTest };
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  // NEW: Props to control the open/closed state from parent
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  // NEW: Props for lifted chat context state
  lastProcessedQuestionIdForChat: { questionId: string, phase: string } | null;
  setLastProcessedQuestionIdForChat: React.Dispatch<React.SetStateAction<{ questionId: string, phase: string } | null>>;
  // NEW: Prop for lifted initial welcome message flag
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
  isOpen, // Destructure isOpen from props
  setIsOpen, // Destructure setIsOpen from props
  lastProcessedQuestionIdForChat, // NEW: Destructure lifted state
  setLastProcessedQuestionIdForChat, // NEW: Destructure lifted setter
  hasInitialChatWelcomeBeenSent, // NEW: Destructure lifted state
  setHasInitialChatWelcomeBeenSent // NEW: Destructure lifted setter
}) => {
  // Determine if the chat should be disabled
  const isDisabled = currentView === 'triple-review' && currentSession?.phase === 'timed';

  const toggleChat = () => {
    if (!isDisabled) {
      setIsOpen(!isOpen); // Use setIsOpen from props
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-all duration-300 ease-in-out z-50
          ${isOpen ? 'bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'}
          ${isDisabled ? '' : ''}
        `}
        disabled={isDisabled}
        title={isDisabled ? "AI Assistant is disabled during timed sessions" : "Toggle AI Assistant"}
      >
        {isOpen ? (
          <X className="h-7 w-7 text-white" />
        ) : (
          <MessageCircle className="h-7 w-7 text-white" />
        )}
      </button>

      {/* Chat Window */}
      <div
        className={`fixed bottom-24 right-6 w-[450px] h-[600px] bg-white rounded-2xl shadow-xl border border-slate-200 z-50
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-y-0 opacity-100 visible' : 'translate-y-4 opacity-0 invisible'}
        `}
      >
        {isOpen && (
          <AIChat
            user={user}
            isChatDisabled={isDisabled}
            currentView={currentView}
            currentSession={currentSession}
            currentQuestionData={currentQuestionData}
            allProcessedTests={allProcessedTests}
            messages={messages}
            setMessages={setMessages}
            isOpen={isOpen} // Pass isOpen to AIChat
            lastProcessedQuestionIdForChat={lastProcessedQuestionIdForChat} // NEW: Pass lifted state
            setLastProcessedQuestionIdForChat={setLastProcessedQuestionIdForChat} // NEW: Pass lifted setter
            hasInitialChatWelcomeBeenSent={hasInitialChatWelcomeBeenSent} // NEW: Pass lifted state
            setHasInitialChatWelcomeBeenSent={setHasInitialChatWelcomeBeenSent} // NEW: Pass lifted setter
          />
        )}
      </div>
    </>
  );
};

export default FloatingChatButton;
