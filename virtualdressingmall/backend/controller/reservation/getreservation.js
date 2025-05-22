const reservationModel = require("../../models/reservationModel")



const getReservationDetails = async (req, res) => {
    try{
        const allproduct = await reservationModel.find().sort({createdAt : -1}).populate('productID').populate('userID')

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

module.exports = getReservationDetails