const Order = require('../../models/orderModel');
const WinningBid = require('../../models/winningBidModel');
const Product = require('../../models/productModel');
const User = require('../../models/userModel');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

/**
 * Get Customer and Seller Analytics
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getCustomerSellerAnalytics = async (req, res) => {
  const { format } = req.query;

  try {
    // Fetch all orders and winning bids
    const orders = await Order.find().populate('userID').exec();
    const winningBids = await WinningBid.find().populate('userID').exec();

    // Unique buyers from orders
    const orderUserIDs = orders.map(order => order.userID?._id?.toString()).filter(Boolean);
    
    // Unique buyers from winning bids
    const bidUserIDs = winningBids.map(bid => bid.userID?._id?.toString()).filter(Boolean);

    // Merge and get unique user IDs
    const allBuyerIDs = Array.from(new Set([...orderUserIDs, ...bidUserIDs]));

    // Fetch Products to find Top Sellers
    const products = await Product.find().populate('ShopID').exec();

    const sellerSalesMap = {};

    // Count how many products each seller has
    products.forEach(product => {
      const sellerId = product.ShopID?._id?.toString();
      if (sellerId) {
        sellerSalesMap[sellerId] = (sellerSalesMap[sellerId] || 0) + 1;
      }
    });

    // Prepare Top Sellers Data
    const topSellers = Object.entries(sellerSalesMap)
      .map(([sellerId, count]) => ({ sellerId, productCount: count }))
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 10); // Top 10 sellers

    const topSellersDetails = await Promise.all(topSellers.map(async seller => {
      const user = await User.findById(seller.sellerId);
      return {
        name: user?.name || 'Unknown Seller',
        email: user?.email || 'Unknown',
        productCount: seller.productCount
      };
    }));

    // Final Analytics Object
    const analyticsData = {
      totalUniqueBuyers: allBuyerIDs.length,
      topSellers: topSellersDetails
    };

    // Handle different response formats
    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 50 });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="customer_seller_analytics.pdf"');

      doc.pipe(res);

      doc.fontSize(20).text('Customer & Seller Analytics Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Date Generated: ${new Date().toLocaleDateString()}`, { align: 'left' });
      doc.moveDown(2);

      doc.fontSize(16).text(`Total Unique Buyers: ${analyticsData.totalUniqueBuyers}`, { align: 'left' });
      doc.moveDown();

      doc.fontSize(18).text('Top Sellers:', { align: 'left' });
      doc.moveDown();

      const tableTop = doc.y;
      doc.font('Helvetica-Bold').fontSize(10);
      doc.text('Seller Name', 50, tableTop);
      doc.text('Email', 200, tableTop);
      doc.text('Products Listed', 400, tableTop);

      doc.moveTo(50, tableTop + 15).lineTo(570, tableTop + 15).stroke();
      doc.font('Helvetica').fontSize(10);

      let rowTop = tableTop + 25;

      const checkAndAddPage = (yPosition) => {
        if (yPosition > 700) {
          doc.addPage();
          return 50;
        }
        return yPosition;
      };

      analyticsData.topSellers.forEach((seller) => {
        rowTop = checkAndAddPage(rowTop);
        doc.text(seller.name.substring(0, 20), 50, rowTop);
        doc.text(seller.email.substring(0, 30), 200, rowTop);
        doc.text(seller.productCount.toString(), 400, rowTop);
        rowTop += 20;
      });

      doc.end();

    } else if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Analytics');

      sheet.columns = [
        { header: 'Seller Name', key: 'name', width: 30 },
        { header: 'Email', key: 'email', width: 30 },
        { header: 'Products Listed', key: 'productCount', width: 20 }
      ];

      analyticsData.topSellers.forEach((seller) => {
        sheet.addRow({
          name: seller.name,
          email: seller.email,
          productCount: seller.productCount
        });
      });

      sheet.addRow({});
      sheet.addRow({ name: 'Total Unique Buyers', productCount: analyticsData.totalUniqueBuyers });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="customer_seller_analytics.xlsx"');

      await workbook.xlsx.write(res);
      res.end();
    } else {
      // JSON response
      res.status(200).json(analyticsData);
    }

  } catch (error) {
    console.error('Error generating Customer & Seller Analytics:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getCustomerSellerAnalytics
};
