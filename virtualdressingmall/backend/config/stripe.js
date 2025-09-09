/*
const Stripe = require('stripe');

// Check if the STRIPE_SECRET_KEY environment variable exists
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('Error: STRIPE_SECRET_KEY environment variable is not set.');
  console.error('Please add your Stripe API key to the .env file.');
  console.error('You can get your API key from: https://dashboard.stripe.com/apikeys');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key_for_development');
*/

// Create a mock stripe object with dummy functions that return empty results
const stripe = {
  checkout: {
    sessions: {
      create: async () => ({ url: '#', id: 'mock_session_id' }),
      listLineItems: async () => ({ data: [] })
    }
  },
  products: {
    retrieve: async () => ({ name: 'Mock Product', metadata: {} })
  },
  webhooks: {
    constructEvent: () => ({ type: 'unknown_event' })
  }
};

module.exports = stripe;