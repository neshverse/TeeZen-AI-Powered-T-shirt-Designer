import { useState, useCallback } from 'react';

export function useHistory<T>(initialState: T) {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // The current state is always history[currentIndex]
  const state = history[currentIndex];

  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    setHistory((prevHistory) => {
      const current = prevHistory[currentIndex];
      const resolvedState = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(current) 
        : newState;

      // PERFORMANCE FIX: 
      // Removed JSON.stringify deep comparison. 
      // It causes infinite freezes/crashes when state contains large Base64 images.
      // We accept that some duplicate states might enter history for the sake of stability.
      
      // Limit history stack size to prevent memory leaks (keep last 50 steps)
      const MAX_HISTORY = 50;
      const newHistory = prevHistory.slice(0, currentIndex + 1);
      
      const updatedHistory = [...newHistory, resolvedState];
      
      if (updatedHistory.length > MAX_HISTORY) {
         return updatedHistory.slice(updatedHistory.length - MAX_HISTORY);
      }
      
      return updatedHistory;
    });
    
    // We update index based on the *new* length logic
    setCurrentIndex((prev) => {
        const MAX_HISTORY = 50;
        // If we were at the end, we just increment. 
        // If we sliced, we are at the end.
        // If we capped at MAX_HISTORY, we are at MAX_HISTORY - 1
        const theoreticalLength = prev + 1; // Not accurate due to slice above inside setHistory setter
        // Safer to just let React render cycle handle the index update logic implicitly, 
        // but since we need to couple them, we assume strict addition here.
        // To be perfectly safe with the max history limit:
        return Math.min(prev + 1, MAX_HISTORY - 1);
    });
  }, [currentIndex]);

  const undo = useCallback(() => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const redo = useCallback(() => {
    setCurrentIndex((prev) => Math.min(history.length - 1, prev + 1));
  }, [history.length]);

  return {
    state,
    set: setState,
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    history
  };
}