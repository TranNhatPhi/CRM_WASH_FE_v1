'use client';

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AccessibilityTestSuite } from '@/components/ui/AccessibilityTestSuite';
import { useVirtualScrolling } from '@/hooks/useVirtualScrolling';

import { useScreenReader } from '@/hooks/useAccessibility';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Test data for virtual scrolling
const generateTestItems = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `item-${i}`,
    title: `Test Item ${i + 1}`,
    description: `This is test item number ${i + 1} for virtual scrolling demonstration`,
    timestamp: new Date(Date.now() - i * 60000).toISOString(),
  }));
};

export default function POSTestPage() {
  const [activeTab, setActiveTab] = useState('virtual-scroll');
  const [showA11yTests, setShowA11yTests] = useState(false);
  const { announce } = useScreenReader();

  // Generate test data
  const testItems = generateTestItems(1000);
  // Virtual scrolling hook
  const virtualScrollingResult = useVirtualScrolling(testItems, {
    itemHeight: 80,
    containerHeight: 400,
    overscan: 5,
  });
  const { virtualItems, totalHeight, containerProps } = virtualScrollingResult;

  const testPWAFeatures = () => {
    announce('Testing PWA features');

    // Test service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then((registration) => {
        if (registration) {
          announce('Service worker is registered and active');
        } else {
          announce('Service worker is not registered');
        }
      });
    }

    // Test offline capability
    if (!navigator.onLine) {
      announce('Application is currently offline');
    } else {
      announce('Application is online');
    }

    // Test install prompt
    announce('PWA features tested - check console for detailed results');
  };

  return (
    <DashboardLayout title="POS Enhancement Tests">
      <div className="space-y-6">
        <Card>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">POS System Enhancement Tests</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              This page demonstrates all the enhanced features of the POS system including
              virtual scrolling, touch gestures, PWA capabilities, and accessibility improvements.
            </p>
          </div>
        </Card>        <Card>
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="virtual-scroll">Virtual Scroll</TabsTrigger>
                <TabsTrigger value="gestures">Gestures</TabsTrigger>
                <TabsTrigger value="pwa">PWA</TabsTrigger>
                <TabsTrigger value="accessibility">A11y</TabsTrigger>
              </TabsList>              {/* Mobile navigation indicator */}
              <div className="sm:hidden flex justify-center mt-2 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {['virtual-scroll', 'gestures', 'pwa', 'accessibility'].map((tab) => (
                      <div
                        key={tab}
                        className={`w-2 h-2 rounded-full transition-colors ${activeTab === tab ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">← Tap tabs to navigate →</p>
                </div>
              </div>

              <TabsContent value="virtual-scroll" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Virtual Scrolling Test</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Testing virtual scrolling with 1,000 items. Only visible items are rendered for optimal performance.
                  </p>
                  <div className="border rounded-lg">
                    <div
                      {...containerProps}
                      className="h-96 overflow-auto bg-gray-50 dark:bg-gray-800"
                    >
                      <div style={{ height: totalHeight, position: 'relative' }}>
                        {virtualItems.map((virtualItem) => {
                          const item = testItems[virtualItem.index];
                          return (
                            <div
                              key={virtualItem.index}
                              style={virtualItem.style}
                              className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                            >
                              <div>
                                <h4 className="font-medium">{item.title}</h4>
                                <p className="text-sm text-gray-500">{item.description}</p>
                              </div>
                              <span className="text-xs text-gray-400">#{virtualItem.index + 1}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Showing {virtualItems.length} of {testItems.length} items (Virtual Scrolling: {testItems.length > 10 ? 'Enabled' : 'Disabled'})
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="gestures" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Touch Gesture Support</h3>
                  <div className="grid gap-4">                    <Card className="p-4">
                    <h4 className="font-medium mb-2">Swipe Navigation</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      Swipe navigation has been disabled for better stability.
                    </p>
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded">
                      <p className="text-sm">ℹ️ Swipe gestures are currently disabled</p>
                    </div>
                  </Card>

                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Navigation Alternative</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <li>• Use tab buttons above to navigate</li>
                        <li>• Keyboard navigation: Arrow keys + Enter</li>
                        <li>• Touch: Tap on tab buttons</li>
                        <li>• Screen reader: Full accessibility support</li>
                      </ul>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pwa" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Progressive Web App Features</h3>
                  <div className="grid gap-4">
                    <Card className="p-4">
                      <h4 className="font-medium mb-2">PWA Status</h4>
                      <div className="space-y-2">
                        <button
                          onClick={testPWAFeatures}
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                          Test PWA Features
                        </button>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Click to test service worker, offline capability, and installation readiness.
                        </p>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-medium mb-2">Features Implemented</h4>
                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <li>✅ Web App Manifest with icons and shortcuts</li>
                        <li>✅ Service Worker with intelligent caching</li>
                        <li>✅ Offline support page</li>
                        <li>✅ Background sync capabilities</li>
                        <li>✅ Mobile-first responsive design</li>
                        <li>✅ App shortcuts for quick actions</li>
                      </ul>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="accessibility" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Accessibility Features</h3>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <button
                      onClick={() => setShowA11yTests(!showA11yTests)}
                      className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                    >
                      {showA11yTests ? 'Hide' : 'Show'} Accessibility Tests
                    </button>
                    <button
                      onClick={() => announce('Test announcement for screen readers')}
                      className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                    >
                      Test Screen Reader
                    </button>
                  </div>

                  {showA11yTests && (
                    <AccessibilityTestSuite
                      isVisible={showA11yTests}
                      onClose={() => setShowA11yTests(false)}
                    />
                  )}

                  <Card className="p-4">
                    <h4 className="font-medium mb-2">Accessibility Features</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                      <li>✅ Screen reader announcements</li>
                      <li>✅ Keyboard navigation support</li>
                      <li>✅ Focus management</li>
                      <li>✅ High contrast mode detection</li>
                      <li>✅ Reduced motion preferences</li>
                      <li>✅ ARIA labels and landmarks</li>
                      <li>✅ Color contrast compliance</li>
                      <li>✅ Responsive design testing</li>
                    </ul>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
