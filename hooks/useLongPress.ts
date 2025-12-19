/**
 * useLongPress Hook
 * Triggers a callback after holding down for a specified duration (default 800ms)
 * Returns handlers for mouse and touch events
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export const useLongPress = (
  onLongPress: () => void,
  duration: number = 800
) => {
  const [isPressed, setIsPressed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setIsPressed(true);
    
    // Long press timer
    timerRef.current = setTimeout(() => {
      onLongPress();
      cancel();
    }, duration);
  }, [onLongPress, duration]);

  const cancel = useCallback(() => {
    setIsPressed(false);
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel,
    isPressed,
  };
};
