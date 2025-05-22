const productModel = require('../../models/productModel');

const searchProduct = async (req, res) => {
    try {
        const searchQuery = req.query.q;
        
        if (!searchQuery || searchQuery.trim() === '') {
            return res.json({
                message: "Search query is required",
                error: true,
                success: false,
                data: []
            });
        }

        // Perform a case-insensitive search across multiple fields
        const products = await productModel.find({
           
            $or: [
                { productName: { $regex: searchQuery, $options: 'i' } },
                { brandName: { $regex: searchQuery, $options: 'i' } },
                { category: { $regex: searchQuery, $options: 'i' } },
                { description: { $regex: searchQuery, $options: 'i' } }
            ]
        }).sort({ createdAt: -1 });

        return res.json({
            message: "Search results",
            error: false,
            success: true,
            data: products
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message || "An error occurred during search",
            error: true,
            success: false,
            data: []
        });
    }
};

module.exports = searchProduct; 