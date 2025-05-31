/**
 * Minimal Rate Limiter with Queue (no errors, no jargon)
 * 
 * Wraps a function so it can only be called N times per minute.
 * If called too often, extra calls are queued and run as soon as allowed.
 * 
 * Usage:
 *   const { rateLimitWrap } = require('./index');
 *   const limitedSend = rateLimitWrap(sendEmail, { max_per_window: 3, window_length: 60000 });
 *   limitedSend().then(() => ...);
 * 
 * See README.md for details.
 */

const rateLimitWrap = (fn, { max_per_window, window_length }) => {
  let calls = [];
  let queue = [];

  // Process the queue if possible
  const processQueue = () => {
    const now = Date.now();
    calls = calls.filter(ts => now - ts < window_length);
    while (queue.length && calls.length < max_per_window) {
      calls.push(Date.now());
      const { args, resolve } = queue.shift();
      resolve(fn(...args));
    }
  };

  return (...args) => {
    return new Promise(resolve => {
      const now = Date.now();
      calls = calls.filter(ts => now - ts < window_length);
      if (calls.length < max_per_window) {
        calls.push(now);
        resolve(fn(...args));
      } else {
        queue.push({ args, resolve });
        // Schedule queue processing when the next slot opens
        const oldest = Math.min(...calls);
        setTimeout(processQueue, window_length - (now - oldest));
      }
    });
  };
};

module.exports = { rateLimitWrap };