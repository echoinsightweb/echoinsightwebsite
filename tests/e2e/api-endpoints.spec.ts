import { test, expect } from '@playwright/test';

test.describe('API Endpoint Edge Cases', () => {

  test('POST /api/enquiries should reject malformed JSON or empty payload', async ({ request }) => {
    const response = await request.post('/api/enquiries', {
      data: {} // Empty payload
    });
    
    // Expect Bad Request or similar validation error status
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/appointments should reject invalid slot durations', async ({ request }) => {
    const response = await request.post('/api/appointments', {
      data: {
         name: "Test",
         mobile: "9876543210",
         duration: 45 // Invalid duration
      }
    });
    
    // Expect Bad Request
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

});
