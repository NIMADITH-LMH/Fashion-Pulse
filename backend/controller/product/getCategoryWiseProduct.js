// controllers/product/getCategoryWiseProduct.js
const productModel = require('../../models/productModel')

const getCategoryWiseProduct = async (req, res) => {
    try {
        const { category } = req?.body || req?.query;
        
        if (!category) {
            return res.status(400).json({
                message: "Category is required",
                error: true,
                success: false
            });
        }

        const products = await productModel.find({ category }).populate('ShopID');

        if (!products || products.length === 0) {
            return res.status(404).json({
                message: "No products found for this category",
                error: false,
                success: true,
                data: []
            });
        }
        
        // Fixed: changed 'product' to 'products'
        res.json({
            data: products,
            message: "Products by category",
            error: false,
            success: true
        });
        
    } catch (err) {
        res.status(500).json({  // Changed to 500 for server errors
            message: err.message || "An error occurred",
            error: true,
            success: false
        });
    }
}

module.exports = getCategoryWiseProduct;