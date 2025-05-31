// Example: Rate limiting sending emails from a list

const { rate_limit_wrap } = require('./index');

// List of email addresses to send to
const email_list = [
  'alice@example.com',
  'bob@example.com',
  'carol@example.com',
  'dave@example.com',
  'eve@example.com'
];

// Function to send an email to a given address
const send_email = (address) => {
  console.log('Sent email to:', address);
};

// Wrap the function so it can only be called 1 time per second
// max_per_window: how many calls are allowed per window
// window_length: the window size in milliseconds (e.g., 1000 ms = 1 second)
const limited_send_email = rate_limit_wrap(send_email, { max_per_window: 1, window_length: 1000 }); // 1 call per 1000ms (1 second)

console.log('Trying to send emails to all recipients (1 per second):');

// Loop over the array and send each email, respecting the rate limit
(async () => {
  for (const address of email_list) {
    try {
      await limited_send_email(address);
      console.log('Successfully processed:', address);
    } catch (error) {
      console.error('Failed to process:', address, 'Error:', error.message);
    }
  }
  console.log('Completed processing all emails');
})();