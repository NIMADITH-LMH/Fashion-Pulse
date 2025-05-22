const mongoose =require('mongoose')

const bidSchema=new mongoose.Schema({
    productID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"product"
    },
    startPrice:{
        type:Number,
        required:true
    },
    closeDate:{
        type:Date,
        required:true
    },
    bidder:[{
        userID:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"user"
        },
        bidAmount:{
            type:Number,
            required:true
        }
    }],
    status:{
        type:String,
        default:"active"
    }
    
    
    
},{
    timestamps:true
})

const bidModel=mongoose.model("bid",bidSchema)

module.exports=bidModel
