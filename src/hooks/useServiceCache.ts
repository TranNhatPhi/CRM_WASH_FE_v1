// Hook for preloading services and optimizing performance
import { useEffect, useState } from 'react';
import { ServiceLoader } from '@/lib/service-cache';

export function useServicePreloader() {
  const [isPreloaded, setIsPreloaded] = useState(false);
  const [preloadError, setPreloadError] = useState<string | null>(null);

  useEffect(() => {
    const preloadServices = async () => {
      try {
        const serviceLoader = ServiceLoader.getInstance();
        
        // Preload services in background
        await serviceLoader.loadServices();
        
        setIsPreloaded(true);
        console.log('Services preloaded successfully');
      } catch (error) {
        console.warn('Failed to preload services:', error);
        setPreloadError(error instanceof Error ? error.message : 'Unknown error');
      }
    };

    // Start preloading immediately
    preloadServices();

    // Also listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SERVICES_PRELOADED') {
          console.log('Services preloaded via service worker');
          setIsPreloaded(true);
        }
      });
    }
  }, []);

  return { isPreloaded, preloadError };
}

// Hook for managing service cache
export function useServiceCache() {
  const [cacheStatus, setCacheStatus] = useState<'unknown' | 'cached' | 'fresh'>('unknown');

  const clearCache = async () => {
    try {
      // Clear memory cache
      const serviceLoader = ServiceLoader.getInstance();
      const cacheManager = serviceLoader['cacheManager'];
      if (cacheManager) {
        cacheManager.clear();
      }

      // Clear localStorage
      localStorage.removeItem('services-cache');

      // Clear service worker cache
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel();
        
        messageChannel.port1.onmessage = (event) => {
          if (event.data?.type === 'CACHE_CLEARED') {
            console.log('Service worker cache cleared');
          }
        };

        navigator.serviceWorker.controller.postMessage(
          { type: 'CLEAR_CACHE' },
          [messageChannel.port2]
        );
      }

      setCacheStatus('unknown');
      console.log('All service caches cleared');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const preloadServicesInBackground = async () => {
    try {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel();
        
        messageChannel.port1.onmessage = (event) => {
          if (event.data?.type === 'SERVICES_PRELOADED') {
            console.log('Background preload completed');
            setCacheStatus('cached');
          }
        };

        navigator.serviceWorker.controller.postMessage(
          { type: 'PRELOAD_SERVICES' },
          [messageChannel.port2]
        );
      }
    } catch (error) {
      console.error('Failed to preload services:', error);
    }
  };

  return {
    cacheStatus,
    clearCache,
    preloadServicesInBackground
  };
}

// Hook for monitoring connection and syncing when back online
export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasSynced, setHasSynced] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (!hasSynced) {
        console.log('Back online, syncing services...');
        // Trigger background sync
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then((registration) => {
            // Send message to service worker to refresh data
            if (navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                type: 'REFRESH_SERVICES'
              });
            }
            setHasSynced(true);
            console.log('Background refresh triggered');
          }).catch((error) => {
            console.error('Background refresh failed:', error);
          });
        }
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setHasSynced(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [hasSynced]);

  return { isOnline, hasSynced };
}
