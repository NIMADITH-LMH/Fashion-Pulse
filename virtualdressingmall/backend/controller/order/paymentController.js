const stripe = require('../../config/stripe')
const userModel = require('../../models/userModel')
const productModel = require('../../models/productModel')
const orderModel = require('../../models/orderModel')
const cartModel = require('../../models/cartProduct')

const paymentController = async(request, response) =>{
    try{
        const { cartItems, address } = request.body

        if (!cartItems || !cartItems.length) {
            return response.status(400).json({
                message: 'No items in cart',
                error: true,
                success: false
            });
        }

        const user = await userModel.findOne({_id: request.userId})
        
        if (!user) {
            return response.status(404).json({
                message: 'User not found',
                error: true,
                success: false
            });
        }

        // First, create pending orders and update product quantities
        try {
            // Store the cart item IDs to delete later
            const cartItemsToDelete = cartItems.map(item => item._id);
            
            // Process each cart item
            for (const item of cartItems) {
                // 1. Create order entry with pending status
                const orderDetails = {
                    productID: item.productId._id,
                    userID: request.userId,
                    TotalAmount: item.productId.sellingPrice * item.quantity,
                    Address: address,
                    Quantity: item.quantity,
                    Size: item.size,
                    Status: 'pending'
                };

                const order = new orderModel(orderDetails);
                await order.save();
                console.log('Pending order created:', order._id);

                // 2. Update product quantity
                const product = await productModel.findById(item.productId._id);
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
            
            // 3. Delete the selected cart items from the database
            if (cartItemsToDelete.length > 0) {
                const deleteResult = await cartModel.deleteMany({ _id: { $in: cartItemsToDelete }});
                console.log(`Deleted ${deleteResult.deletedCount} items from cart`);
            }
        } catch (error) {
            console.error('Error processing orders:', error);
            // Continue with payment even if order processing fails
            // The webhook will handle it again on successful payment
        }

        // Format line items for Stripe
        const lineItems = cartItems.map((item) => {
            // Convert price to cents (Stripe requires amount in smallest currency unit)
            const unitAmount = Math.round((item.productId.sellingPrice || 0) * 100);
            
            return {
                price_data : {
                    currency : 'lkr',
                    product_data :{
                        name : item.productId.productName,
                        images : item.productId.productImage && item.productId.productImage.length > 0 
                            ? [item.productId.productImage[0]] 
                            : [],
                        metadata : {
                            productId : item.productId._id.toString()
                        }  
                    },
                    unit_amount : unitAmount
                },
                adjustable_quantity : {
                    enabled : true,
                    minimum : 1,
                    maximum : 10
                },
                quantity : item.quantity,
            }
        })

        // Create a Stripe checkout session
        const params = {
            payment_method_types : ['card'],
            mode : 'payment',
            billing_address_collection : 'auto',
            shipping_address_collection : {
                allowed_countries : ['LK'], // Sri Lanka
            },
            shipping_options : [
                {
                    shipping_rate_data : {
                        type : 'fixed_amount',
                        fixed_amount : {
                            amount : 0, // Free shipping (in cents)
                            currency : 'lkr',
                        },
                        display_name : 'Free shipping',
                        delivery_estimate : {
                            minimum : {
                                unit : 'business_day',
                                value : 3,
                            },
                            maximum : {
                                unit : 'business_day',
                                value : 5,
                            },
                        },
                    },
                },
            ],
            customer_email : user.email,
            metadata : {
                userId : request.userId,
                address : address,
                ordersProcessed: 'true', // Flag to indicate orders were already processed
                cartItemsDeleted: 'true'  // Flag to indicate cart items were already deleted
            },
            line_items : lineItems,
            success_url : `${process.env.FRONTEND_URL || 'http://localhost:3000'}/Success`,
            cancel_url : `${process.env.FRONTEND_URL || 'http://localhost:3000'}/Cancel`,
        }

        const session = await stripe.checkout.sessions.create(params)
        
        response.status(200).json({
            id : session.id,
            url : session.url,
            success : true
        })

    } catch (error) {
        console.error('Stripe payment error:', error);
        response.status(500).json({
            message : error?.message || 'Payment processing failed',
            error : true,
            success : false
        }) 
    }
}

module.exports = paymentController