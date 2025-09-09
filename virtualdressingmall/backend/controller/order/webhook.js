// Commented out Stripe requirement  
// const stripe = require('../../config/stripe')  
const orderModel = require('../../models/orderModel')  
const cartModel = require('../../models/cartProduct')  
const productModel = require('../../models/productModel')  
  
/**  
 * Webhook controller - now contains mock functionality  
 * All Stripe webhook handling has been disabled  
 */  
  
const webhook = async (request, response) => {  
    // This is a simplified mock webhook that doesn't process Stripe events  
    console.log('Stripe webhook received but processing is disabled');  
  
    // Just acknowledge the webhook  
    response.status(200).send('Webhook received but Stripe processing is disabled');  
};  
  
module.exports = webhook;  
