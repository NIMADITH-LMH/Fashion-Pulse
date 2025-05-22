const orderModel = require("../../models/orderModel");
const productModel = require("../../models/productModel");

const generateBalanceSheet = async (req, res) => {
  try {
    const { shopId } = req.query;

    if (!shopId) {
      return res.status(400).json({
        message: "Shop ID is required",
        error: true,
        success: false,
      });
    }

    // Get all orders where product's ShopID matches the seller
    const allOrders = await orderModel.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "productID",
        model: "product",
        match: { ShopID: shopId },  // <-- filter by ShopID
      })
      .populate("userID");

    // Filter out orders that matched the ShopID inside productID
    const filteredOrders = allOrders.filter(order => order.productID !== null);

    const completedOrders = filteredOrders.filter(order => order.Status === "Confirmed");
    const pendingOrders = filteredOrders.filter(order => order.Status === "pending");

    const totalSales = completedOrders.reduce((acc, order) => acc + order.TotalAmount, 0);
    const pendingRevenue = pendingOrders.reduce((acc, order) => acc + order.TotalAmount, 0);

    const balanceData = {
      totalSales,
      pendingRevenue,
      totalCompletedOrders: completedOrders.length,
      totalPendingOrders: pendingOrders.length,
      orders: filteredOrders,
    };

    res.json({
      message: "Balance sheet generated",
      success: true,
      data: balanceData,
    });
  } catch (err) {
    res.status(400).json({
      message: err.message || err,
      error: true,
      success: false,
    });
  }
};

module.exports = generateBalanceSheet;
