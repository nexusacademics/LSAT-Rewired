// hooks/useTimer.ts
import { useState, useEffect, useCallback } from 'react';

interface UseTimerProps {
  initialTime: number;
  isRunning: boolean;
  onTimeUp: () => void;
  phase: string;
}

export const useTimer = ({ initialTime, isRunning, onTimeUp, phase }: UseTimerProps) => {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);

  useEffect(() => {
    if (phase === 'timed') {
      setTimeRemaining(initialTime);
    }
  }, [initialTime, phase]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && phase === 'timed' && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            onTimeUp();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, phase, timeRemaining, onTimeUp]);

    const resetTimer = useCallback(() => {
  setTimeRemaining(initialTime);
}, [initialTime]);

  const getTimeDisplay = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeRemaining <= 60) return 'text-red-600';
    if (timeRemaining <= 300) return 'text-orange-600';
    return 'text-slate-900';
  };

  const getTimerBgColor = () => {
    if (timeRemaining <= 60) return 'bg-red-100';
    if (timeRemaining <= 300) return 'bg-orange-100';
    return '';
  };


  
  return {
    timeRemaining,
    getTimeDisplay,
    getTimerColor,
    getTimerBgColor,
    resetTimer,  
  };
};