import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import AIChat from './AIChat';
import { User, TestSession, ProcessedQuestion, ProcessedPrepTest, Message } from '../App'; // Import ProcessedQuestion and ProcessedPrepTest

// Define Message interface for chat history (moved from AIChat.tsx)
// This interface is now imported from App.tsx, so no need to define it here.

interface FloatingChatButtonProps {
  user: User;
  currentView: 'landing' | 'dashboard' | 'triple-review' | 'circuit-builder' | 'performance' | 'chat';
  currentSession: TestSession | null;
  currentQuestionData: ProcessedQuestion | null; // NEW PROP
  allProcessedTests: { [key: string]: ProcessedPrepTest }; // ADD THIS LINE
  messages: Message[]; // Prop for messages state, now passed from App.tsx
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>; // Prop for setMessages function, now passed from App.tsx
  isOpen: boolean; // NEW: Prop to control open/close state
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>; // NEW: Prop to set open/close state
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ user, currentView, currentSession, currentQuestionData, allProcessedTests, messages, setMessages, isOpen, setIsOpen }) => {
  // Removed local isOpen state, now using props from App.tsx

  // Determine if the chat should be disabled
  const isDisabled = currentView === 'triple-review' && currentSession?.phase === 'timed';

  const toggleChat = () => {
    if (!isDisabled) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-lg transition-all duration-300 ease-in-out z-50
          ${isOpen ? 'bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'}
          ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
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
            messages={messages} // Pass messages state from props
            setMessages={setMessages} // Pass setMessages function from props
          />
        )}
      </div>
    </>
  );
};

export default FloatingChatButton;
