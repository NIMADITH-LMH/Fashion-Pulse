const Bid = require('../../models/bidModel'); // adjust the path if needed

// Create a new bid
const createBid = async (req, res) => {
  try {
    const { productID, startPrice, closeDate } = req.body;

    // Validate required fields
    if (!productID || !startPrice || !closeDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newBid = new Bid({
      productID,
      startPrice,
      closeDate,
      bidder: [], // start with an empty bidder array
    });

    await newBid.save();

    res.status(201).json({
      message: 'Bid created successfully',
      bid: newBid,
    });
  } catch (error) {
    console.error('Error creating bid:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = createBid
