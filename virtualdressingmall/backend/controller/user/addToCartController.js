const CartModel = require("../../models/cartProduct");


async function addToCartController(req, res) {
    try {
        
        

        // Validate the required fields
        const { userId,productId, size, quantity } = req.body;
        console.log("User id is ",userId)
        if (!productId || !size || quantity === undefined) {
            return res.status(400).json({
                message: "Missing required fields: productId, size, or quantity.",
                error: true,
                success: false,
            });
        }

        // Validate quantity (must be a positive number)
        if (quantity <= 0 || isNaN(quantity)) {
            return res.status(400).json({
                message: "Quantity must be a positive number.",
                error: true,
                success: false,
            });
        }

        // Check if the product already exists in the cart
        let existingCartItem = await CartModel.findOne({
            userId,
            productId:productId,
            size,
        });

        if (existingCartItem) {
            // If item exists, update the quantity
            existingCartItem.quantity += quantity;
            await existingCartItem.save();
        } else {
            // If item doesn't exist, create a new cart item
            const newCartItem = new CartModel(
                req.body
            );

            await newCartItem.save();
        }

        res.status(201).json({
            message: "Product added to cart successfully",
            error: false,
            success: true,
        });

    } catch (err) {
        console.error(err); // For debugging purposes
        res.status(400).json({
            message: err.message || "Failed to add product to cart",
            error: true,
            success: false,
        });
    }
}

module.exports = addToCartController;
