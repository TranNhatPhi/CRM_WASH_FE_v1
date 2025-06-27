'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';

interface VirtualScrollingOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

interface VirtualScrollingResult<T> {
  virtualItems: Array<{
    index: number;
    item: T;
    style: React.CSSProperties;
  }>;
  totalHeight: number;
  scrollToIndex: (index: number) => void;
  containerProps: {
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
    style: React.CSSProperties;
  };
}

export function useVirtualScrolling<T>(
  items: T[],
  options: VirtualScrollingOptions
): VirtualScrollingResult<T> {
  const { itemHeight, containerHeight, overscan = 5 } = options;
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  const totalHeight = items.length * itemHeight;

  const visibleRange = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    const startIndex = Math.max(0, visibleStart - overscan);
    const endIndex = Math.min(items.length - 1, visibleEnd + overscan);

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const virtualItems = useMemo(() => {
    const result = [];
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      result.push({
        index: i,
        item: items[i],
        style: {
          position: 'absolute' as const,
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight,
        },
      });
    }
    return result;
  }, [visibleRange, items, itemHeight]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    if (containerRef) {
      const targetScrollTop = index * itemHeight;
      containerRef.scrollTop = targetScrollTop;
      setScrollTop(targetScrollTop);
    }
  }, [containerRef, itemHeight]);

  const containerProps = {
    onScroll: handleScroll,
    style: {
      height: containerHeight,
      overflowY: 'auto' as const,
      position: 'relative' as const,
    },
  };

  return {
    virtualItems,
    totalHeight,
    scrollToIndex,
    containerProps,
  };
}

// Hook for responsive item heights
export function useResponsiveItemHeight() {
  const [itemHeight, setItemHeight] = useState(180); // Default height

  useEffect(() => {
    const updateItemHeight = () => {
      if (window.innerWidth < 640) { // sm breakpoint
        setItemHeight(160); // Smaller height for mobile
      } else if (window.innerWidth < 1024) { // lg breakpoint
        setItemHeight(170); // Medium height for tablets
      } else {
        setItemHeight(180); // Full height for desktop
      }
    };

    updateItemHeight();
    window.addEventListener('resize', updateItemHeight);
    return () => window.removeEventListener('resize', updateItemHeight);
  }, []);

  return itemHeight;
}
