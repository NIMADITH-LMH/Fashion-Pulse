const Order = require('../../models/orderModel');
const Bid = require('../../models/winningBidModel');
const Product = require('../../models/productModel');
const mongoose = require('mongoose');

const getSalesOverview = async (req, res) => {
  
  const { startDate, endDate,sellerId } = req.query;
console.log(sellerId)
  try {
    // Convert dates to ISO if provided
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get all products of the seller
    const sellerProducts = await Product.find({ ShopID: sellerId }, '_id productName');
    const productIds = sellerProducts.map(p => p._id);

    // --- Total Orders and Revenue from Orders ---
    const orders = await Order.find({
      productID: { $in: productIds },
      ...dateFilter
    });

    const totalOrderRevenue = orders.reduce((sum, order) => sum + order.TotalAmount, 0);
    const totalOrdersCount = orders.length;
    const totalProductsSold = orders.reduce((sum, order) => sum + order.Quantity, 0);

    // --- Top-Selling Products ---
    const productSalesMap = {};
    for (const order of orders) {
      const pid = order.productID.toString();
      if (!productSalesMap[pid]) productSalesMap[pid] = 0;
      productSalesMap[pid] += order.Quantity;
    }

    const topProducts = sellerProducts.map(product => ({
      productId: product._id,
      productName: product.productName,
      totalSold: productSalesMap[product._id.toString()] || 0
    })).sort((a, b) => b.totalSold - a.totalSold).slice(0, 5);

    // --- Revenue from Winning Bids ---
    const winningBids = await Bid.find({
      productID: { $in: productIds },
      ...dateFilter
    });
    
    // Calculate total revenue from winning bids
    let totalBidRevenue = 0;
    for (const bid of winningBids) {
      totalBidRevenue += bid.bidAmount;
    }

    const totalRevenue = totalOrderRevenue + totalBidRevenue;

    return res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrderRevenue,
        totalBidRevenue,
        totalOrdersCount,
        totalProductsSold,
        topProducts
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = getSalesOverview;
