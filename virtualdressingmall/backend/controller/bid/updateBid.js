const Bid = require('../../models/bidModel');

const updateBid = async (req, res) => {
    const { bidId, userId, bidAmount } = req.body;

    if (!bidAmount || isNaN(bidAmount) || parseFloat(bidAmount) <= 0) {
        return res.status(400).json({ success: false, message: 'Invalid bid amount' });
    }

    try {
        // Find the bid using the bidId
        const bid = await Bid.findById(bidId);

        if (!bid) {
            return res.status(404).json({ success: false, message: 'Bid not found' });
        }

        // Check if the bid is still open (closeDate)
        const currentDate = new Date();
        if (currentDate > new Date(bid.closeDate)) {
            return res.status(400).json({ success: false, message: 'Bid has already closed' });
        }

        // Check if the user already placed a bid, if so update it
        const existingBidIndex = bid.bidder.findIndex((b) => b.userID.toString() === userId);

        if (existingBidIndex !== -1) {
            // Update the existing bid
            bid.bidder[existingBidIndex].bidAmount = bidAmount;
        } else {
            // Add a new bid if the user has not placed one yet
            bid.bidder.push({ userID: userId, bidAmount });
        }

        // Save the bid with the new bid details
        await bid.save();

        return res.json({ success: true, message: 'Bid placed/updated successfully' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = updateBid;
