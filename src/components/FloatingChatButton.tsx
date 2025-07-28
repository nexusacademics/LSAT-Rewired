import React from 'react';
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
  // Hide the chat completely during timed phase
const isNonChatPhase =
  currentView === 'dashboard' ||
  currentView !== 'triple-review' ||
  (currentSession?.phase !== 'blind-review' && currentSession?.phase !== 'strategy-review');

if (isNonChatPhase) return null;

const toggleChat = () => {
  setIsOpen(!isOpen);
};

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
        className={`fixed bottom-24 left-20 w-[500px] h-[500px] bg-white rounded-2xl shadow-xl border border-slate-200 z-50
          transform transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-y-0 opacity-100 visible' : 'translate-y-4 opacity-0 invisible'}
        `}
      >
        {isOpen && (
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
        )}
      </div>
    </>
  );
};

export default FloatingChatButton;