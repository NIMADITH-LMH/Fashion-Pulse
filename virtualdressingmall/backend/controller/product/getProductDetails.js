const productModel = require('../../models/productModel')

const getproductDetails = async (req, res) => {
    try {
        const productId = req.body
        const product = await productModel.findById(productId)

        res.json({
            data : product,
            message : "ok",
            success: true,
            error: false,
            productId: productId
        })

    }
    catch (err) {
        res.json({
            message : err?.message || err,
            success: false,
            error: true
        })
    }
}

module.exports = getproductDetails;
