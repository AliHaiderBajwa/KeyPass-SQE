import { useState, useCallback, useRef, useEffect } from 'react';

// NFR2: Clipboard must clear passwords after exactly 10 seconds
const CLIPBOARD_CLEAR_DELAY = 10000; // 10 seconds in milliseconds

export function useClipboard() {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const clearClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText('');
      setCopiedText(null);
      setTimeRemaining(0);
    } catch (err) {
      console.error('Failed to clear clipboard:', err);
    }
  }, []);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeRemaining(CLIPBOARD_CLEAR_DELAY / 1000);
      
      // Clear any existing timers
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
      
      // Start countdown
      countdownRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            if (countdownRef.current) clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Set timer to clear clipboard after 10 seconds
      timerRef.current = setTimeout(() => {
        clearClipboard();
        if (countdownRef.current) clearInterval(countdownRef.current);
      }, CLIPBOARD_CLEAR_DELAY);
      
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  }, [clearClipboard]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  return {
    copiedText,
    timeRemaining,
    copyToClipboard,
    clearClipboard
  };
}
