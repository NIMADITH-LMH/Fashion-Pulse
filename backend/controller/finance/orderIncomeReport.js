const Order = require('../../models/orderModel');
const Product = require('../../models/productModel');
const User = require('../../models/userModel');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

const getSellerIncomeReport = async (req, res) => {
  const { sellerId, startDate, endDate, format } = req.query;

  try {
    // Create date filter if dates are provided
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(`${endDate}T23:59:59.999Z`) // Include the entire end day
      };
    }

    // Find all products that belong to this seller
    const sellerProducts = await Product.find({ ShopID: sellerId });
    
    if (!sellerProducts.length) {
      return res.json({ success: true, data: [] });
    }
    
    const productIds = sellerProducts.map(product => product._id);

    // Find orders containing these products
    const orders = await Order.find({
      productID: { $in: productIds },
      ...dateFilter
    })
      .populate('productID')
      .populate('userID', 'name email');

    // Process orders to extract required data
    const results = await Promise.all(orders.map(async order => {
      // Apply a default commission rate (you might want to adjust this)
      const commissionPercent = 10; // 10% commission
      const commission = (order.TotalAmount * commissionPercent) / 100;
      const netIncome = order.TotalAmount - commission;

      // Get product and user info
      const product = order.productID;
      const user = order.userID;

      return {
        productName: product ? product.productName : 'Unknown Product',
        orderQuantity: order.Quantity,
        totalAmount: order.TotalAmount,
        orderDate: order.createdAt,
        orderStatus: order.Status,
        customer: user ? user.name : 'N/A',
        email: user ? user.email : 'N/A',
        commission,
        netIncome
      };
    }));

    // Handle different export formats
    if (format === 'pdf') {
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="income_report.pdf"');
      doc.pipe(res);
    
      // Add PDF header
      doc.fontSize(20).text('Income Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Date Range: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`, { align: 'center' });
      doc.moveDown(2);
    
      // Add summary
      const totalSales = results.reduce((sum, item) => sum + item.totalAmount, 0);
      const totalCommission = results.reduce((sum, item) => sum + item.commission, 0);
      const totalNetIncome = results.reduce((sum, item) => sum + item.netIncome, 0);
      const totalOrders = results.length;
    
      doc.fontSize(12).text(`Total Sales: $${totalSales.toFixed(2)}`);
      doc.text(`Total Commission: $${totalCommission.toFixed(2)}`);
      doc.text(`Net Income: $${totalNetIncome.toFixed(2)}`);
      doc.text(`Total Orders: ${totalOrders}`);
      doc.moveDown(2);
    
      // Add order details in tabular format
      doc.fontSize(16).text('Order Details', { underline: true });
      doc.moveDown();
    
      // Define table columns and width
      const pageWidth = doc.page.width - 100; // Margins
      const columns = [
        { header: 'Order #', width: pageWidth * 0.08 },
        { header: 'Product', width: pageWidth * 0.2 },
        { header: 'Qty', width: pageWidth * 0.07 },
        { header: 'Amount', width: pageWidth * 0.15 },
        { header: 'Commission', width: pageWidth * 0.15 },
        { header: 'Net Income', width: pageWidth * 0.15 },
        { header: 'Order Date', width: pageWidth * 0.2 }
      ];
    
      // Set initial position
      let xPos = 50;
      let yPos = doc.y;
    
      // Draw table header
      doc.fontSize(10).font('Helvetica-Bold');
      columns.forEach(column => {
        doc.text(column.header, xPos, yPos);
        xPos += column.width;
      });
      doc.moveDown();
      yPos = doc.y;
    
      // Draw a line after header
      doc.moveTo(50, yPos - 5).lineTo(pageWidth + 50, yPos - 5).stroke();
    
      // Draw table rows
      doc.font('Helvetica');
      results.forEach((item, index) => {
        // Check if we need a new page
        if (doc.y > doc.page.height - 100) {
          doc.addPage();
          yPos = 50;
        } else {
          yPos = doc.y;
        }
    
        xPos = 50;
        
        // Draw each column in the row
        doc.text(String(index + 1), xPos, yPos);
        xPos += columns[0].width;
        
        doc.text(item.productName, xPos, yPos, { width: columns[1].width });
        xPos += columns[1].width;
        
        doc.text(String(item.orderQuantity), xPos, yPos);
        xPos += columns[2].width;
        
        doc.text(`$${item.totalAmount.toFixed(2)}`, xPos, yPos);
        xPos += columns[3].width;
        
        doc.text(`$${item.commission.toFixed(2)}`, xPos, yPos);
        xPos += columns[4].width;
        
        doc.text(`$${item.netIncome.toFixed(2)}`, xPos, yPos);
        xPos += columns[5].width;
        
        doc.text(new Date(item.orderDate).toLocaleDateString(), xPos, yPos);
        
        // Calculate the height of this row (based on content)
        const rowHeight = 20; // Fixed height for simplicity
        doc.moveDown();
        
        // Draw a light line after each row
        if (index < results.length - 1) {
          doc.moveTo(50, doc.y - 5).lineTo(pageWidth + 50, doc.y - 5).stroke('#dddddd');
        }
      });
    
      // Add secondary details table - customer info
      doc.moveDown(2);
      doc.fontSize(14).text('Customer Details', { underline: true });
      doc.moveDown();
    
      // Define customer table columns
      const customerColumns = [
        { header: 'Order #', width: pageWidth * 0.1 },
        { header: 'Customer', width: pageWidth * 0.4 },
        { header: 'Email', width: pageWidth * 0.3 },
        { header: 'Status', width: pageWidth * 0.2 }
      ];
    
      // Draw customer table header
      xPos = 50;
      yPos = doc.y;
      doc.fontSize(10).font('Helvetica-Bold');
      customerColumns.forEach(column => {
        doc.text(column.header, xPos, yPos);
        xPos += column.width;
      });
      doc.moveDown();
      yPos = doc.y;
      doc.moveTo(50, yPos - 5).lineTo(pageWidth + 50, yPos - 5).stroke();
    
      // Draw customer table rows
      doc.font('Helvetica');
      results.forEach((item, index) => {
        // Check if we need a new page
        if (doc.y > doc.page.height - 100) {
          doc.addPage();
          yPos = 50;
        } else {
          yPos = doc.y;
        }
    
        xPos = 50;
        
        doc.text(String(index + 1), xPos, yPos);
        xPos += customerColumns[0].width;
        
        doc.text(item.customer, xPos, yPos);
        xPos += customerColumns[1].width;
        
        doc.text(item.email, xPos, yPos);
        xPos += customerColumns[2].width;
        
        doc.text(item.orderStatus, xPos, yPos);
        
        doc.moveDown();
        
        // Draw a light line after each row
        if (index < results.length - 1) {
          doc.moveTo(50, doc.y - 5).lineTo(pageWidth + 50, doc.y - 5).stroke('#dddddd');
        }
      });
    
      doc.end();
    }else if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Income Report');

      // Define Excel columns
      worksheet.columns = [
        { header: 'Product Name', key: 'productName', width: 30 },
        { header: 'Quantity', key: 'orderQuantity', width: 12 },
        { header: 'Total Amount ($)', key: 'totalAmount', width: 15, style: { numFmt: '$#,##0.00' } },
        { header: 'Commission ($)', key: 'commission', width: 15, style: { numFmt: '$#,##0.00' } },
        { header: 'Net Income ($)', key: 'netIncome', width: 15, style: { numFmt: '$#,##0.00' } },
        { header: 'Order Date', key: 'orderDate', width: 20 },
        { header: 'Status', key: 'orderStatus', width: 15 },
        { header: 'Customer', key: 'customer', width: 25 },
        { header: 'Email', key: 'email', width: 30 }
      ];

      // Format dates properly for Excel
      const formattedResults = results.map(item => ({
        ...item,
        orderDate: new Date(item.orderDate).toLocaleDateString()
      }));

      // Add rows
      worksheet.addRows(formattedResults);
      
      // Style the header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      // Add summary at the bottom with a blank row separator
      worksheet.addRow([]);
      worksheet.addRow(['Summary']);
      worksheet.addRow(['Total Sales', '', results.reduce((sum, item) => sum + item.totalAmount, 0)]);
      worksheet.addRow(['Total Commission', '', results.reduce((sum, item) => sum + item.commission, 0)]);
      worksheet.addRow(['Total Net Income', '', results.reduce((sum, item) => sum + item.netIncome, 0)]);
      worksheet.addRow(['Total Orders', results.length]);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="income_report.xlsx"');

      await workbook.xlsx.write(res);
      res.end();
      
    } else {
      // Return JSON data for the frontend
      return res.json({ success: true, data: results });
    }
  } catch (error) {
    console.error('Income report error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      error: error.message 
    });
  }
};

module.exports = getSellerIncomeReport;