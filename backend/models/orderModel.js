const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    TotalAmount: {
        type: Number,
        required: true,
        default: 0
    },
    Address: {
        type: String,
        required: false,
        default: "Address not provided"
    },
    Quantity: {
        type: Number,
        required: false,
        default: 1
    },
    Size: {
        type: String,
        required: false,
        default: "Default"
    },
    Status: {
        type: String,
        default: "pending"
    },
},
{
    timestamps: true
})

// Add a pre-save hook for debugging
orderSchema.pre('save', function(next) {
    console.log('Saving order with data:', JSON.stringify(this.toObject(), null, 2));
    next();
});

const orderModel = mongoose.model("Order", orderSchema)

// Debugging function to check if the model works
orderModel.createTestOrder = async function(userId, productId) {
    try {
        const testOrder = new this({
            productID: productId || new mongoose.Types.ObjectId(),
            userID: userId || new mongoose.Types.ObjectId(),
            TotalAmount: 100,
            Status: "test_order"
        });
        
        const savedOrder = await testOrder.save();
        console.log('Test order created:', savedOrder._id);
        return savedOrder;
    } catch (error) {
        console.error('Error creating test order:', error);
        throw error;
    }
};

module.exports = orderModel