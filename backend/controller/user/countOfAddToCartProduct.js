const express = require("express");
const router = express.Router();
const CartProduct = require("../../models/cartProduct"); // Adjust path if needed

// Route to get the count of cart products
router.get("/count-of-cart", async (req, res) => {
    try {
        const count = await CartProduct.countDocuments({});
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;

router.get("/count-of-cart", async (req, res) => {
    try {
        const count = await CartProduct.countDocuments({});
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});
const countAddToCartProduct = async (req, res) => {
    try{
        const userID = req.userID

        const count = await addToCartModel.find({
            userID : userID
        }).countDocuments()

        res.json({
            data : {
                count : count
            },
            message : "Count of Product in Cart",
            error : false,
            success : true
           
        })

    }catch(erorr){
        res.json({
            message : error?.message || error,
            erorr : false,
            success : true
        })

    }

    
}

module.exports = countAddToCartProduct