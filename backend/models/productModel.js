const mongoose = require('mongoose')
const productSchema = new mongoose.Schema({
   
    ShopID:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    productName : String,
    brandName : String,
    category : String,
    productImage : [],
    subCategory : String,
    description : String,
     DiscoutPercentage : Number,
     status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' // <-- Added for approval flow
    },
    Size:[{
        size:String,
        quantity:Number,
        price: Number       
   }],
   Gender : String,
   color : String,
   Pattern : String,
   FitType : String,
   seasonalCollection : String,
},{
    timestamps : true
})

const productModel = mongoose.model("product",productSchema)

module.exports = productModel
     
