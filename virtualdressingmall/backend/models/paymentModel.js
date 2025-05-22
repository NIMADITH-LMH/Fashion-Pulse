const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
    paymentID:{
        type:String,
        required:true
    },
    TotalAmount:{
        type:Number,
        required:true
    },
    cardNumber:{
        type:String,
        required:true
    }
    ,
    CvcCode:{
        type:String,
        required:true
    },
    HolderName:{
        type:String,
        required:true
    },
    ExpDate:{
        type:Date,
        required:true
    },
    userID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    ProductID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"product"
    }
    
})

const payment= mongoose.model('payment', paymentSchema)
module.exports = payment