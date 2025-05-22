const Bid = require('../../models/bidModel');
const Product = require('../../models/productModel');
const User = require('../../models/userModel');
const WinningBid = require('../../models/winningBidModel');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const nodemailer = require('nodemailer');

/**
 * Process expired bids, close them, and store winner information
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const processBidCloseouts = async (req, res) => {
  try {
    // Find all active bids where close date has passed
    const currentDate = new Date();
    const expiredBids = await Bid.find({
      closeDate: { $lt: currentDate },
      status: "active"
    }).populate('productID').exec();

    if (!expiredBids || expiredBids.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No expired bids to process',
        processedBids: []
      });
    }

    const processedBids = [];
    const errors = [];

    // Process each expired bid
    for (const bid of expiredBids) {
      try {
        // Find highest bidder
        let highestBid = null;
        let highestBidder = null;

        if (bid.bidder && Array.isArray(bid.bidder) && bid.bidder.length > 0) {
          // Sort bidders by bidAmount in descending order
          const sortedBidders = [...bid.bidder].sort((a, b) => b.bidAmount - a.bidAmount);
          highestBid = sortedBidders[0];

          if (highestBid && highestBid.userID) {
            // Get bidder details
            highestBidder = await User.findById(highestBid.userID);
          }
        }

        // Close the bid by changing status
        bid.status = "closed";
        await bid.save();

        const productName = bid.productID ? bid.productID.productName : 'Unknown Product';

        if (highestBid && highestBidder) {
          // Create winning bid record
          const winningBid = new WinningBid({
            bidID: bid._id,
            productID: bid.productID._id,
            userID: highestBid.userID,
            bidAmount: highestBid.bidAmount,
            closeDate: bid.closeDate
          });
          await winningBid.save();

          // Send email to winner
          try {
            await sendWinnerEmail(highestBidder.email, bid, highestBid.bidAmount);
          } catch (emailError) {
            console.error('Error sending winner email:', emailError);
            // Continue processing even if email fails
          }

          processedBids.push({
            bidID: bid._id.toString(),
            productName: productName,
            winningAmount: highestBid.bidAmount,
            winner: highestBidder.name || 'Unknown User',
            winnerEmail: highestBidder.email || 'Unknown Email'
          });
        } else {
          processedBids.push({
            bidID: bid._id.toString(),
            productName: productName,
            winningAmount: 0,
            winner: 'No bidders',
            winnerEmail: 'N/A'
          });
        }
      } catch (bidError) {
        console.error(`Error processing bid ${bid._id}:`, bidError);
        errors.push({
          bidID: bid._id.toString(),
          error: bidError.message
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Processed ${processedBids.length} expired bids`,
      processedBids,
      errors: errors.length > 0 ? errors : []
    });
  } catch (err) {
    console.error('Error processing bid closeouts:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while processing bids',
      error: err.message
    });
  }
};

/**
 * Send email notification to auction winner
 * @param {String} email - Recipient email address
 * @param {Object} bid - Bid object with product details
 * @param {Number} amount - Winning bid amount
 */


const sendWinnerEmail = async (email, bid, amount) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.SECRET_PASS
    }
  });

  const productName = bid.productID ? bid.productID.productName : 'Unknown Product';
  
  await transporter.sendMail({
    from: `"Auction System" <${process.env.EMAIL_ADDRESS || 'noreply@auctionsystem.com'}>`,
    to: email,
    subject: `Congratulations! You've won the auction for ${productName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>🎉 Congratulations!</h2>
        <p>You are the winning bidder for <strong>${productName}</strong>.</p>
        <p>Your winning bid: <strong>$${amount.toFixed(2)}</strong></p>
        <p>The seller will contact you shortly with payment instructions and delivery details.</p>
        <p>Thank you for participating in our auction!</p>
        <hr />
        <p style="font-size: 12px; color: #666;">This is an automated message, please do not reply to this email.</p>
      </div>
    `
  });
};


/**
 * Get bid income statistics by shop/seller
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getBidIncomeStats = async (req, res) => {
  try {
    const { shopId, startDate, endDate, format } = req.query;

    if (!shopId) {
      return res.status(400).json({ success: false, message: 'Shop ID is required' });
    }

    // Date filter
    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
    }

    // Find products for the shop
    const products = await Product.find({ ShopID: shopId }); // CASE FIXED!
    const productIds = products.map(p => p._id);

    if (productIds.length === 0) {
      return res.status(200).json({ success: true, data: [], summary: { totalBids: 0, totalRevenue: "0.00", totalProfit: "0.00" } });
    }

    const bidQuery = {
      productID: { $in: productIds }
    };

    if (Object.keys(dateFilter).length) {
      bidQuery.closeDate = dateFilter;
    }

    const winningBids = await WinningBid.find(bidQuery)
      .populate('productID')
      .populate('bidID')
      .exec();

    const bidIncomeData = await Promise.all(winningBids.map(async (win) => {
      const product = win.productID;
      const bid = win.bidID;
      if (!product || !bid) return null;

      let buyerName = 'Unknown';
      try {
        const buyer = await User.findById(win.userID);
        if (buyer) buyerName = buyer.name || buyer.email || 'Unknown';
      } catch (err) {
        console.error('Error getting user:', err.message);
      }

      const cost = product.costPrice || 0;
      const revenue = win.bidAmount || 0;
      const netProfit = revenue - cost;

      return {
        id: win._id,
        productId: product._id,
        productName: product.productName,
        closeDate: win.closeDate,
        startPrice: bid.startPrice || 0,
        winningBidAmount: revenue,
        buyerName,
        netProfit,
        bidId: bid._id
      };
    }));

    const filteredData = bidIncomeData.filter(item => item !== null);

    const summary = {
      totalBids: filteredData.length,
      totalRevenue: filteredData.reduce((sum, item) => sum + item.winningBidAmount, 0).toFixed(2),
      totalProfit: filteredData.reduce((sum, item) => sum + item.netProfit, 0).toFixed(2)
    };

    if (format?.toLowerCase() === 'pdf') {
      return exportToPDF(res, filteredData, summary, startDate, endDate);
    }

    if (format?.toLowerCase() === 'excel') {
      return exportToExcel(res, filteredData, summary, startDate, endDate);
    }

    return res.status(200).json({
      success: true,
      data: filteredData,
      summary
    });

  } catch (err) {
    console.error('Error fetching bid income stats:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching bid income statistics',
      error: err.message
    });
  }
};

/**
 * Export bid income data to PDF
 * @param {Object} res - Express response object
 * @param {Array} data - Bid data to export
 * @param {Object} summary - Summary statistics
 * @param {String} startDate - Start date of the report period
 * @param {String} endDate - End date of the report period
 */
const exportToPDF = (res, data, summary, startDate, endDate) => {
  try {
    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50, size: 'A4', layout: 'landscape' });
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=bid-income-report-${Date.now()}.pdf`);
    
    // Pipe the PDF directly to the response
    doc.pipe(res);
    
    // Add title
    doc.fontSize(20).text('Bid Income Report', { align: 'center' });
    doc.moveDown();
    
    // Add date range
    if (startDate && endDate) {
      doc.fontSize(12).text(`Report Period: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`, { align: 'center' });
      doc.moveDown();
    }
    
    // Add summary
    doc.fontSize(16).text('Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Total Auctions: ${summary.totalBids}`);
    doc.fontSize(12).text(`Total Revenue: $${parseFloat(summary.totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    doc.fontSize(12).text(`Total Net Profit: $${parseFloat(summary.totalProfit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    
    // Calculate profit margin
    const totalRevenue = parseFloat(summary.totalRevenue);
    const profitMargin = totalRevenue > 0 
      ? ((parseFloat(summary.totalProfit) / totalRevenue) * 100).toFixed(1) 
      : 0;
    doc.fontSize(12).text(`Profit Margin: ${profitMargin}%`);
    doc.moveDown(2);
    
    // Add detailed table
    if (data.length > 0) {
      doc.fontSize(16).text('Auction Details', { underline: true });
      doc.moveDown();
      
      // Define column layout with improved widths for better text display
      const leftMargin = doc.x;
      const pageWidth = doc.page.width - 100; // Total usable width (accounting for margins)
      
      // Define column widths as proportions of the page
      const colWidths = [
        Math.floor(pageWidth * 0.22), // Product (wider for product names)
        Math.floor(pageWidth * 0.12), // Close Date
        Math.floor(pageWidth * 0.16), // Buyer (wider for names)
        Math.floor(pageWidth * 0.12), // Start Price
        Math.floor(pageWidth * 0.12), // Winning Bid
        Math.floor(pageWidth * 0.12), // Net Profit
        Math.floor(pageWidth * 0.10)  // Profit %
      ];
      
      const colMargin = 10; // Increased margin between columns
      
      // Calculate absolute positions for each column
      const colPositions = [];
      let currentPos = leftMargin;
      colWidths.forEach(width => {
        colPositions.push(currentPos);
        currentPos += width + colMargin;
      });
      
      // Draw table headers
      const tableTop = doc.y;
      const headers = ['Product', 'Close Date', 'Buyer', 'Start Price', 'Winning Bid', 'Net Profit', 'Profit %'];
      
      // Add background for header row
      doc.rect(leftMargin - 5, tableTop - 5, pageWidth + 10, 20).fill('#f0f0f0');
      
      doc.fillColor('#000000'); // Reset to black text
      doc.fontSize(10);
      headers.forEach((header, i) => {
        const align = i >= 3 ? 'right' : 'left'; // Right-align numeric columns
        doc.text(header, colPositions[i], tableTop, { 
          width: colWidths[i], 
          align: align,
          underline: true
        });
      });
      
      doc.moveDown(1);
      
      // Draw table rows
      let rowTop = doc.y + 5;
      let alternate = false;
      
      data.forEach((item, i) => {
        // Check if we need a new page
        if (rowTop > doc.page.height - 60) {
          doc.addPage({ margin: 50, size: 'A4', layout: 'landscape' });
          rowTop = doc.y + 10;
          
          // Add headers to new page
          const newPageTableTop = doc.y;
          
          // Add header background
          doc.rect(leftMargin - 5, newPageTableTop - 5, pageWidth + 10, 20).fill('#f0f0f0');
          
          doc.fillColor('#000000');
          doc.fontSize(10);
          headers.forEach((header, i) => {
            const align = i >= 3 ? 'right' : 'left';
            doc.text(header, colPositions[i], newPageTableTop, { 
              width: colWidths[i], 
              align: align,
              underline: true
            });
          });
          
          doc.moveDown(1);
          rowTop = doc.y + 5;
        }
        
        // Light background for alternate rows
        alternate = !alternate;
        if (alternate) {
          doc.rect(leftMargin - 5, rowTop - 2, pageWidth + 10, 16).fill('#f8f8f8');
        }
        
        // Format data for display
        const formattedDate = new Date(item.closeDate).toLocaleDateString();
        const formattedStartPrice = `$${(item.startPrice || 0).toFixed(2)}`;
        const formattedBid = `$${item.winningBidAmount.toFixed(2)}`;
        const formattedProfit = `$${item.netProfit.toFixed(2)}`;
        const itemProfitMargin = item.winningBidAmount > 0 
          ? ((item.netProfit / item.winningBidAmount) * 100).toFixed(1) 
          : '0.0';
        
        // Create row data array
        const rowData = [
          item.productName || 'Unknown',
          formattedDate,
          item.buyerName || 'Unknown',
          formattedStartPrice,
          formattedBid,
          formattedProfit,
          `${itemProfitMargin}%`
        ];
        
        doc.fontSize(9);
        doc.fillColor('#000000'); // Reset to default color
        
        // Print each cell value at the correct position
        rowData.forEach((value, j) => {
          // Apply red color for negative profit values
          if ((j === 5 || j === 6) && item.netProfit < 0) {
            doc.fillColor('red');
          } else {
            doc.fillColor('#000000');
          }
          
          // Right align numeric columns (index 3 and higher)
          const align = j >= 3 ? 'right' : 'left';
          
          // Add a bit of padding to the text within columns
          doc.text(value, colPositions[j], rowTop, { 
            width: colWidths[j], 
            align: align,
            ellipsis: true,
            height: 12
          });
        });
        
        // Advance to next row position
        doc.moveDown(0.8);
        rowTop = doc.y + 3;
      });
      
      // Add bottom border to table
      doc.lineWidth(0.5);
      doc.strokeColor('#cccccc');
      doc.moveTo(leftMargin - 5, rowTop).lineTo(leftMargin + pageWidth + 5, rowTop).stroke();
    } else {
      doc.fontSize(12).text('No auction data available for the selected period', { italic: true });
    }
    
    // Add footer with timestamp
    doc.fontSize(8).text(
      `Generated on ${new Date().toLocaleString()}`, 
      50, 
      doc.page.height - 30, 
      { align: 'center' }
    );
    
    // Finalize PDF file
    doc.end();
    
    return true;
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF report',
      error: err.message
    });
    return false;
  }
};
/**
 * Export bid income data to Excel
 * @param {Object} res - Express response object
 * @param {Array} data - Bid data to export
 * @param {Object} summary - Summary statistics
 * @param {String} startDate - Start date of the report period
 * @param {String} endDate - End date of the report period
 */
const exportToExcel = async (res, data, summary, startDate, endDate) => {
  try {
    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Bid Income');
    
    // Add title
    worksheet.mergeCells('A1:G1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'Bid Income Report';
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: 'center' };
    
    // Add date range if available
    if (startDate && endDate) {
      worksheet.mergeCells('A2:G2');
      const dateCell = worksheet.getCell('A2');
      dateCell.value = `Report Period: ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`;
      dateCell.font = { size: 12 };
      dateCell.alignment = { horizontal: 'center' };
    }
    
    // Add summary section
    const summaryRowIndex = startDate && endDate ? 4 : 3;
    worksheet.mergeCells(`A${summaryRowIndex}:B${summaryRowIndex}`);
    const summaryTitleCell = worksheet.getCell(`A${summaryRowIndex}`);
    summaryTitleCell.value = 'Summary';
    summaryTitleCell.font = { size: 14, bold: true };
    
    worksheet.getCell(`A${summaryRowIndex + 1}`).value = 'Total Auctions:';
    worksheet.getCell(`B${summaryRowIndex + 1}`).value = summary.totalBids;
    
    worksheet.getCell(`A${summaryRowIndex + 2}`).value = 'Total Revenue:';
    worksheet.getCell(`B${summaryRowIndex + 2}`).value = parseFloat(summary.totalRevenue);
    worksheet.getCell(`B${summaryRowIndex + 2}`).numFmt = '$#,##0.00';
    
    worksheet.getCell(`A${summaryRowIndex + 3}`).value = 'Total Net Profit:';
    worksheet.getCell(`B${summaryRowIndex + 3}`).value = parseFloat(summary.totalProfit);
    worksheet.getCell(`B${summaryRowIndex + 3}`).numFmt = '$#,##0.00';
    
    const totalRevenue = parseFloat(summary.totalRevenue);
    const profitMargin = totalRevenue > 0 
      ? ((parseFloat(summary.totalProfit) / totalRevenue) * 100).toFixed(1) 
      : 0;
    worksheet.getCell(`A${summaryRowIndex + 4}`).value = 'Profit Margin:';
    worksheet.getCell(`B${summaryRowIndex + 4}`).value = profitMargin + '%';
    
    // Style summary cells
    for (let i = 1; i <= 4; i++) {
      worksheet.getCell(`A${summaryRowIndex + i}`).font = { bold: true };
    }
    
    // Add table headers
    const detailsStartRow = summaryRowIndex + 6;
    worksheet.mergeCells(`A${detailsStartRow}:G${detailsStartRow}`);
    const detailsTitleCell = worksheet.getCell(`A${detailsStartRow}`);
    detailsTitleCell.value = 'Auction Details';
    detailsTitleCell.font = { size: 14, bold: true };
    
    const headerRow = detailsStartRow + 2;
    const headers = ['Product', 'Close Date', 'Buyer', 'Start Price', 'Winning Bid', 'Net Profit', 'Profit Margin'];
    
    headers.forEach((header, i) => {
      const cell = worksheet.getCell(headerRow, i + 1);
      cell.value = header;
      cell.font = { bold: true };
      cell.alignment = { horizontal: 'center' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
    });
    
    // Add borders to header
    worksheet.getRow(headerRow).eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    
    // Add data rows
    if (data.length > 0) {
      data.forEach((item, index) => {
        const rowIndex = headerRow + index + 1;
        const row = worksheet.getRow(rowIndex);
        
        // Calculate profit margin
        const profitMargin = item.winningBidAmount > 0 
          ? ((item.netProfit / item.winningBidAmount) * 100).toFixed(1) 
          : '0.0';
        
        row.getCell(1).value = item.productName || 'Unknown';
        row.getCell(2).value = new Date(item.closeDate);
        row.getCell(2).numFmt = 'mm/dd/yyyy';
        row.getCell(3).value = item.buyerName || 'Unknown';
        row.getCell(4).value = item.startPrice || 0;
        row.getCell(4).numFmt = '$#,##0.00';
        row.getCell(5).value = item.winningBidAmount || 0;
        row.getCell(5).numFmt = '$#,##0.00';
        row.getCell(6).value = item.netProfit || 0;
        row.getCell(6).numFmt = '$#,##0.00';
        row.getCell(7).value = profitMargin + '%';
        
        // Add color to negative profit
        if (item.netProfit < 0) {
          row.getCell(6).font = { color: { argb: 'FFFF0000' } };
          row.getCell(7).font = { color: { argb: 'FFFF0000' } };
        }
        
        // Add borders
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });
    } else {
      const noDataRow = headerRow + 1;
      worksheet.mergeCells(`A${noDataRow}:G${noDataRow}`);
      const noDataCell = worksheet.getCell(`A${noDataRow}`);
      noDataCell.value = 'No auction data available for the selected period';
      noDataCell.alignment = { horizontal: 'center' };
      noDataCell.font = { italic: true };
    }
    
    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      let maxLength = 0;
      column.eachCell((cell) => {
        if (cell.value) {
          const cellLength = cell.value.toString().length;
          if (cellLength > maxLength) {
            maxLength = cellLength;
          }
        }
      });
      column.width = maxLength < 12 ? 12 : maxLength + 2;
    });
    
    // Set content type and disposition headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=bid-income-report-${Date.now()}.xlsx`);
    
    // Write to response
    await workbook.xlsx.write(res);
    
    return true;
  } catch (err) {
    console.error('Error generating Excel:', err);
    res.status(500).json({
      success: false,
      message: 'Error generating Excel report',
      error: err.message
    });
    return false;
  }
};

module.exports = {
  processBidCloseouts,
  getBidIncomeStats
};