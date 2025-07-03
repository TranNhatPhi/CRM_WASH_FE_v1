// Service Cache Manager for fast loading
export class ServiceCacheManager {
    private static instance: ServiceCacheManager;
    private cache: Map<string, any> = new Map();
    private cacheExpiry: Map<string, number> = new Map();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    static getInstance(): ServiceCacheManager {
        if (!ServiceCacheManager.instance) {
            ServiceCacheManager.instance = new ServiceCacheManager();
        }
        return ServiceCacheManager.instance;
    }

    // Get cached data
    get(key: string): any | null {
        const now = Date.now();
        const expiry = this.cacheExpiry.get(key);

        if (expiry && now > expiry) {
            this.cache.delete(key);
            this.cacheExpiry.delete(key);
            return null;
        }

        return this.cache.get(key) || null;
    }

    // Set cache data
    set(key: string, data: any): void {
        const now = Date.now();
        this.cache.set(key, data);
        this.cacheExpiry.set(key, now + this.CACHE_DURATION);
    }

    // Clear cache
    clear(): void {
        this.cache.clear();
        this.cacheExpiry.clear();
    }

    // Preload services in background
    async preloadServices(): Promise<void> {
        try {
            const response = await fetch('/api/services', {
                method: 'GET',
                headers: {
                    'Cache-Control': 'max-age=300', // Cache for 5 minutes
                },
            });

            if (response.ok) {
                const result = await response.json();
                if (result.statusCode === 200 && result.data) {
                    this.set('services', result.data);

                    // Also store in localStorage for persistence
                    localStorage.setItem('services-cache', JSON.stringify({
                        data: result.data,
                        timestamp: Date.now()
                    }));
                }
            }
        } catch (error) {
            console.warn('Failed to preload services:', error);
        }
    }

    // Get services from cache or localStorage
    getServicesFromCache(): any[] | null {
        // Try memory cache first
        const memoryCache = this.get('services');
        if (memoryCache) {
            return memoryCache;
        }

        // Try localStorage
        try {
            const stored = localStorage.getItem('services-cache');
            if (stored) {
                const parsed = JSON.parse(stored);
                const now = Date.now();

                // Check if localStorage cache is still valid (5 minutes)
                if (parsed.timestamp && (now - parsed.timestamp) < this.CACHE_DURATION) {
                    this.set('services', parsed.data); // Update memory cache
                    return parsed.data;
                } else {
                    localStorage.removeItem('services-cache');
                }
            }
        } catch (error) {
            console.warn('Failed to read services from localStorage:', error);
        }

        return null;
    }
}

// Service loader with optimized fetching
export class ServiceLoader {
    private static instance: ServiceLoader;
    private cacheManager: ServiceCacheManager;
    private isLoading: boolean = false;
    private loadPromise: Promise<any> | null = null;

    constructor() {
        this.cacheManager = ServiceCacheManager.getInstance();
    }

    static getInstance(): ServiceLoader {
        if (!ServiceLoader.instance) {
            ServiceLoader.instance = new ServiceLoader();
        }
        return ServiceLoader.instance;
    }

    // Fast load with cache-first approach
    async loadServices(): Promise<{
        services: any[];
        fromCache: boolean;
        error?: string;
    }> {
        // Try cache first
        const cachedServices = this.cacheManager.getServicesFromCache();
        if (cachedServices) {
            // Start background refresh but don't wait for it
            this.refreshInBackground();
            return {
                services: cachedServices,
                fromCache: true
            };
        }

        // If already loading, return the existing promise
        if (this.isLoading && this.loadPromise) {
            return await this.loadPromise;
        }

        // Start fresh load
        this.isLoading = true;
        this.loadPromise = this.fetchServicesFromAPI();

        try {
            const result = await this.loadPromise;
            return result;
        } finally {
            this.isLoading = false;
            this.loadPromise = null;
        }
    }

    private async fetchServicesFromAPI(): Promise<{
        services: any[];
        fromCache: boolean;
        error?: string;
    }> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const response = await fetch('/api/services', {
                signal: controller.signal,
                headers: {
                    'Cache-Control': 'no-cache',
                },
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.statusCode === 200 && result.data) {
                // Cache the result
                this.cacheManager.set('services', result.data);

                // Also store in localStorage
                localStorage.setItem('services-cache', JSON.stringify({
                    data: result.data,
                    timestamp: Date.now()
                }));

                return {
                    services: result.data,
                    fromCache: false
                };
            } else {
                throw new Error(result.message || 'Failed to fetch services');
            }
        } catch (error) {
            console.error('Error fetching services:', error);

            // Try to return stale cache as fallback
            const staleCache = this.tryStaleCache();
            if (staleCache) {
                return {
                    services: staleCache,
                    fromCache: true,
                    error: `Using cached data. ${error instanceof Error ? error.message : 'Network error'}`
                };
            }

            return {
                services: [],
                fromCache: false,
                error: error instanceof Error ? error.message : 'Failed to load services'
            };
        }
    }

    private tryStaleCache(): any[] | null {
        try {
            const stored = localStorage.getItem('services-cache');
            if (stored) {
                const parsed = JSON.parse(stored);
                return parsed.data || null;
            }
        } catch (error) {
            console.warn('Failed to read stale cache:', error);
        }
        return null;
    }

    private async refreshInBackground(): Promise<void> {
        // Refresh cache in background without blocking UI
        setTimeout(async () => {
            try {
                await this.fetchServicesFromAPI();
            } catch (error) {
                console.warn('Background refresh failed:', error);
            }
        }, 100);
    }

    // Initialize service worker for caching
    initializeServiceWorker(): void {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(() => {
                    console.log('Service Worker registered for caching');
                })
                .catch((error) => {
                    console.warn('Service Worker registration failed:', error);
                });
        }
    }
}

// Utility function to group services by category
export function groupServicesByCategory(services: any[]): any {
    return {
        WASHES: services.filter((s: any) => s.category === 'WASHES') || [],
        DETAILING: services.filter((s: any) => s.category === 'DETAILING') || [],
        ADDONS: services.filter((s: any) => s.category === 'ADDONS') || [],
        NEW_CAR_PROTECTION: services.filter((s: any) => s.category === 'NEW_CAR_PROTECTION') || []
    };
}
