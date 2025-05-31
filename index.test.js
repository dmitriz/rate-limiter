const rateLimit = require('./index');

describe('Token Bucket Rate Limiter', () => {
  let bucket;

  beforeEach(() => {
    bucket = { tokens: 10, lastRefill: Date.now() };
  });

  test('allows request when tokens available', () => {
    const result = rateLimit({ bucket, tokens: 1, refillRate: 10, capacity: 10 });
    expect(result.allowed).toBe(true);
    expect(result.bucket.tokens).toBe(9);
  });

  test('denies request when insufficient tokens', () => {
    const result = rateLimit({ bucket, tokens: 11, refillRate: 10, capacity: 10 });
    expect(result.allowed).toBe(false);
    expect(result.wait).toBeGreaterThan(0);
  });

  test('refills tokens over time', () => {
    // Use up all tokens
    bucket.tokens = 0;
    bucket.lastRefill = Date.now() - 60000; // 1 minute ago
    
    const result = rateLimit({ bucket, tokens: 1, refillRate: 10, capacity: 10 });
    expect(result.allowed).toBe(true);
    expect(result.bucket.tokens).toBe(9); // 10 refilled - 1 used
  });

  test('calculates correct wait time', () => {
    bucket.tokens = 0;
    bucket.lastRefill = Date.now();
    
    const result = rateLimit({ bucket, tokens: 1, refillRate: 10, capacity: 10 });
    expect(result.allowed).toBe(false);
    expect(result.wait).toBe(6000); // 60s / 10 tokens = 6s per token
  });
});