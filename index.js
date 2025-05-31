/**
 * Minimal Rate Limiter with Queue (no errors, no jargon)
 *
 * Wraps a function so it can only be called N times per configurable time window.
 * If called too often, extra calls are queued and run as soon as allowed.
 *
 * Usage:
 *   const { rate_limit_wrap } = require('./index');
 *   const limited_send = rate_limit_wrap(send_email, { max_per_window: 3, window_length: 60000 });
 *   limited_send().then(() => ...);
 *
 * See README.md for details.
 */

const rate_limit_wrap = (fn, { max_per_window, window_length }) => {
  // Validate inputs
  if (typeof max_per_window !== 'number' || max_per_window < 1) {
    throw new Error('max_per_window must be a positive integer');
  }
  if (typeof window_length !== 'number' || window_length <= 0) {
    throw new Error('window_length must be a positive number');
  }

  let calls = [];
  let queue = [];

  // Process the queue if possible
  const process_queue = () => {
    const now = Date.now();
    calls = calls.filter(ts => now - ts < window_length);
    while (queue.length && calls.length < max_per_window) {
      calls.push(Date.now());
      const { args, resolve, reject } = queue.shift();
      try {
        resolve(fn(...args));
      } catch (error) {
        reject(error);
      }
    }
    // If there are still items in the queue, reschedule processing
    if (queue.length) {
      const oldest = calls.length > 0 ? Math.min(...calls) : now;
      setTimeout(process_queue, window_length - (now - oldest));
    }
  };

  return (...args) => {
    return new Promise((resolve, reject) => {
      const now = Date.now();
      calls = calls.filter(ts => now - ts < window_length);
      if (calls.length < max_per_window) {
        try {
          calls.push(now);
          resolve(fn(...args));
        } catch (error) {
          reject(error);
        }
      } else {
        queue.push({ args, resolve, reject });
        // Schedule queue processing when the next slot opens
        const oldest = calls.length > 0 ? Math.min(...calls) : now;
        setTimeout(process_queue, window_length - (now - oldest));
      }
    });
  };
};

module.exports = { rate_limit_wrap };