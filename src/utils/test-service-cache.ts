// Performance test for service cache system
import { ServiceLoader, ServiceCacheManager } from '@/lib/service-cache';

// Test cache performance
export async function testCachePerformance() {
  console.log('🚀 Testing Service Cache Performance...');
  
  const serviceLoader = ServiceLoader.getInstance();
  const results = {
    coldStart: 0,
    warmCache: 0,
    networkFetch: 0,
    cacheHitRate: 0,
    errors: 0
  };

  try {
    // Test 1: Cold start (no cache)
    console.log('📊 Test 1: Cold start (no cache)');
    localStorage.removeItem('services-cache');
    ServiceCacheManager.getInstance().clear();
    
    const coldStartTime = performance.now();
    const coldResult = await serviceLoader.loadServices();
    results.coldStart = performance.now() - coldStartTime;
    
    console.log(`Cold start: ${results.coldStart.toFixed(2)}ms, From cache: ${coldResult.fromCache}`);

    // Test 2: Warm cache
    console.log('📊 Test 2: Warm cache');
    const warmStartTime = performance.now();
    const warmResult = await serviceLoader.loadServices();
    results.warmCache = performance.now() - warmStartTime;
    
    console.log(`Warm cache: ${results.warmCache.toFixed(2)}ms, From cache: ${warmResult.fromCache}`);

    // Test 3: Multiple requests (cache hit rate)
    console.log('📊 Test 3: Cache hit rate (10 requests)');
    let cacheHits = 0;
    const testRequests = 10;
    
    for (let i = 0; i < testRequests; i++) {
      const result = await serviceLoader.loadServices();
      if (result.fromCache) cacheHits++;
    }
    
    results.cacheHitRate = (cacheHits / testRequests) * 100;
    console.log(`Cache hit rate: ${results.cacheHitRate.toFixed(1)}%`);

    // Test 4: Network fetch (bypass cache)
    console.log('📊 Test 4: Direct network fetch');
    const networkStartTime = performance.now();
    
    try {
      const response = await fetch('/api/services');
      const networkResult = await response.json();
      results.networkFetch = performance.now() - networkStartTime;
      console.log(`Network fetch: ${results.networkFetch.toFixed(2)}ms`);
    } catch (error) {
      console.warn('Network fetch failed:', error);
      results.errors++;
    }

    // Performance comparison
    console.log('\n📈 Performance Summary:');
    console.log(`Cold start: ${results.coldStart.toFixed(2)}ms`);
    console.log(`Warm cache: ${results.warmCache.toFixed(2)}ms`);
    console.log(`Network fetch: ${results.networkFetch.toFixed(2)}ms`);
    console.log(`Cache hit rate: ${results.cacheHitRate.toFixed(1)}%`);
    
    const improvement = ((results.networkFetch - results.warmCache) / results.networkFetch) * 100;
    console.log(`Performance improvement: ${improvement.toFixed(1)}%`);

    return results;
  } catch (error) {
    console.error('Performance test failed:', error);
    results.errors++;
    return results;
  }
}

// Test cache reliability
export async function testCacheReliability() {
  console.log('🛡️ Testing Cache Reliability...');
  
  const serviceLoader = ServiceLoader.getInstance();
  const cacheManager = ServiceCacheManager.getInstance();
  
  // Test cache expiration
  console.log('📊 Test 1: Cache expiration');
  
  // Set a very old cache
  const oldCacheData = {
    data: [{ id: 1, name: 'Test Service' }],
    timestamp: Date.now() - 10 * 60 * 1000 // 10 minutes ago
  };
  
  localStorage.setItem('services-cache', JSON.stringify(oldCacheData));
  
  const result = await serviceLoader.loadServices();
  console.log(`Expired cache handled: ${!result.fromCache ? '✅' : '❌'}`);

  // Test cache corruption
  console.log('📊 Test 2: Cache corruption');
  localStorage.setItem('services-cache', 'invalid-json');
  
  try {
    const corruptResult = await serviceLoader.loadServices();
    console.log(`Corruption handled: ${corruptResult.services ? '✅' : '❌'}`);
  } catch (error) {
    console.log('Corruption handling failed:', error);
  }

  // Test network failure
  console.log('📊 Test 3: Network failure simulation');
  // This would need to be tested manually by disabling network
  
  // Clean up
  cacheManager.clear();
  localStorage.removeItem('services-cache');
  
  console.log('✅ Reliability tests completed');
}

// Test offline functionality
export async function testOfflineFunctionality() {
  console.log('📱 Testing Offline Functionality...');
  
  const serviceLoader = ServiceLoader.getInstance();
  
  // First, ensure we have cached data
  await serviceLoader.loadServices();
  
  // Simulate offline by checking if we can still get data
  console.log('📊 Test: Offline service availability');
  
  const cachedServices = serviceLoader['cacheManager'].getServicesFromCache();
  console.log(`Offline services available: ${cachedServices ? '✅' : '❌'}`);
  
  if (cachedServices) {
    console.log(`Cached services count: ${cachedServices.length}`);
  }
  
  // Test service worker cache
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    console.log(`Service worker caches: ${cacheNames.length}`);
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const cachedRequests = await cache.keys();
      console.log(`Cache ${cacheName}: ${cachedRequests.length} requests`);
    }
  }
  
  console.log('✅ Offline functionality tests completed');
}

// Run all tests
export async function runAllPerformanceTests() {
  console.log('🚀 Running Complete Performance Test Suite...\n');
  
  const startTime = performance.now();
  
  await testCachePerformance();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testCacheReliability();
  console.log('\n' + '='.repeat(50) + '\n');
  
  await testOfflineFunctionality();
  
  const totalTime = performance.now() - startTime;
  console.log(`\n✅ All tests completed in ${totalTime.toFixed(2)}ms`);
}

// Helper function to run in browser console
(window as any).testServiceCache = {
  performance: testCachePerformance,
  reliability: testCacheReliability,
  offline: testOfflineFunctionality,
  all: runAllPerformanceTests
};

console.log('🧪 Service Cache Test Suite loaded. Run: testServiceCache.all()');
