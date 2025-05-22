const stripe = require('../../config/stripe')
const orderModel = require('../../models/orderModel')
const cartModel = require('../../models/cartProduct')
const productModel = require('../../models/productModel')

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test'

async function getLineItems(sessionId) {
    try {
        const lineItems = await stripe.checkout.sessions.listLineItems(sessionId)
        let productItems = []

        if (lineItems?.data?.length > 0) {
            for (const item of lineItems.data) {
                try {
                    const product = await stripe.products.retrieve(item.price.product)
                    const productId = product.metadata.productId

                    const productData = {
                        productId: productId,
                        name: product.name,
                        price: item.price.unit_amount/100,
                        quantity: item.quantity,
                        image: product.images && product.images.length > 0 ? product.images[0] : null
                    }

                    productItems.push(productData)
                } catch (error) {
                    console.error('Error retrieving product:', error)
                }
            }
        }

        return productItems
    } catch (error) {
        console.error('Error getting line items:', error)
        return []
    }
}

// Function to update product quantities
async function updateProductQuantities(cartItems) {
    try {
        for (const item of cartItems) {
            const product = await productModel.findById(item.productId._id || item.productId);
            
            if (product) {
                // Find the size index to update
                const sizeIndex = product.Size.findIndex(
                    s => s.size.toLowerCase() === item.size.toLowerCase()
                );
                
                if (sizeIndex !== -1) {
                    // Decrease quantity
                    product.Size[sizeIndex].quantity = Math.max(0, product.Size[sizeIndex].quantity - item.quantity);
                    await product.save();
                    console.log(`Updated quantity for product ${product._id}, size ${item.size}. New quantity: ${product.Size[sizeIndex].quantity}`);
                }
            }
        }
    } catch (error) {
        console.error('Error updating product quantities:', error);
    }
}

const webhook = async (request, response) => {
    const signature = request.headers['stripe-signature']
    let event

    try {
        const payload = request.body
        
        // Check if signature exists (from production Stripe)
        if (signature && endpointSecret) {
            event = stripe.webhooks.constructEvent(payload, signature, endpointSecret)
        } else {
            // For testing purposes
            event = {
                type: payload.type,
                data: {
                    object: payload.data.object
                }
            }
        }
    } catch (err) {
        console.log(`⚠️ Webhook signature verification failed:`, err.message)
        return response.status(400).send(`Webhook Error: ${err.message}`)
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            
            try {
                console.log("Processing session:", session.id);
                
                // Check if orders were already processed when "Pay with Stripe" was clicked
                const ordersAlreadyProcessed = session.metadata?.ordersProcessed === 'true';
                const cartItemsAlreadyDeleted = session.metadata?.cartItemsDeleted === 'true';
                
                if (ordersAlreadyProcessed) {
                    console.log('Orders were already processed when payment was initiated. Updating order status only.');
                    
                    // Update the status of pending orders to 'processing'
                    const updatedOrders = await orderModel.updateMany(
                        { 
                            userID: session.metadata?.userId,
                            Status: 'pending'
                        },
                        { 
                            $set: { Status: 'processing' }
                        }
                    );
                    
                    console.log(`Updated ${updatedOrders.modifiedCount} orders to processing status`);
                    
                    // Clear cart items after successful checkout
                    if (!cartItemsAlreadyDeleted && session.metadata?.userId) {
                        await cartModel.deleteMany({ userId: session.metadata.userId });
                        console.log('Cart cleared for user:', session.metadata.userId);
                    } else {
                        console.log('Cart items were already deleted, skipping cart clear');
                    }
                    
                    break;
                }
                
                // If orders were not processed before, continue with the original flow
                // Get line items from the session
                const productDetails = await getLineItems(session.id);
                
                if (!productDetails || productDetails.length === 0) {
                    console.log('No product details found for session', session.id);
                    break;
                }

                // Get cart items to update product quantities
                const cartItems = await cartModel.find({ userId: session.metadata?.userId }).populate('productId');

                // Update product quantities
                await updateProductQuantities(cartItems);

                // Create orders for each product
                for (const item of cartItems) {
                    const orderDetails = {
                        productID: item.productId._id,
                        userID: session.metadata?.userId,
                        TotalAmount: item.productId.Size.find(s => s.size === item.size)?.price * item.quantity || 0,
                        Address: session.metadata?.address || '',
                        Quantity: item.quantity,
                        Size: item.size,
                        Status: 'processing'
                    };

                    // Save individual order to database
                    const order = new orderModel(orderDetails);
                    await order.save();
                    console.log('Order saved:', order._id);
                }

                // Clear cart items after successful checkout
                if (!cartItemsAlreadyDeleted && session.metadata?.userId) {
                    await cartModel.deleteMany({ userId: session.metadata.userId });
                    console.log('Cart cleared for user:', session.metadata.userId);
                } else {
                    console.log('Cart items were already deleted, skipping cart clear');
                }
            } catch (error) {
                console.error('Error processing checkout session:', error);
            }
            break;
        
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.status(200).send('Received');
}

module.exports = webhook
