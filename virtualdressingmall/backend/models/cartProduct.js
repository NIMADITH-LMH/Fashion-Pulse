const mongoose = require("mongoose");

const addToCartSchema = new mongoose.Schema(
  {
    productId: {  // Updated to camelCase to match controller
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",  // Ensure this is the correct model name for your products
      required: true
    },
    userId: {  // Updated to camelCase to match controller
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",  // Ensure this is the correct model name for your users
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    size: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

const CartModel = mongoose.model("Cart", addToCartSchema);  // Changed model name to 'Cart'
module.exports = CartModel;
