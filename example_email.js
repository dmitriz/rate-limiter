// Example: Rate limiting sending emails from a list

const { rateLimitWrap } = require('./index');

// List of email addresses to send to
const emailList = [
  'alice@example.com',
  'bob@example.com',
  'carol@example.com',
  'dave@example.com',
  'eve@example.com'
];

// Function to send an email to a given address
const sendEmail = (address) => {
  console.log('Sent email to:', address);
};

// Wrap the function so it can only be called 3 times per minute
const limitedSendEmail = rateLimitWrap(sendEmail, { maxPerMinute: 3 });

console.log('Trying to send emails to all recipients:');

// Loop over the array and send each email, respecting the rate limit
(async () => {
  for (const address of emailList) {
    await limitedSendEmail(address);
    console.log('Processed:', address);
  }
  console.log('All emails processed');
})();