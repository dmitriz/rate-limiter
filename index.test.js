const { rateLimitWrap } = require('./index');

describe('rateLimitWrap', () => {
  jest.useFakeTimers();
  let fn, limitedFn, results;

  beforeEach(() => {
    results = [];
    fn = jest.fn((x) => {
      results.push(x);
      return x;
    });
    limitedFn = rateLimitWrap(fn, { max_per_window: 2, window_length: 1000 });
  });

  test('allows up to max_per_window calls immediately', async () => {
    const p1 = limitedFn(1);
    const p2 = limitedFn(2);
    await Promise.all([p1, p2]);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(results).toEqual([1, 2]);
  });

  test('queues calls over the limit and runs them after window', async () => {
    const p1 = limitedFn(1);
    const p2 = limitedFn(2);
    const p3 = limitedFn(3);
    await Promise.all([p1, p2]);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(results).toEqual([1, 2]);

    // p3 should be queued
    jest.advanceTimersByTime(1000);
    await p3;
    expect(fn).toHaveBeenCalledTimes(3);
    expect(results).toEqual([1, 2, 3]);
  });

  test('processes queue in correct order (all at once after window)', async () => {
    const p1 = limitedFn('a');
    const p2 = limitedFn('b');
    const p3 = limitedFn('c');
    const p4 = limitedFn('d');

    await Promise.all([p1, p2]);
    expect(results).toEqual(['a', 'b']);

    jest.advanceTimersByTime(1000);
    await Promise.all([p3, p4]);
    expect(results).toEqual(['a', 'b', 'c', 'd']);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });
});