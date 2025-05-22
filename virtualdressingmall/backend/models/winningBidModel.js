const mongoose = require('mongoose');

const winningBidSchema = new mongoose.Schema({
    bidID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "bid",
        required: true
    }, 
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true
    },
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    bidAmount: {
        type: Number,
        required: true
    },
    closeDate: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
});

const WinningBid = mongoose.model("winningBid", winningBidSchema);

module.exports = WinningBid;