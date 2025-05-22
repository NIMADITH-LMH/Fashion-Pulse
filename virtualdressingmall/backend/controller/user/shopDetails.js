const userModel = require("../../models/userModel");

async function getSellersController(req, res) {
    try {
        const sellers = await userModel.find({ role: "SELLER" });

        res.status(200).json({
            message: "Sellers fetched successfully",
            data: sellers,
            error: false,
            success: true
        });

    } catch (err) {
        res.status(500).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
}

module.exports = getSellersController;
