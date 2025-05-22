const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    text: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    userImage: {
        type: String,
        default: null
    },
    likes: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user"
        }
    }]
}, {
    timestamps: true
});

const CommentModel = mongoose.model("comment", commentSchema);

module.exports = CommentModel;