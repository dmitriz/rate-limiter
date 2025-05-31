/**
 * Minimal Rate Limiter with Queue (no errors, no jargon)
 * 
 * Wraps a function so it can only be called N times per minute.
 * If called too often, extra calls are queued and run as soon as allowed.
 * 
 * Usage:
 *   const { rateLimitWrap } = require('./index');
 *   const limitedSend = rateLimitWrap(sendEmail, { maxPerMinute: 3 });
 *   limitedSend().then(() => ...);
 * 
 * See README.md for details.
 */

const rateLimitWrap = (fn, { maxPerMinute }) => {
  let calls = [];
  let queue = [];

  // Process the queue if possible
  const processQueue = () => {
    const now = Date.now();
    calls = calls.filter(ts => now - ts < 60000);
    while (queue.length && calls.length < maxPerMinute) {
      calls.push(Date.now());
      const { args, resolve } = queue.shift();
      resolve(fn(...args));
    }
  };

  return (...args) => {
    return new Promise(resolve => {
      const now = Date.now();
      calls = calls.filter(ts => now - ts < 60000);
      if (calls.length < maxPerMinute) {
        calls.push(now);
        resolve(fn(...args));
      } else {
        queue.push({ args, resolve });
        // Schedule queue processing when the next slot opens
        const oldest = Math.min(...calls);
        setTimeout(processQueue, 60000 - (now - oldest));
      }
    });
  };
};

module.exports = { rateLimitWrap };