'use client';

import { useEffect, useState, useCallback } from 'react';

// Hook for managing focus states and keyboard navigation
export function useAccessibleNavigation() {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [items, setItems] = useState<HTMLElement[]>([]);

  const updateFocusableItems = useCallback(() => {
    const focusableElements = document.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    setItems(Array.from(focusableElements) as HTMLElement[]);
  }, []);

  useEffect(() => {
    updateFocusableItems();
    window.addEventListener('resize', updateFocusableItems);
    return () => window.removeEventListener('resize', updateFocusableItems);
  }, [updateFocusableItems]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (items.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        event.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + items.length) % items.length);
        break;
      case 'Home':
        event.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setFocusedIndex(items.length - 1);
        break;
      case 'Enter':
      case ' ':
        if (items[focusedIndex]) {
          items[focusedIndex].click();
        }
        break;
    }
  }, [items, focusedIndex]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (items[focusedIndex]) {
      items[focusedIndex].focus();
    }
  }, [focusedIndex, items]);

  return {
    focusedIndex,
    setFocusedIndex,
    updateFocusableItems,
  };
}

// Hook for screen reader announcements
export function useScreenReader() {
  const [liveRegion, setLiveRegion] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create live region for screen reader announcements
    const region = document.createElement('div');
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.style.position = 'absolute';
    region.style.left = '-10000px';
    region.style.width = '1px';
    region.style.height = '1px';
    region.style.overflow = 'hidden';
    document.body.appendChild(region);
    setLiveRegion(region);

    return () => {
      if (region.parentNode) {
        region.parentNode.removeChild(region);
      }
    };
  }, []);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (liveRegion) {
      liveRegion.setAttribute('aria-live', priority);
      liveRegion.textContent = message;

      // Clear the message after a short delay to allow for repeated announcements
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  }, [liveRegion]);

  return { announce };
}

// Hook for high contrast mode detection
export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const checkHighContrast = () => {
      // Check for Windows high contrast mode
      const highContrastMedia = window.matchMedia('(prefers-contrast: high)');
      setIsHighContrast(highContrastMedia.matches);
    };

    checkHighContrast();

    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    mediaQuery.addEventListener('change', checkHighContrast);

    return () => mediaQuery.removeEventListener('change', checkHighContrast);
  }, []);

  return isHighContrast;
}

// Hook for reduced motion detection
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

// Hook for color scheme detection
export function useColorScheme() {
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setColorScheme(mediaQuery.matches ? 'dark' : 'light');

    const handler = (event: MediaQueryListEvent) => {
      setColorScheme(event.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return colorScheme;
}

// Hook for focus management
export function useFocusManagement() {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    setFocusedElement(document.activeElement as HTMLElement);
  }, []);

  const restoreFocus = useCallback(() => {
    if (focusedElement && focusedElement.focus) {
      focusedElement.focus();
    }
  }, [focusedElement]);

  const trapFocus = useCallback((containerElement: HTMLElement) => {
    const focusableElements = containerElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    containerElement.addEventListener('keydown', handleKeyDown);

    return () => {
      containerElement.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return {
    saveFocus,
    restoreFocus,
    trapFocus,
  };
}

// Accessibility utilities
export const a11y = {
  // Generate unique IDs for form elements
  generateId: (prefix: string = 'element') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  },
  // Format currency for screen readers
  formatCurrencyForScreenReader: (amount: number) => {
    return `${amount} Australian dollars`;
  },

  // Format time for screen readers
  formatTimeForScreenReader: (date: Date) => {
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
  },

  // Get ARIA label for status
  getStatusAriaLabel: (status: string) => {
    const statusLabels: Record<string, string> = {
      pending: 'Status: Pending',
      'in-progress': 'Status: In Progress',
      completed: 'Status: Completed',
      cancelled: 'Status: Cancelled',
    };
    return statusLabels[status] || `Status: ${status}`;
  },

  // Get ARIA description for interactive elements
  getInteractionHint: (action: string) => {
    const hints: Record<string, string> = {
      button: 'Press Enter or Space to activate',
      link: 'Press Enter to follow link',
      tab: 'Use arrow keys to navigate tabs',
      menu: 'Use arrow keys to navigate menu items',
      dropdown: 'Press Enter to open, use arrow keys to navigate',
    };
    return hints[action] || '';
  },
};
