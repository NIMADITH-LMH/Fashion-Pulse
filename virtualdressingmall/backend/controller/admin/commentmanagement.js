const Comment = require('../../models/commentModel');
const Product = require('../../models/productModel');
const User = require('../../models/userModel');

// View all comments with optional filtering
const getAllComments = async (req, res) => {
  const { productId, userId, startDate, endDate } = req.query;

  try {
    // Build filter object
    const filter = {};

    if (productId) filter.productId = productId;
    if (userId) filter.userId = userId;
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(`${endDate}T23:59:59.999Z`)
      };
    }

    const comments = await Comment.find(filter)
      .populate('productId', 'productName')
      .populate('userId', 'name email profilePic')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: comments });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch comments' });
  }
};

// Get average rating for a product
const getAverageProductRating = async (req, res) => {
  const { productId } = req.params;

  try {
    const result = await Comment.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      { $group: {
        _id: '$productId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }}
    ]);

    if (result.length === 0) {
      return res.json({ success: true, averageRating: 0, totalReviews: 0 });
    }

    const { averageRating, totalReviews } = result[0];
    res.json({ success: true, averageRating, totalReviews });
  } catch (error) {
    console.error('Error calculating average rating:', error);
    res.status(500).json({ success: false, message: 'Failed to calculate average rating' });
  }
};

// Delete a comment
const deleteComments = async (req, res) => {
  const { commentId } = req.params;

  try {
    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    res.json({ success: true, message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ success: false, message: 'Failed to delete comment' });
  }
};

// Like or Unlike a comment
const toggleLikeComment = async (req, res) => {
  const { commentId } = req.params;
  const { userId } = req.body;

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const likeIndex = comment.likes.findIndex(like => like.userId.toString() === userId);

    if (likeIndex !== -1) {
      // Unlike
      comment.likes.splice(likeIndex, 1);
    } else {
      // Like
      comment.likes.push({ userId });
    }

    await comment.save();

    res.json({ success: true, likesCount: comment.likes.length });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ success: false, message: 'Failed to like/unlike comment' });
  }
};

// Get like count and analysis
const getLikesAnalysis = async (req, res) => {
  try {
    const comments = await Comment.find();

    const totalComments = comments.length;
    const totalLikes = comments.reduce((acc, comment) => acc + comment.likes.length, 0);

    res.json({ success: true, totalComments, totalLikes });
  } catch (error) {
    console.error('Error fetching likes analysis:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch likes analysis' });
  }
};

// Flag a comment (optional feature)
const flagComment = async (req, res) => {
  const { commentId } = req.params;
  const { reason } = req.body;

  try {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // For simplicity, let's just add a "flag" field dynamically
    comment.flagged = {
      reason: reason || 'Inappropriate content',
      flaggedAt: new Date()
    };

    await comment.save();

    res.json({ success: true, message: 'Comment flagged successfully' });
  } catch (error) {
    console.error('Error flagging comment:', error);
    res.status(500).json({ success: false, message: 'Failed to flag comment' });
  }
};

module.exports = {
  getAllComments,
  getAverageProductRating,
  deleteComments,
  toggleLikeComment,
  getLikesAnalysis,
  flagComment
};
