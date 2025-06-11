/**
 * Test script for API integration
 * This file can be used to test API connectivity during development
 */

import { gigsApi } from './gigsApi';

export async function testApiConnectivity() {
  console.log('Testing API connectivity...');
  
  try {
    // Test GET /api/gigs
    console.log('1. Testing GET /api/gigs...');
    const gigsResponse = await gigsApi.getAll();
    console.log('✅ GET /api/gigs successful:', gigsResponse);
    
    // If we have gigs, test other operations
    if (gigsResponse.data && gigsResponse.data.length > 0) {
      const firstGig = gigsResponse.data[0];
      
      // Test GET /api/gigs/:id
      console.log('2. Testing GET /api/gigs/:id...');
      const gigResponse = await gigsApi.getById(firstGig.id);
      console.log('✅ GET /api/gigs/:id successful:', gigResponse);
      
      // Test PATCH /api/gigs/:id/status (only if gig status allows it)
      if (firstGig.status === 'draft') {
        console.log('3. Testing PATCH /api/gigs/:id/status...');
        const statusResponse = await gigsApi.updateStatus(firstGig.id, 'open');
        console.log('✅ PATCH /api/gigs/:id/status successful:', statusResponse);
        
        // Revert status back
        await gigsApi.updateStatus(firstGig.id, 'draft');
        console.log('✅ Status reverted back to draft');
      }
    }
    
    console.log('🎉 All API tests passed!');
    return true;
  } catch (error) {
    console.error('❌ API test failed:', error);
    return false;
  }
}

// For browser console testing
if (typeof window !== 'undefined') {
  (window as unknown as { testApi: () => Promise<boolean> }).testApi = testApiConnectivity;
  console.log('API test function available as window.testApi()');
}
