import { useEffect, useRef, useCallback } from 'react';

interface UseAutoSaveOptions {
  delay?: number; // milliseconds
  onSave: (value: string) => void | Promise<void>;
}

export function useAutoSave(value: string, { delay = 1000, onSave }: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousValueRef = useRef(value);
  const isSavingRef = useRef(false);

  const save = useCallback(async (valueToSave: string) => {
    if (isSavingRef.current) return;

    isSavingRef.current = true;
    try {
      await onSave(valueToSave);
      previousValueRef.current = valueToSave;
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave]);

  useEffect(() => {
    // Skip if value hasn't changed
    if (value === previousValueRef.current) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      save(value);
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, save]);

  // Save immediately on unmount if there are unsaved changes
  useEffect(() => {
    return () => {
      if (value !== previousValueRef.current && !isSavingRef.current) {
        onSave(value);
      }
    };
  }, [value, onSave]);

  return {
    isSaving: isSavingRef.current,
  };
}
