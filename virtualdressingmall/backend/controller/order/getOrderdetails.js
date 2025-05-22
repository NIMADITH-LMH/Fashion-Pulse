const orderModel = require("../../models/orderModel")



const getOrderDetails = async (req, res) => {
    try{
        const allproduct = await orderModel.find().sort({createdAt : -1}).populate('productID').populate('userID')

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

module.exports = getOrderDetails