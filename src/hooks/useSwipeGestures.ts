'use client';

import { useCallback, useRef, useState } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void; 
}

interface SwipeOptions {
  threshold?: number; // Minimum distance for swipe (default: 50px)
  preventDefaultTouchmoveEvent?: boolean;
  trackMouse?: boolean; // Track mouse events for desktop testing
}

interface TouchPoint {
  x: number;
  y: number;
  time: number;
}

export function useSwipeGestures(
  handlers: SwipeHandlers,
  options: SwipeOptions = {}
) {
  const {
    threshold = 50,
    preventDefaultTouchmoveEvent = false,
    trackMouse = false,
  } = options;

  const [isSwiping, setIsSwiping] = useState(false);
  const startPoint = useRef<TouchPoint | null>(null);
  const currentPoint = useRef<TouchPoint | null>(null);

  const updateTouch = useCallback((x: number, y: number) => {
    const now = Date.now();
    if (!startPoint.current) {
      startPoint.current = { x, y, time: now };
      setIsSwiping(true);
    }
    currentPoint.current = { x, y, time: now };
  }, []);

  const handleSwipe = useCallback(() => {
    if (!startPoint.current || !currentPoint.current) return;

    const deltaX = currentPoint.current.x - startPoint.current.x;
    const deltaY = currentPoint.current.y - startPoint.current.y;
    const deltaTime = currentPoint.current.time - startPoint.current.time;

    // Ignore very slow gestures (> 1 second)
    if (deltaTime > 1000) return;

    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Only handle swipes that exceed the threshold
    if (Math.max(absX, absY) < threshold) return;

    // Determine swipe direction (prioritize the larger delta)
    if (absX > absY) {
      // Horizontal swipe
      if (deltaX > 0) {
        handlers.onSwipeRight?.();
      } else {
        handlers.onSwipeLeft?.();
      }
    } else {
      // Vertical swipe
      if (deltaY > 0) {
        handlers.onSwipeDown?.();
      } else {
        handlers.onSwipeUp?.();
      }
    }
  }, [handlers, threshold]);

  const resetSwipe = useCallback(() => {
    startPoint.current = null;
    currentPoint.current = null;
    setIsSwiping(false);
  }, []);
  // Touch event handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    updateTouch(touch.clientX, touch.clientY);
  }, [updateTouch]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (preventDefaultTouchmoveEvent) {
      e.preventDefault();
    }
    const touch = e.touches[0];
    updateTouch(touch.clientX, touch.clientY);
  }, [updateTouch, preventDefaultTouchmoveEvent]);

  const onTouchEnd = useCallback(() => {
    handleSwipe();
    resetSwipe();
  }, [handleSwipe, resetSwipe]);

  // Mouse event handlers (for desktop testing)
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (!trackMouse) return;
    updateTouch(e.clientX, e.clientY);
  }, [updateTouch, trackMouse]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!trackMouse || !startPoint.current) return;
    updateTouch(e.clientX, e.clientY);
  }, [updateTouch, trackMouse]);

  const onMouseUp = useCallback(() => {
    if (!trackMouse) return;
    handleSwipe();
    resetSwipe();
  }, [handleSwipe, resetSwipe, trackMouse]);

  const onMouseLeave = useCallback(() => {
    if (!trackMouse) return;
    resetSwipe();
  }, [resetSwipe, trackMouse]);
  // Return object with event handlers separated from state
  return {
    // DOM-safe event handlers (can be safely spread onto elements)
    handlers: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onMouseDown,
      onMouseMove,
      onMouseUp,
      onMouseLeave,
    },
    // Component state (should not be spread onto DOM elements)
    state: {
      isSwiping,
    },
    // Individual handlers for compatibility
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
  };
}

// Hook for common navigation patterns
export function useSwipeNavigation() {
  const [currentTab, setCurrentTab] = useState(0);
  const [history, setHistory] = useState<string[]>([]);

  const swipeGestures = useSwipeGestures({
    onSwipeLeft: () => {
      // Navigate to next tab or forward in history
      console.log('Swipe left - next');
    },
    onSwipeRight: () => {
      // Navigate to previous tab or back in history
      console.log('Swipe right - previous');
    },
    onSwipeUp: () => {
      // Scroll up or refresh
      console.log('Swipe up - scroll up');
    },
    onSwipeDown: () => {
      // Scroll down or pull to refresh
      console.log('Swipe down - scroll down');
    },
  });
  return {
    // Use handlers property to avoid spreading state
    ...swipeGestures.handlers,
    currentTab,
    setCurrentTab,
    history,
    setHistory,
  };
}

// Hook for pull-to-refresh functionality
export function usePullToRefresh(onRefresh: () => Promise<void> | void) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const maxPullDistance = 100;
  const refreshThreshold = 60;

  const swipeGestures = useSwipeGestures({
    onSwipeDown: async () => {
      if (pullDistance > refreshThreshold && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      }
    },
  });
  return {
    // Use handlers property to avoid spreading state
    ...swipeGestures.handlers,
    isRefreshing,
    pullDistance,
    maxPullDistance,
    refreshThreshold,
    setPullDistance,
  };
}
