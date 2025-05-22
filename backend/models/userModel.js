const mongoose = require('mongoose')
 
const userSchema = new mongoose.Schema({

    name : String,
    email : {
        type : String,
        unique : true,
        required : true
    },
    password : String,
    profilePic:String,
    role : String,
    location: {
        lat: {
          type: Number,
          required: true
        },
        lng: {
          type: Number,
          required: true
        },
        address:String
    }

},
{
    timestamps : true

})


const userModel = mongoose.model("user",userSchema)
module.exports = userModel