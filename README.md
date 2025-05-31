# Minimal Rate Limiter

This package lets you easily limit how often a function can be called.
It is useful for things like sending emails, calling APIs, or any action you want to avoid running too often.

## How does it work?

You "wrap" your function with a limiter.
The limiter keeps track of how many times your function was called in the last minute.
If you call it too many times, extra calls are automatically queued and will run as soon as allowed—no calls are lost or blocked.

## Example

See [`example_email.js`](./example_email.js):

```js
const { rateLimitWrap } = require('./index');

function sendEmail() {
  console.log('Email sent!');
}

// Only allow 3 emails per minute
const limitedSendEmail = rateLimitWrap(sendEmail, { maxPerMinute: 3 });

(async () => {
  for (let i = 1; i <= 5; i++) {
    await limitedSendEmail();
    console.log(`Email ${i} sent.`);
  }
})();
```

## Why limit function calls?

- Prevent spamming users (e.g., too many emails)
- Stay within API rate limits
- Avoid overloading your own system

## How does it work inside?

- Every time you call the wrapped function, the limiter checks how many times it was called in the last 60 seconds.
- If you haven't reached the limit, your function runs immediately.
- If you have, your call is added to a queue and will run as soon as allowed—no calls are lost or blocked.

## Learn more

- [Wikipedia: Rate limiting](https://en.wikipedia.org/wiki/Rate_limiting)
- [Wikipedia: Token bucket (background)](https://en.wikipedia.org/wiki/Token_bucket)

## API

### `rateLimitWrap(fn, { maxPerMinute })`

- `fn`: The function you want to limit.
- `maxPerMinute`: How many times per minute you want to allow calling `fn`.

Returns a new function.
Call this new function instead of your original one.

---

This is a minimal, dependency-free implementation.
