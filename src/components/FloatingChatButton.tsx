import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare } from 'lucide-react';
import ChatWindow from './ChatWindow'; // Assuming your chat UI
import clsx from 'clsx';

const MIN_WIDTH = 300;
const MIN_HEIGHT = 200;

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [width, setWidth] = useState(360);
  const [height, setHeight] = useState(420);

  const resizing = useRef(false);
  const lastMouse = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    resizing.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!resizing.current) return;
    const dx = e.clientX - lastMouse.current.x;
    const dy = e.clientY - lastMouse.current.y;
    setWidth(prev => Math.max(MIN_WIDTH, prev + dx));
    setHeight(prev => Math.max(MIN_HEIGHT, prev + dy));
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    resizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition"
        >
          <MessageSquare className="h-5 w-5" />
        </button>
      </div>

      {isOpen && (
        <div
          className="fixed bottom-20 right-6 z-50 bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col"
          style={{ width, height }}
        >
          <ChatWindow onClose={() => setIsOpen(false)} />
          {/* Drag Handle */}
          <div
            onMouseDown={handleMouseDown}
            className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize"
            style={{
              background: `
                linear-gradient(135deg, transparent 25%, #ccc 25%, #ccc 50%, transparent 50%, transparent 75%, #ccc 75%, #ccc)
              `,
              backgroundSize: '8px 8px'
            }}
          />
        </div>
      )}
    </>
  );
}
