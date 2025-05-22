// controllers/bidController.js

const Bid = require('../../models/bidModel');
const WinningBid = require('../../models/winningBidModel');
const Product = require('../../models/productModel');
const User = require('../../models/userModel');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// ✅ View All Live/Completed Bids (optional filter by status)
const getAllBids = async (req, res) => {
  const { status } = req.query;

  try {
    const filter = {};
    if (status) {
      filter.status = status; // active / completed
    }

    const bids = await Bid.find(filter)
      .populate('productID', 'productName brandName category')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: bids });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch bids.' });
  }
};

// ✅ View Single Bid Details with Bidder List
const getBidDetail = async (req, res) => {
  const { bidId } = req.params;

  try {
    const bid = await Bid.findById(bidId)
      .populate('productID', 'productName brandName category')
      .populate('bidder.userID', 'name email profilePic');

    if (!bid) {
      return res.status(404).json({ success: false, message: 'Bid not found.' });
    }

    res.json({ success: true, data: bid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch bid details.' });
  }
};

// ✅ Update Bid Duration (closeDate)
const updateBidDuration = async (req, res) => {
  const { bidId } = req.params;
  const { closeDate } = req.body;

  try {
    const bid = await Bid.findByIdAndUpdate(
      bidId,
      { closeDate: new Date(closeDate) },
      { new: true }
    );

    if (!bid) {
      return res.status(404).json({ success: false, message: 'Bid not found.' });
    }

    res.json({ success: true, message: 'Bid close date updated successfully.', data: bid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to update bid duration.' });
  }
};

// ✅ Archive Completed Bids
const archiveCompletedBids = async (req, res) => {
  try {
    const result = await Bid.updateMany(
      { closeDate: { $lt: new Date() }, status: 'active' },
      { $set: { status: 'completed' } }
    );

    res.json({ success: true, message: 'Completed bids archived successfully.', data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to archive bids.' });
  }
};

// ✅ Resolve Disputes (Declare Winning Bid Manually)
const resolveDispute = async (req, res) => {
  const { bidId, userId, bidAmount } = req.body;

  try {
    const bid = await Bid.findById(bidId);

    if (!bid) {
      return res.status(404).json({ success: false, message: 'Bid not found.' });
    }

    // Create a winning bid
    const winningBid = new WinningBid({
      bidID: bid._id,
      productID: bid.productID,
      userID: userId,
      bidAmount: bidAmount,
      closeDate: bid.closeDate
    });

    await winningBid.save();

    // Update bid status to completed
    bid.status = 'completed';
    await bid.save();

    res.json({ success: true, message: 'Dispute resolved, winner declared.', data: winningBid });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to resolve dispute.' });
  }
};

// ✅ Generate Bids Report (PDF or Excel)
const generateBidReport = async (req, res) => {
  const { status, startDate, endDate, format } = req.query;

  try {
    const filter = {};
    if (status) filter.status = status;
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(`${endDate}T23:59:59.999Z`)
      };
    }

    const bids = await Bid.find(filter)
      .populate('productID', 'productName brandName')
      .populate('bidder.userID', 'name email');

    if (!bids.length) {
      return res.status(404).json({ success: false, message: 'No bids found for the given criteria.' });
    }

    const bidData = bids.map((bid, index) => ({
      bidNumber: index + 1,
      productName: bid.productID?.productName || 'Unknown',
      brandName: bid.productID?.brandName || 'Unknown',
      startPrice: bid.startPrice,
      highestBid: Math.max(...bid.bidder.map(b => b.bidAmount), 0),
      status: bid.status,
      closeDate: bid.closeDate,
      biddersCount: bid.bidder.length
    }));

    // --- PDF Generation ---
   // --- PDF Generation ---
if (format === 'pdf') {
  const doc = new PDFDocument({ margin: 30, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="bid_report.pdf"');
  doc.pipe(res);

  // Title
  doc.fontSize(20).text('Bid Report', { align: 'center' });
  doc.moveDown(2);

  // Table header config
  const tableTop = doc.y;
  const itemMargin = 5;
  const columnWidths = {
    bidNumber: 50,
    productName: 120,
    brandName: 80,
    startPrice: 70,
    highestBid: 70,
    status: 60,
    closeDate: 80,
    biddersCount: 60,
  };

  // Draw header
  doc.fontSize(10).font('Helvetica-Bold');
  doc.text('Bid #', 50, tableTop, { width: columnWidths.bidNumber });
  doc.text('Product Name', 100, tableTop, { width: columnWidths.productName });
  doc.text('Brand', 220, tableTop, { width: columnWidths.brandName });
  doc.text('Start Price', 300, tableTop, { width: columnWidths.startPrice });
  doc.text('Highest Bid', 370, tableTop, { width: columnWidths.highestBid });
  doc.text('Status', 440, tableTop, { width: columnWidths.status });
  doc.text('Close Date', 500, tableTop, { width: columnWidths.closeDate });
  doc.text('Bidders', 580, tableTop, { width: columnWidths.biddersCount });

  doc.moveDown(0.5);
  doc.moveTo(40, doc.y).lineTo(570, doc.y).stroke(); // line after header
  doc.moveDown(0.5);

  // Reset font
  doc.font('Helvetica');

  let yPosition = doc.y;

  bidData.forEach(bid => {
    if (yPosition > 750) { // Check for page break
      doc.addPage();
      yPosition = 50;
    }

    doc.fontSize(9)
      .text(bid.bidNumber.toString(), 50, yPosition, { width: columnWidths.bidNumber })
      .text(bid.productName, 100, yPosition, { width: columnWidths.productName })
      .text(bid.brandName, 220, yPosition, { width: columnWidths.brandName })
      .text(`LKR. ${bid.startPrice}`, 300, yPosition, { width: columnWidths.startPrice })
      .text(`LKR. ${bid.highestBid}`, 370, yPosition, { width: columnWidths.highestBid })
      .text(bid.status, 440, yPosition, { width: columnWidths.status })
      .text(new Date(bid.closeDate).toLocaleDateString(), 500, yPosition, { width: columnWidths.closeDate })
      .text(bid.biddersCount.toString(), 580, yPosition, { width: columnWidths.biddersCount });

    yPosition += 20; // space between rows
  });

  doc.end();
}

    else if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Bid Report');

      worksheet.columns = [
        { header: 'Bid #', key: 'bidNumber', width: 10 },
        { header: 'Product Name', key: 'productName', width: 30 },
        { header: 'Brand Name', key: 'brandName', width: 20 },
        { header: 'Start Price', key: 'startPrice', width: 15 },
        { header: 'Highest Bid', key: 'highestBid', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Close Date', key: 'closeDate', width: 25 },
        { header: 'Bidders Count', key: 'biddersCount', width: 15 }
      ];

      bidData.forEach(bid => {
        worksheet.addRow(bid);
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="bid_report.xlsx"');

      await workbook.xlsx.write(res);
      res.end();

    } else {
      res.status(400).json({ success: false, message: 'Invalid format. Choose pdf or excel.' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to generate bid report.' });
  }
};

module.exports = {
  getAllBids,
  getBidDetail,
  updateBidDuration,
  archiveCompletedBids,
  resolveDispute,
  generateBidReport
};
