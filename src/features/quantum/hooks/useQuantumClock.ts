import { useState, useEffect, useCallback } from 'react';

export const useQuantumClock = (onRefresh: () => void) => {
  const [clock, setClock] = useState('--:--:--');
  const [refreshCountdown, setRefreshCountdown] = useState(30);

  const formatTime = useCallback((date: Date) => {
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setClock(formatTime(now));
      
      setRefreshCountdown(prev => {
        if (prev <= 1) {
          onRefresh();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [formatTime, onRefresh]);

  return {
    clock,
    refreshCountdown
  };
};
