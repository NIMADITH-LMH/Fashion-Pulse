const WinningBid = require('../../models/winningBidModel');
const Product = require('../../models/productModel');
const User = require('../../models/userModel');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

/**
 * Get bidding sales income statistics for admin
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getBiddingSalesIncome = async (req, res) => {
  const { format } = req.query;

  try {
    // Fetch all winning bids
    const winningBids = await WinningBid.find()
      .populate('productID')
      .populate('userID')
      .exec();

    // Map data into structured format
    const salesData = winningBids.map(wb => ({
      id: wb._id,
      productName: wb.productID?.productName || 'Unknown',
      brandName: wb.productID?.brandName || 'Unknown',
      bidAmount: wb.bidAmount,
      closeDate: wb.closeDate,
      buyerName: wb.userID?.name || 'Unknown',
      buyerEmail: wb.userID?.email || 'Unknown',
    }));

    // Calculate total income
    const totalIncome = salesData.reduce((sum, item) => sum + item.bidAmount, 0);

    // Generate response based on requested format
    if (format === 'pdf') {
      // Create PDF document with enhanced styling
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4'
      });

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="bidding_sales_income_report.pdf"');
      
      // Pipe the PDF to the response
      doc.pipe(res);

      // Define colors
      const colors = {
        primaryBlue: '#0047AB',
        lightBlue: '#E6F3FF',
        darkGray: '#333333',
        lightGray: '#F0F0F0'
      };

      // Add header with title
      doc.rect(50, 50, doc.page.width - 100, 60)
         .fill(colors.lightBlue);
      
      doc.font('Helvetica-Bold')
         .fontSize(22)
         .fillColor(colors.primaryBlue)
         .text('Bidding Sales Income Report', 70, 65);
      
      doc.font('Helvetica')
         .fontSize(12)
         .fillColor(colors.darkGray)
         .text(`Generated on: ${new Date().toLocaleDateString()}`, 70, 95);
      
      // Add summary section
      const summaryY = 150;
      doc.font('Helvetica-Bold')
         .fontSize(16)
         .fillColor(colors.primaryBlue)
         .text('Summary', 50, summaryY);
      
      doc.font('Helvetica')
         .fontSize(12)
         .fillColor(colors.darkGray)
         .text(`Total Sales: ${salesData.length}`, 50, summaryY + 30);
      
      doc.font('Helvetica-Bold')
         .fontSize(14)
         .fillColor(colors.primaryBlue)
         .text(`Total Revenue: $${totalIncome.toFixed(2)}`, 50, summaryY + 50);
      
      doc.font('Helvetica')
         .fontSize(12)
         .fillColor(colors.darkGray);
         
      if (salesData.length > 0) {
        const avgSale = totalIncome / salesData.length;
        doc.text(`Average Sale: $${avgSale.toFixed(2)}`, 50, summaryY + 70);
      }
      
      // Add table header
      const tableTop = summaryY + 120;
      doc.rect(50, tableTop, doc.page.width - 100, 30)
         .fill(colors.primaryBlue);
      
      doc.font('Helvetica-Bold')
         .fontSize(12)
         .fillColor('white');
      
      doc.text('Product', 60, tableTop + 10);
      doc.text('Brand', 180, tableTop + 10);
      doc.text('Amount', 280, tableTop + 10);
      doc.text('Date', 360, tableTop + 10);
      doc.text('Buyer', 440, tableTop + 10);
      
      // Table rows
      let rowTop = tableTop + 40;
      let isEvenRow = false;
      
      doc.font('Helvetica')
         .fontSize(10)
         .fillColor(colors.darkGray);
      
      // Function to check and handle page breaks
      const checkPageBreak = (y, rowHeight = 30) => {
        if (y + rowHeight > doc.page.height - 100) {
          doc.addPage();
          
          // Add header on new page
          doc.font('Helvetica-Bold')
             .fontSize(14)
             .fillColor(colors.primaryBlue)
             .text('Bidding Sales Income Report (Continued)', 50, 50);
          
          // Add table header on new page
          doc.rect(50, 80, doc.page.width - 100, 30)
             .fill(colors.primaryBlue);
          
          doc.font('Helvetica-Bold')
             .fontSize(12)
             .fillColor('white');
          
          doc.text('Product', 60, 90);
          doc.text('Brand', 180, 90);
          doc.text('Amount', 280, 90);
          doc.text('Date', 360, 90);
          doc.text('Buyer', 440, 90);
          
          return 120; // Return the new y position
        }
        return y;
      };
      
      // Add table rows
      salesData.forEach(item => {
        rowTop = checkPageBreak(rowTop);
        
        // Add zebra striping
        if (isEvenRow) {
          doc.rect(50, rowTop - 5, doc.page.width - 100, 30)
             .fill(colors.lightGray);
        }
        isEvenRow = !isEvenRow;
        
        // Add row data
        doc.fillColor(colors.darkGray);
        
        // Function to truncate text
        const truncate = (text, maxLength) => {
          return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
        };
        
        doc.text(truncate(item.productName, 20), 60, rowTop);
        doc.text(truncate(item.brandName, 15), 180, rowTop);
        doc.text(`$${item.bidAmount.toFixed(2)}`, 280, rowTop);
        doc.text(new Date(item.closeDate).toLocaleDateString(), 360, rowTop);
        doc.text(truncate(item.buyerName, 15), 440, rowTop);
        
        rowTop += 30;
      });
      
      // Add footer with total
      const footerY = checkPageBreak(rowTop + 20);
      
      doc.rect(doc.page.width - 200, footerY, 150, 40)
         .fill(colors.primaryBlue);
      
      doc.font('Helvetica-Bold')
         .fontSize(14)
         .fillColor('white')
         .text('TOTAL:', doc.page.width - 190, footerY + 10);
      
      doc.font('Helvetica-Bold')
         .fontSize(14)
         .fillColor('white')
         .text(`$${totalIncome.toFixed(2)}`, doc.page.width - 100, footerY + 10);
      
      // Finalize the PDF
      doc.end();
    } else if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Bidding Sales Income');

      // Headers
      worksheet.columns = [
        { header: 'Product Name', key: 'productName', width: 30 },
        { header: 'Brand Name', key: 'brandName', width: 20 },
        { header: 'Bid Amount ($)', key: 'bidAmount', width: 15 },
        { header: 'Close Date', key: 'closeDate', width: 20 },
        { header: 'Buyer Name', key: 'buyerName', width: 25 },
        { header: 'Buyer Email', key: 'buyerEmail', width: 30 },
      ];

      // Data rows
      salesData.forEach(item => {
        worksheet.addRow({
          productName: item.productName,
          brandName: item.brandName,
          bidAmount: item.bidAmount,
          closeDate: new Date(item.closeDate).toLocaleDateString(),
          buyerName: item.buyerName,
          buyerEmail: item.buyerEmail,
        });
      });

      // Total Income Row
      worksheet.addRow({});
      worksheet.addRow({ productName: 'Total Income', bidAmount: totalIncome });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="bidding_sales_income_report.xlsx"');

      await workbook.xlsx.write(res);
      res.end();
    } else {
      // Default JSON response
      res.status(200).json({
        totalIncome,
        salesData
      });
    }
  } catch (error) {
    console.error('Error generating bidding sales income report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getBiddingSalesIncome
};
