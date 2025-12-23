/**
 * useLongPress Hook
 * Triggers a callback after holding down for a specified duration (default 800ms)
 * Returns handlers for mouse and touch events
 */

import { useCallback, useRef, useEffect } from 'react';

export const useLongPress = (
  onLongPress: () => void,
  duration: number = 800
) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onLongPressRef = useRef(onLongPress);

  // Keep the latest callback in a ref to avoid recreating handlers when it changes
  useEffect(() => {
    onLongPressRef.current = onLongPress;
  }, [onLongPress]);

  const start = useCallback(() => {
    // Long press timer
    timerRef.current = setTimeout(() => {
      onLongPressRef.current();
      cancel();
    }, duration);
  }, [duration]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel,
  };
};
