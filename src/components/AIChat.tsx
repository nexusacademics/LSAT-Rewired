import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Lightbulb, AlertCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import { User as UserType, ProcessedQuestion, TestSession, ProcessedPrepTest, Message } from '../App';

interface AIChatProps {
  user: UserType;
  isChatDisabled?: boolean;
  currentView: 'landing' | 'dashboard' | 'triple-review' | 'circuit-builder' | 'performance' | 'chat';
  currentSession: TestSession | null;
  currentQuestionData: ProcessedQuestion | null;
  allProcessedTests: { [key: string]: ProcessedPrepTest };
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isOpen: boolean;
  lastProcessedQuestionIdForChat: { questionId: string, phase: string } | null;
  setLastProcessedQuestionIdForChat: React.Dispatch<React.SetStateAction<{ questionId: string, phase: string } | null>>;
  hasInitialChatWelcomeBeenSent: boolean;
  setHasInitialChatWelcomeBeenSent: React.Dispatch<React.SetStateAction<boolean>>;
}

const AIChat: React.FC<AIChatProps> = ({ user, isChatDisabled = false, currentView, currentSession, currentQuestionData, allProcessedTests, messages, setMessages, isOpen, lastProcessedQuestionIdForChat, setLastProcessedQuestionIdForChat, hasInitialChatWelcomeBeenSent, setHasInitialChatWelcomeBeenSent }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasSentIntroRef = useRef<string | null>(null);

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputMessage]);

  const getQuestionReference = (questionId: string): string => {
    if (!currentSession || !allProcessedTests) return `Question ${questionId}`;
    const test = allProcessedTests[currentSession.testId];
    if (!test) return `Question ${questionId}`;
    for (let sectionIndex = 0; sectionIndex < test.sections.length; sectionIndex++) {
      const section = test.sections[sectionIndex];
      for (let questionIndex = 0; questionIndex < section.questions.length; questionIndex++) {
        if (section.questions[questionIndex].id === questionId) {
          return `Section ${sectionIndex + 1}, Question ${questionIndex + 1}`;
        }
      }
    }
    return `Question ${questionId}`;
  };

  useEffect(() => {
    const currentContext = currentQuestionData && currentSession
      ? { questionId: currentQuestionData.id, phase: currentSession.phase }
      : null;

    if (messages.length === 0 && !hasInitialChatWelcomeBeenSent) {
      setMessages([
        {
          id: 'initial-load-general',
          type: 'ai',
          content: `Hi ${user.name}! I'm your LSAT analysis assistant. I'm here to help guide your thinking , but I won't give you direct answers.`,
          timestamp: new Date()
        }
      ]);
      setHasInitialChatWelcomeBeenSent(true);
    }

    if (isOpen && currentView === 'triple-review' && currentContext) {
      const contextKey = `${currentContext.questionId}-${currentContext.phase}`;

      if (hasSentIntroRef.current !== contextKey) {
        const questionRef = getQuestionReference(currentContext.questionId);

        const introPhrases = [
          `I see you've moved on to ${questionRef}. What are your initial thoughts on the passage or question stem?`,
          `Alright, we're now on ${questionRef}. What's standing out to you in the stimulus or question?`,
          `Moving to ${questionRef}. How are you approaching this one?`,
          `New question, ${questionRef}! What's your first impression of the argument presented?`,
          `Let's tackle ${questionRef}. What's the core issue or argument you're seeing here?`
        ];

        const randomPhrase = introPhrases[Math.floor(Math.random() * introPhrases.length)];

        setMessages(prev => [
          ...prev,
          {
            id: `new-question-intro-${Date.now()}`,
            type: 'ai',
            content: randomPhrase,
            timestamp: new Date()
          }
        ]);

        setLastProcessedQuestionIdForChat(currentContext);
        hasSentIntroRef.current = contextKey;
      }
    } else if (currentView !== 'triple-review') {
      setLastProcessedQuestionIdForChat(null);
      hasSentIntroRef.current = null;
    }
  }, [currentQuestionData, currentView, user.name, currentSession, allProcessedTests, messages.length, isOpen, lastProcessedQuestionIdForChat, setLastProcessedQuestionIdForChat, hasInitialChatWelcomeBeenSent, setHasInitialChatWelcomeBeenSent]);

  return (
    <div className="h-full flex flex-col bg-slate-50 rounded-2xl overflow-hidden">
      {/* ... UI code remains unchanged ... */}
    </div>
  );
};

export default AIChat;
