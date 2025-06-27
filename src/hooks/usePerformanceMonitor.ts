'use client';

import { useEffect, useRef, useState } from 'react';

export interface PerformanceMetrics {
  fps: number;
  renderTime: number;
  memoryUsage: number;
  scrollPerformance: number;
}

export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 0,
    renderTime: 0,
    memoryUsage: 0,
    scrollPerformance: 0,
  });

  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const renderTimes = useRef<number[]>([]);

  useEffect(() => {
    let animationFrame: number;

    const measureFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();

      if (currentTime - lastTime.current >= 1000) {
        const fps = Math.round(frameCount.current * 1000 / (currentTime - lastTime.current));

        setMetrics(prev => ({ ...prev, fps }));

        frameCount.current = 0;
        lastTime.current = currentTime;
      }

      animationFrame = requestAnimationFrame(measureFPS);
    };

    animationFrame = requestAnimationFrame(measureFPS);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  const measureRenderTime = (callback: () => void): number => {
    const startTime = performance.now();
    callback();
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    renderTimes.current.push(renderTime);
    if (renderTimes.current.length > 10) {
      renderTimes.current.shift();
    }

    const averageRenderTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;
    setMetrics(prev => ({ ...prev, renderTime: averageRenderTime }));

    return renderTime;
  };

  const measureScrollPerformance = (scrollContainer: HTMLElement) => {
    let scrollStartTime = 0;
    let scrollCount = 0;

    const handleScrollStart = () => {
      scrollStartTime = performance.now();
      scrollCount = 0;
    };

    const handleScroll = () => {
      scrollCount++;

      const scrollTime = performance.now() - scrollStartTime;
      if (scrollTime > 0) {
        const scrollPerformance = 1000 / scrollTime; // Events per second
        setMetrics(prev => ({ ...prev, scrollPerformance }));
      }
    };

    scrollContainer.addEventListener('touchstart', handleScrollStart);
    scrollContainer.addEventListener('scroll', handleScroll);

    return () => {
      scrollContainer.removeEventListener('touchstart', handleScrollStart);
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  };

  return {
    metrics,
    measureRenderTime,
    measureScrollPerformance,
  };
}

export default usePerformanceMonitor;
