// components/FloatingChatButton.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Bot } from 'lucide-react';
import ChatWindow from './ChatWindow'; // Assuming you have a ChatWindow component

const FloatingChatButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpenedBefore, setHasOpenedBefore] = useState(false);
  const [windowHeight, setWindowHeight] = useState(300);
  const chatRef = useRef<HTMLDivElement>(null);

  const toggleChat = () => {
    setIsOpen((prev) => {
      const newState = !prev;
      if (newState && !hasOpenedBefore) {
        setHasOpenedBefore(true);
      }
      return newState;
    });
  };

  useEffect(() => {
    const handleResize = () => {
      if (chatRef.current) {
        const maxHeight = window.innerHeight - 100;
        setWindowHeight(Math.min(maxHeight, 400));
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // initial
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleChat}
          className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg focus:outline-none"
        >
          <Bot className="h-5 w-5" />
        </button>
      </div>

      {isOpen && (
        <div
          ref={chatRef}
          style={{ height: windowHeight }}
          className="fixed bottom-20 right-6 z-50 w-80 max-w-[90vw] bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col overflow-hidden"
        >
          <ChatWindow onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
};

export default FloatingChatButton;
