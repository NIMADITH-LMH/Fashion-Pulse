const productModel = require("../../models/productModel")



const getProductController = async (req, res) => {
    try{
        const allproduct = await productModel.find().sort({createdAt : -1}).populate('ShopID')

        res.json({
            message: "All Product",
            error:false,
            success:true,
            data:allproduct
        })

    }catch(err){
        res.status(400).json({
            message: err.message || err,
            error:true,
            success : false
        })
    }
}

module.exports = getProductController