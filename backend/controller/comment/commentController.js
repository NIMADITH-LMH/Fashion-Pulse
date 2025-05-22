const CommentModel = require('../../models/commentModel');
const ProductModel = require('../../models/productModel');

// Simple add comment function
const addComment = async (req, res) => {
    try {
        console.log('=== ADD COMMENT REQUEST ===');
        console.log('Body:', req.body);
        console.log('User:', req.userId, req.user?.name);
        
        // Create comment object with all required fields
        const newComment = new CommentModel({
            productId: req.body.productId,
            userId: req.userId,
            text: req.body.text || '',
            userName: req.user?.name || 'User',
            rating: req.body.rating || 5,
            userImage: req.user?.profileImage || null,
            likes: []
        });
        
        // Save to database
        const savedComment = await newComment.save();
        console.log('Comment saved!', savedComment._id);
        
        // Return success response
        return res.json({
            success: true,
            message: 'Comment added successfully',
            data: savedComment
        });
    } catch (error) {
        console.error('Comment Error:', error);
        return res.json({
            success: false,
            message: 'Error adding comment: ' + error.message
        });
    }
};

// Simple get comments function
const getComments = async (req, res) => {
    try {
        const productId = req.params.productId;
        console.log('Getting comments for product:', productId);
        
        const comments = await CommentModel.find({ productId })
            .sort({ createdAt: -1 });
        
        console.log(`Found ${comments.length} comments`);
        
        return res.json({
            success: true,
            message: 'Comments retrieved',
            data: comments
        });
    } catch (error) {
        console.error('Error getting comments:', error);
        return res.json({
            success: false,
            message: 'Error getting comments: ' + error.message
        });
    }
};

// Simple like toggle function
const toggleCommentLike = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const userId = req.userId;
        
        const comment = await CommentModel.findById(commentId);
        
        if (!comment) {
            return res.json({
                success: false,
                message: 'Comment not found'
            });
        }
        
        // Find index of user's like
        const likeIndex = comment.likes.findIndex(
            like => like.userId.toString() === userId
        );
        
        // Toggle like status
        if (likeIndex > -1) {
            comment.likes.splice(likeIndex, 1);
        } else {
            comment.likes.push({ userId });
        }
        
        await comment.save();
        
        return res.json({
            success: true,
            message: likeIndex > -1 ? 'Comment unliked' : 'Comment liked',
            data: comment
        });
    } catch (error) {
        console.error('Error toggling like:', error);
        return res.json({
            success: false,
            message: 'Error toggling like: ' + error.message
        });
    }
};

// Delete comment function
const deleteComment = async (req, res) => {
    try {
        const commentId = req.params.commentId;
        const userId = req.userId;

        console.log('=== DELETE COMMENT REQUEST ===');
        console.log('Comment ID:', commentId);
        console.log('User ID:', userId);
        
        // Find the comment
        const comment = await CommentModel.findById(commentId);
        
        if (!comment) {
            return res.json({
                success: false,
                message: 'Comment not found'
            });
        }
        
        // Check if the user is the owner of the comment
        if (comment.userId.toString() !== userId) {
            return res.json({
                success: false,
                message: 'Unauthorized: You can only delete your own comments'
            });
        }
        
        // Delete the comment
        await CommentModel.findByIdAndDelete(commentId);
        
        return res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return res.json({
            success: false,
            message: 'Error deleting comment: ' + error.message
        });
    }
};

// Get all comments for a seller's products
const getSellerComments = async (req, res) => {
    try {
        const sellerId = req.userId;
        console.log('Getting comments for seller:', sellerId);
        
        // First, get all products owned by this seller
        const sellerProducts = await ProductModel.find({ userId: sellerId });
        
        if (!sellerProducts || sellerProducts.length === 0) {
            return res.json({
                success: true,
                message: 'No products found for this seller',
                data: []
            });
        }
        
        // Get product IDs
        const productIds = sellerProducts.map(product => product._id);
        
        // Get all comments for these products
        const comments = await CommentModel.find({ 
            productId: { $in: productIds } 
        }).sort({ createdAt: -1 });
        
        // Create a map of product details for easier lookup
        const productMap = {};
        sellerProducts.forEach(product => {
            productMap[product._id.toString()] = {
                _id: product._id,
                productName: product.productName,
                productImage: product.productImage && product.productImage.length > 0 
                    ? product.productImage[0] 
                    : null,
                category: product.category
            };
        });
        
        // Enrich comments with product details
        const enrichedComments = comments.map(comment => {
            const productDetails = productMap[comment.productId.toString()] || {};
            return {
                _id: comment._id,
                text: comment.text,
                userName: comment.userName,
                userImage: comment.userImage,
                rating: comment.rating,
                createdAt: comment.createdAt,
                likes: comment.likes ? comment.likes.length : 0,
                product: productDetails
            };
        });
        
        console.log(`Found ${enrichedComments.length} comments across ${sellerProducts.length} products`);
        
        return res.json({
            success: true,
            message: 'Comments retrieved',
            data: enrichedComments
        });
    } catch (error) {
        console.error('Error getting seller comments:', error);
        return res.json({
            success: false,
            message: 'Error getting comments: ' + error.message
        });
    }
};

module.exports = {
    addComment,
    getComments,
    toggleCommentLike,
    deleteComment,
    getSellerComments
}; 