const rateLimit = require('./index');

// Initialize your token bucket
let bucket = {
  tokens: 10,          // Start with 10 tokens
  lastRefill: Date.now() // Last refill time is now
};

function sendEmail() {
  console.log('Email sent!');
}

console.log('Trying to send 15 emails quickly:');
console.log('--------------------------------');

// Try to send 15 emails quickly
for (let i = 1; i <= 15; i++) {
  const result = rateLimit({
    bucket,
    tokens: 1,          // Each email costs 1 token
    refillRate: 60,     // 60 tokens per minute (1 per second)
    capacity: 10        // Bucket holds max 10 tokens
  });

  if (result.allowed) {
    sendEmail();
    console.log(`Email ${i} sent! Tokens left: ${result.bucket.tokens}`);
    bucket = result.bucket; // Update our bucket
  } else {
    console.log(`Email ${i} delayed: ${result.wait}ms wait required`);
    bucket = result.bucket; // Update our bucket
    console.log(`Waiting ${result.wait}ms before next try...`);
    break;
  }
}