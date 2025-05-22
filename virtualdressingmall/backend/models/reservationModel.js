const mongoose = require('mongoose')

const reservationSchema=new mongoose.Schema({
    ReservationID:{
        type:String, 
        required:true
    },
    productID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"product"
    },
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    size:{
        type:String,
        required:true
    },
    Quantity:{
        type:Number,
        required:true   
    },
    ValidateReservation:{
        type:String,
    },
    ReservationDate:{
        type:Date,
        default: () => {
            const today = new Date();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const year = today.getFullYear();
            return `${month}/${day}/${year}`;
        }
    }
},{
    timestamps:true
})
const resrvationModel=mongoose.model("Reservation",reservationSchema)

module.exports=resrvationModel;