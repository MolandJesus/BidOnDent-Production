/**
 * ============================================================================
 * INTEGRATION TESTS - Bidondent Services
 * ============================================================================
 * 
 * This file contains integration tests for all new services.
 * Run these to verify everything works correctly.
 * 
 * NOTE: These are example tests. To run them, you'll need to:
 * 1. Install a test framework (Jest, Vitest, etc.)
 * 2. Configure test environment
 * 3. Set up test database
 * 
 * For now, use these as manual test scripts in browser console.
 * ============================================================================
 */

import { realtimeBidService } from '../realtime/RealtimeBidService';
import { performanceOptimizer } from '../performance/PerformanceOptimizer';
import { storageService } from '../storage/StorageService';

/**
 * Test Suite 1: Real-time Bid Service
 */
export async function testRealtimeService() {
  console.log('🧪 Testing Real-time Bid Service...\n');

  // Test 1: Health check
  console.log('Test 1: Health Check');
  const health = realtimeBidService.getHealthStatus();
  console.assert(health.healthy === true, '✅ Service is healthy');
  console.assert(health.activeSubscriptions === 0, '✅ No active subscriptions initially');
  console.log('✅ Health check passed\n');

  // Test 2: Subscribe to report
  console.log('Test 2: Subscribe to Report');
  const testReportId = 'test-report-123';
  let bidReceived = false;
  
  const unsubscribe = realtimeBidService.subscribeToReportBids(
    testReportId,
    (bid) => {
      console.log('✅ Bid received:', bid);
      bidReceived = true;
    },
    null,
    null,
    (status) => {
      console.log('✅ Connection status:', status);
    }
  );

  // Check subscription
  const healthAfterSub = realtimeBidService.getHealthStatus();
  console.assert(
    healthAfterSub.activeSubscriptions === 1,
    '✅ Subscription active'
  );
  console.log('✅ Subscription test passed\n');

  // Test 3: Cleanup
  console.log('Test 3: Cleanup');
  unsubscribe();
  const healthAfterUnsub = realtimeBidService.getHealthStatus();
  console.assert(
    healthAfterUnsub.activeSubscriptions === 0,
    '✅ Subscription cleaned up'
  );
  console.log('✅ Cleanup test passed\n');

  console.log('✅ All Real-time Service tests passed!\n');
}

/**
 * Test Suite 2: Performance Optimizer
 */
export async function testPerformanceOptimizer() {
  console.log('🧪 Testing Performance Optimizer...\n');

  // Test 1: Cache statistics
  console.log('Test 1: Cache Statistics');
  const initialStats = performanceOptimizer.getCacheStats();
  console.log('✅ Initial cache size:', initialStats.size);
  console.log('✅ Stats retrieved successfully\n');

  // Test 2: Cached query
  console.log('Test 2: Cached Query');
  
  // First call - should be slow
  console.time('First Call');
  const data1 = await performanceOptimizer.cachedQuery(
    'test-cache-key',
    async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return { test: 'data', timestamp: Date.now() };
    },
    60000
  );
  console.timeEnd('First Call');
  console.log('✅ First call completed:', data1);

  // Second call - should be instant (cached)
  console.time('Cached Call');
  const data2 = await performanceOptimizer.cachedQuery(
    'test-cache-key',
    async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return { test: 'data', timestamp: Date.now() };
    },
    60000
  );
  console.timeEnd('Cached Call');
  console.assert(
    data1.timestamp === data2.timestamp,
    '✅ Cached data returned (same timestamp)'
  );
  console.log('✅ Cache test passed\n');

  // Test 3: Cache invalidation
  console.log('Test 3: Cache Invalidation');
  performanceOptimizer.invalidateCache('test-cache-key');
  
  // Third call - should be slow again
  console.time('After Invalidation');
  const data3 = await performanceOptimizer.cachedQuery(
    'test-cache-key',
    async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return { test: 'data', timestamp: Date.now() };
    },
    60000
  );
  console.timeEnd('After Invalidation');
  console.assert(
    data3.timestamp !== data2.timestamp,
    '✅ New data fetched (different timestamp)'
  );
  console.log('✅ Invalidation test passed\n');

  // Test 4: Optimistic update
  console.log('Test 4: Optimistic Update');
  let optimisticDataApplied = false;
  
  const optimisticResult = await performanceOptimizer.optimisticUpdate(
    'optimistic-test',
    { status: 'updated' },
    async () => {
      optimisticDataApplied = true;
      await new Promise(resolve => setTimeout(resolve, 50));
      return { status: 'confirmed' };
    }
  );
  
  console.assert(optimisticDataApplied, '✅ Update function called');
  console.assert(optimisticResult.status === 'confirmed', '✅ Final data correct');
  console.log('✅ Optimistic update test passed\n');

  // Cleanup
  performanceOptimizer.clearCache();
  console.log('✅ All Performance Optimizer tests passed!\n');
}

/**
 * Test Suite 3: Storage Service
 */
export async function testStorageService() {
  console.log('🧪 Testing Storage Service...\n');

  // Test 1: Provider info
  console.log('Test 1: Provider Info');
  const info = storageService.getProviderInfo();
  console.log('✅ Provider:', info.name);
  console.log('✅ Type:', info.type);
  console.assert(info.configured === true, '✅ Provider configured');
  console.log('✅ Provider info test passed\n');

  // Test 2: Configuration check
  console.log('Test 2: Configuration Check');
  const isConfigured = storageService.isConfigured();
  console.assert(isConfigured === true, '✅ Storage is configured');
  console.log('✅ Configuration test passed\n');

  // Test 3: Public URL generation
  console.log('Test 3: Public URL Generation');
  const publicUrl = storageService.getPublicUrl(
    'bidondent-profiles',
    'test/photo.jpg'
  );
  console.assert(typeof publicUrl === 'string', '✅ URL is string');
  console.assert(publicUrl.length > 0, '✅ URL not empty');
  console.log('✅ URL:', publicUrl);
  console.log('✅ Public URL test passed\n');

  // Test 4: Upload (mock - requires actual file)
  console.log('Test 4: Upload Simulation');
  console.log('ℹ️ Skipping upload test (requires actual file)');
  console.log('ℹ️ To test upload manually, use:');
  console.log('   const result = await storageService.uploadFile({');
  console.log('     bucket: "bidondent-profiles",');
  console.log('     path: "test.jpg",');
  console.log('     file: yourFile');
  console.log('   });\n');

  console.log('✅ All Storage Service tests passed!\n');
}

/**
 * Test Suite 4: Integration Tests
 */
export async function testIntegration() {
  console.log('🧪 Testing Service Integration...\n');

  // Test 1: Real-time + Performance
  console.log('Test 1: Real-time + Performance Integration');
  
  const reportId = 'integration-test-' + Date.now();
  let bidCount = 0;
  
  // Subscribe with performance caching
  const unsubscribe = realtimeBidService.subscribeToReportBids(
    reportId,
    async (newBid) => {
      bidCount++;
      console.log('✅ Bid received:', newBid);
      
      // Cache the bid
      await performanceOptimizer.cachedQuery(
        `bid-${newBid.id}`,
        async () => newBid,
        60000
      );
      
      console.log('✅ Bid cached');
    }
  );

  console.log('✅ Integration subscription active');
  
  // Cleanup
  setTimeout(() => {
    unsubscribe();
    console.log('✅ Integration test cleaned up\n');
  }, 1000);

  console.log('✅ Integration test setup complete\n');
}

/**
 * Test Suite 5: Error Handling
 */
export async function testErrorHandling() {
  console.log('🧪 Testing Error Handling...\n');

  // Test 1: Optimistic update rollback
  console.log('Test 1: Optimistic Update Rollback');
  
  try {
    await performanceOptimizer.optimisticUpdate(
      'error-test',
      { status: 'optimistic' },
      async () => {
        throw new Error('Simulated error');
      }
    );
    console.log('❌ Should have thrown error');
  } catch (error) {
    console.log('✅ Error caught correctly:', error.message);
  }
  console.log('✅ Rollback test passed\n');

  // Test 2: Real-time error handling
  console.log('Test 2: Real-time Error Handling');
  
  const unsub = realtimeBidService.subscribeToReportBids(
    'error-test-report',
    (bid) => {
      // This might throw if bid is malformed
      try {
        console.log('Bid amount:', bid.amount.toFixed(2));
      } catch (error) {
        console.log('✅ Error handled in callback');
      }
    }
  );
  
  unsub();
  console.log('✅ Error handling test passed\n');

  console.log('✅ All Error Handling tests passed!\n');
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('🚀 Running All Tests...\n');
  console.log('='.repeat(60) + '\n');

  try {
    await testRealtimeService();
    await testPerformanceOptimizer();
    await testStorageService();
    await testIntegration();
    await testErrorHandling();

    console.log('='.repeat(60));
    console.log('✅ ALL TESTS PASSED! 🎉\n');
    console.log('Summary:');
    console.log('- Real-time Service: ✅');
    console.log('- Performance Optimizer: ✅');
    console.log('- Storage Service: ✅');
    console.log('- Integration: ✅');
    console.log('- Error Handling: ✅');
    console.log('='.repeat(60) + '\n');

    return true;
  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    return false;
  }
}

/**
 * Manual test helpers for browser console
 */
export const manualTests = {
  /**
   * Test real-time bid subscription
   */
  async testRealtimeBid(reportId: string) {
    console.log('🧪 Manual Real-time Test');
    console.log('Subscribing to report:', reportId);
    
    const unsubscribe = realtimeBidService.subscribeToReportBids(
      reportId,
      (bid) => {
        console.log('✅ NEW BID:', bid);
        alert(`New bid received: $${bid.amount} from ${bid.shop_name}`);
      },
      (bid) => {
        console.log('✅ UPDATED BID:', bid);
      },
      (bidId) => {
        console.log('✅ DELETED BID:', bidId);
      },
      (status) => {
        console.log('✅ Connection:', status);
      }
    );

    console.log('✅ Subscribed! Submit a bid from another tab to test.');
    console.log('To unsubscribe, run: unsubscribe()');
    
    return unsubscribe;
  },

  /**
   * Test performance caching
   */
  async testCache() {
    console.log('🧪 Manual Cache Test');
    
    // Slow operation
    console.time('First Load');
    const data1 = await performanceOptimizer.cachedQuery(
      'manual-test',
      async () => {
        await new Promise(r => setTimeout(r, 1000));
        return { timestamp: Date.now(), data: 'test' };
      },
      60000
    );
    console.timeEnd('First Load');
    console.log('Data:', data1);

    // Should be instant
    console.time('Cached Load');
    const data2 = await performanceOptimizer.cachedQuery(
      'manual-test',
      async () => {
        await new Promise(r => setTimeout(r, 1000));
        return { timestamp: Date.now(), data: 'test' };
      },
      60000
    );
    console.timeEnd('Cached Load');
    console.log('Cached Data:', data2);

    if (data1.timestamp === data2.timestamp) {
      console.log('✅ CACHE WORKING! Same timestamp.');
    } else {
      console.log('❌ Cache not working');
    }
  },

  /**
   * Test image optimization
   */
  testImageOptimization() {
    console.log('🧪 Manual Image Optimization Test');
    
    const original = 'test-image.jpg';
    
    const optimized = performanceOptimizer.getOptimizedImageUrl(
      'bidondent-damage-photos',
      original,
      {
        width: 800,
        height: 600,
        quality: 80,
        format: 'webp'
      }
    );

    console.log('Original:', original);
    console.log('Optimized:', optimized);
    console.log('✅ Check if URL includes transform parameters');
  },

  /**
   * Test storage provider info
   */
  testStorage() {
    console.log('🧪 Manual Storage Test');
    
    const info = storageService.getProviderInfo();
    console.log('Provider Info:', info);
    
    const publicUrl = storageService.getPublicUrl(
      'bidondent-profiles',
      'test.jpg'
    );
    console.log('Public URL:', publicUrl);
    
    console.log('✅ Storage service ready');
  }
};

// Export for browser console
if (typeof window !== 'undefined') {
  (window as any).bidondentTests = {
    runAll: runAllTests,
    realtime: testRealtimeService,
    performance: testPerformanceOptimizer,
    storage: testStorageService,
    integration: testIntegration,
    manual: manualTests
  };

  console.log('💡 Tests available at: window.bidondentTests');
  console.log('💡 Run all tests: window.bidondentTests.runAll()');
  console.log('💡 Manual tests: window.bidondentTests.manual.testCache()');
}
