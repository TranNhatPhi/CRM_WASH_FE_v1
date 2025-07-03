// Performance Test Component for Service Cache
import React, { useState } from 'react';
import { testCachePerformance, testCacheReliability, testOfflineFunctionality } from '@/utils/test-service-cache';

interface PerformanceTestProps {
  isDarkMode: boolean;
}

export default function PerformanceTest({ isDarkMode }: PerformanceTestProps) {
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [testType, setTestType] = useState<'performance' | 'reliability' | 'offline'>('performance');

  const runTest = async () => {
    setIsRunning(true);
    setTestResults(null);
    
    try {
      let results;
      switch (testType) {
        case 'performance':
          results = await testCachePerformance();
          break;
        case 'reliability':
          results = await testCacheReliability();
          break;
        case 'offline':
          results = await testOfflineFunctionality();
          break;
      }
      setTestResults(results);
    } catch (error) {
      console.error('Test failed:', error);
      setTestResults({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-600 text-gray-100' 
        : 'bg-white border-gray-300 text-gray-900'
    }`}>
      <h3 className="text-lg font-bold mb-4">🧪 Service Cache Performance Test</h3>
      
      {/* Test Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Test Type:</label>
        <select
          value={testType}
          onChange={(e) => setTestType(e.target.value as any)}
          className={`w-full p-2 rounded border ${
            isDarkMode 
              ? 'bg-gray-700 border-gray-500 text-gray-100' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="performance">Performance Test</option>
          <option value="reliability">Reliability Test</option>
          <option value="offline">Offline Test</option>
        </select>
      </div>

      {/* Run Test Button */}
      <button
        onClick={runTest}
        disabled={isRunning}
        className={`w-full py-2 px-4 rounded font-medium transition-colors ${
          isRunning
            ? isDarkMode
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : isDarkMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {isRunning ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
            Running Test...
          </div>
        ) : (
          'Run Test'
        )}
      </button>

      {/* Test Results */}
      {testResults && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Test Results:</h4>
          {testResults.error ? (
            <div className={`p-3 rounded ${
              isDarkMode ? 'bg-red-900/40 text-red-300' : 'bg-red-100 text-red-800'
            }`}>
              <strong>Error:</strong> {testResults.error}
            </div>
          ) : (
            <div className={`p-3 rounded text-sm font-mono ${
              isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-800'
            }`}>
              {testType === 'performance' && (
                <div className="space-y-2">
                  <div>🔵 Cold Start: {testResults.coldStart?.toFixed(2)}ms</div>
                  <div>🟢 Warm Cache: {testResults.warmCache?.toFixed(2)}ms</div>
                  <div>🔴 Network Fetch: {testResults.networkFetch?.toFixed(2)}ms</div>
                  <div>📊 Cache Hit Rate: {testResults.cacheHitRate?.toFixed(1)}%</div>
                  <div className="border-t pt-2">
                    <strong>
                      Performance Improvement: {
                        ((testResults.networkFetch - testResults.warmCache) / testResults.networkFetch * 100).toFixed(1)
                      }%
                    </strong>
                  </div>
                </div>
              )}
              {testType === 'reliability' && (
                <div>Check console for detailed reliability test results</div>
              )}
              {testType === 'offline' && (
                <div>Check console for offline functionality test results</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className={`mt-4 p-3 rounded text-sm ${
        isDarkMode ? 'bg-blue-900/40 text-blue-300' : 'bg-blue-100 text-blue-800'
      }`}>
        <strong>💡 Tip:</strong> Open browser console to see detailed test logs and performance metrics.
      </div>
    </div>
  );
}
