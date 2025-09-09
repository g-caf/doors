import { useState, useCallback } from 'react';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  message?: string;
}

interface RateLimitState {
  attempts: number;
  windowStart: number;
  isLimited: boolean;
}

export function useRateLimit({ maxAttempts, windowMs, message }: RateLimitConfig) {
  const [state, setState] = useState<RateLimitState>({
    attempts: 0,
    windowStart: Date.now(),
    isLimited: false,
  });

  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    
    // Reset window if time has passed
    if (now - state.windowStart >= windowMs) {
      setState({
        attempts: 0,
        windowStart: now,
        isLimited: false,
      });
      return false;
    }

    // Check if we've exceeded the limit
    if (state.attempts >= maxAttempts) {
      setState(prev => ({ ...prev, isLimited: true }));
      return true;
    }

    return false;
  }, [state, maxAttempts, windowMs]);

  const increment = useCallback(() => {
    const now = Date.now();
    
    setState(prev => {
      // Reset if window has passed
      if (now - prev.windowStart >= windowMs) {
        return {
          attempts: 1,
          windowStart: now,
          isLimited: false,
        };
      }
      
      const newAttempts = prev.attempts + 1;
      return {
        ...prev,
        attempts: newAttempts,
        isLimited: newAttempts >= maxAttempts,
      };
    });
  }, [maxAttempts, windowMs]);

  const reset = useCallback(() => {
    setState({
      attempts: 0,
      windowStart: Date.now(),
      isLimited: false,
    });
  }, []);

  const timeUntilReset = state.isLimited 
    ? Math.max(0, windowMs - (Date.now() - state.windowStart))
    : 0;

  return {
    isLimited: state.isLimited,
    attempts: state.attempts,
    checkRateLimit,
    increment,
    reset,
    timeUntilReset,
    message: message || `Too many attempts. Please wait ${Math.ceil(timeUntilReset / 1000)} seconds.`,
  };
}
