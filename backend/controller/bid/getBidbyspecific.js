const Bid = require('../../models/bidModel');

const getBidbyspecific = async (req, res) => {
  try {
    // Get user ID from request if available (for specific user bids)
    const userId = req.query.userId || req.user?._id;

    // Query to find bids
    const query = userId ? 
      { 'ShopID': userId } : // If userId provided, filter by shop/seller ID
      {};                    // Otherwise get all bids
    
    const bids = await Bid.find(query)
      .populate({
        path: 'productID',
        populate: { 
          path: 'ShopID',
          select: 'name email _id'
        }
      })
      .populate('bidder.userID', 'name email _id')
      .sort({ createdAt: -1 })
      .exec();

    if (bids.length > 0) {
      return res.json({ 
        success: true, 
        message: userId ? "Seller's bids retrieved successfully" : "All bids retrieved successfully",
        data: bids 
      });
    } else {
      return res.json({ 
        success: true, 
        message: userId ? "No bids found for this seller" : "No bids found",
        data: [] 
      });
    }
  } catch (err) {
    console.error('Error in getBidbyspecific:', err);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error while retrieving bids',
      error: err.message
    });
  }
};

module.exports = getBidbyspecific;