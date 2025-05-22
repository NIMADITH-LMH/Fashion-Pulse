// controllers/shopController.js
const userModel = require("../../models/userModel");
const axios = require('axios');

async function getSellersController(req, res) {
    try {
        const sellers = await userModel.find({ role: "SELLER" });
        
        // Geocode addresses that don't have coordinates
        const sellersWithLocation = await Promise.all(sellers.map(async seller => {
            if (!seller.location && seller.address) {
                try {
                    const response = await axios.get(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(seller.address)}`
                    );
                    if (response.data && response.data[0]) {
                        seller.location = {
                            lat: parseFloat(response.data[0].lat),
                            lng: parseFloat(response.data[0].lon),
                            address: seller.address
                        };
                        await seller.save();
                    }
                } catch (error) {
                    console.error("Geocoding error:", error);
                }
            }
            return seller;
        }));

        res.status(200).json({
            message: "Sellers fetched successfully",
            data: sellersWithLocation,
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