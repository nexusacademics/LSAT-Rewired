import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import AIChat from './AIChat';
import { User, TestSession, ProcessedQuestion, ProcessedPrepTest } from '../App'; // Import ProcessedQuestion and ProcessedPrepTest

interface FloatingChatButtonProps {
  user: User;
  currentView: 'landing' | 'dashboard' | 'triple-review' | 'circuit-builder' | 'performance' | 'chat';
  currentSession: TestSession | null;
  currentQuestionData: ProcessedQuestion | null; // NEW PROP
  allProcessedTests: { [key: string]: ProcessedPrepTest }; // ADD THIS LINE
}

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  feedback?: 'helpful' | 'not-helpful';
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ user, currentView, currentSession, currentQuestionData, allProcessedTests }) => { // ADD allProcessedTests here
  const [isOpen, setIsOpen] = useState(false);
  // State to hold conversation messages, now managed here
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: `Hi ${user.name}! I'm your LSAT analysis assistant. I'm here to help guide your thinking through circuits and logical reasoning, but I won't give you direct answers. What question are you working on?`,
      timestamp: new Date()
    }
  ]);

  // Determine if the chat should be disabled
  const isDisabled = currentView === 'triple-review' && currentSession?.phase === 'timed';

  // NEW: Effect to close chat when a session starts
  useEffect(() => {
    if (currentSession && isOpen) {
      setIsOpen(false);
    }
  }, [currentSession]); // Dependency on currentSession

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
            messages={messages} // Pass messages state
            setMessages={setMessages} // Pass setMessages function
          />
        )}
      </div>
    </>
  );
};

export default FloatingChatButton;
