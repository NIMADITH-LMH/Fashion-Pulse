const Order = require('../../models/orderModel');
const WinningBid = require('../../models/winningBidModel');
const Reservation = require('../../models/reservationModel');
const Product = require('../../models/productModel');
const User = require('../../models/userModel');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

/**
 * Get total revenue summary (confirmed orders + bid wins + confirmed reservations)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getTotalRevenueSummary = async (req, res) => {
  const { format, year, search } = req.query; // Optional year and search filters

  try {
    const filterByYear = (items, dateField) => {
      if (!year) return items;
      return items.filter(item => new Date(item[dateField]).getFullYear() === parseInt(year));
    };

    // Fetch all data
    const [orders, winningBids, reservations] = await Promise.all([
      // Only get orders with status "Confirmed"
      Order.find({ Status: "Confirmed" }).populate('productID userID'),
      // Get all winning bids as they represent revenue
      WinningBid.find().populate('productID userID'),
      // Only get reservations with status "Confirmed"
      Reservation.find({ ValidateReservation: "Confirmed" }).populate('productID userID'),
    ]);

    // Filter by year if needed
    const filteredOrders = filterByYear(orders, 'createdAt');
    const filteredWinningBids = filterByYear(winningBids, 'createdAt');
    const filteredReservations = filterByYear(reservations, 'createdAt');

    // Structure all data
    const orderSales = filteredOrders.map(order => ({
      type: 'Order',
      productName: order.productID?.productName || 'Unknown',
      buyerName: order.userID?.name || 'Unknown',
      buyerEmail: order.userID?.email || 'Unknown',
      amount: order.TotalAmount,
      date: order.createdAt,
      status: order.status
    }));

    const bidSales = filteredWinningBids.map(bid => ({
      type: 'Winning Bid',
      productName: bid.productID?.productName || 'Unknown',
      buyerName: bid.userID?.name || 'Unknown',
      buyerEmail: bid.userID?.email || 'Unknown',
      amount: bid.bidAmount,
      date: bid.createdAt,
      status: 'Completed' // Winning bids are always completed
    }));

    const reservationSales = filteredReservations.map(res => ({
      type: 'Reservation',
      productName: res.productID?.productName || 'Unknown',
      buyerName: res.userID?.name || 'Unknown',
      buyerEmail: res.userID?.email || 'Unknown',
      amount: res.Quantity * (res.productID?.Size?.find(s => s.size === res.size)?.price || 0),
      date: res.createdAt,
      status: res.status
    }));

    let allSales = [...orderSales, ...bidSales, ...reservationSales];

    // Apply search filter if provided
    if (search) {
      const searchLower = search.toLowerCase();
      allSales = allSales.filter(sale => {
        return (
          sale.productName.toLowerCase().includes(searchLower) ||
          sale.buyerName.toLowerCase().includes(searchLower) ||
          sale.buyerEmail.toLowerCase().includes(searchLower) ||
          sale.type.toLowerCase().includes(searchLower) ||
          new Date(sale.date).toLocaleDateString().includes(search) ||
          sale.amount.toString().includes(search) ||
          (sale.status && sale.status.toLowerCase().includes(searchLower))
        );
      });
    }

    // Sort sales by date
    allSales.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Total Revenue
    const totalRevenue = allSales.reduce((sum, sale) => sum + sale.amount, 0);

    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 50 });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="total_revenue_summary.pdf"');

      doc.pipe(res);

      // Title
      doc.fontSize(20).text('Total Revenue Summary Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Date Generated: ${new Date().toLocaleDateString()}`, { align: 'left' });
      if (year) doc.text(`Year: ${year}`, { align: 'left' });
      if (search) doc.text(`Search: ${search}`, { align: 'left' });
      doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, { align: 'left' });
      doc.text(`Total Transactions: ${allSales.length}`, { align: 'left' });
      doc.moveDown(2);

      // Table header
      const tableTop = doc.y;
      doc.font('Helvetica-Bold');
      doc.fontSize(10);
      doc.text('Type', 50, tableTop);
      doc.text('Product', 120, tableTop);
      doc.text('Amount', 250, tableTop);
      doc.text('Date', 330, tableTop);
      doc.text('Buyer', 420, tableTop);
      doc.text('Status', 500, tableTop);

      doc.moveTo(50, tableTop + 15)
        .lineTo(550, tableTop + 15)
        .stroke();

      // Table rows
      let rowTop = tableTop + 25;
      doc.font('Helvetica');

      const checkPageBreak = (y) => {
        if (y > 700) {
          doc.addPage();
          return 50;
        }
        return y;
      };

      allSales.forEach(item => {
        rowTop = checkPageBreak(rowTop);

        doc.fontSize(10).text(item.type, 50, rowTop);
        doc.text(item.productName.substring(0, 20), 120, rowTop);
        doc.text(`$${item.amount.toFixed(2)}`, 250, rowTop);
        doc.text(new Date(item.date).toLocaleDateString(), 330, rowTop);
        doc.text(item.buyerName.substring(0, 20), 420, rowTop);
        doc.text(item.status || 'Completed', 500, rowTop);

        rowTop += 20;
      });

      doc.end();
    } else if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Total Revenue Summary');

      // Headers
      worksheet.columns = [
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Product Name', key: 'productName', width: 30 },
        { header: 'Amount ($)', key: 'amount', width: 15 },
        { header: 'Date', key: 'date', width: 20 },
        { header: 'Buyer Name', key: 'buyerName', width: 25 },
        { header: 'Buyer Email', key: 'buyerEmail', width: 30 },
        { header: 'Status', key: 'status', width: 15 }
      ];

      // Data rows
      allSales.forEach(item => {
        worksheet.addRow({
          type: item.type,
          productName: item.productName,
          amount: item.amount,
          date: new Date(item.date).toLocaleDateString(),
          buyerName: item.buyerName,
          buyerEmail: item.buyerEmail,
          status: item.status || 'Completed'
        });
      });

      // Total Revenue Row
      worksheet.addRow({});
      worksheet.addRow({ 
        type: 'Total Revenue', 
        amount: totalRevenue,
        date: '',
        buyerName: `Total Transactions: ${allSales.length}`
      });

      // Styling
      worksheet.getRow(1).font = { bold: true };
      worksheet.getColumn('amount').numFmt = '$#,##0.00';

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="total_revenue_summary.xlsx"');

      await workbook.xlsx.write(res);
      res.end();
    } else {
      // Default JSON response
      res.status(200).json({
        totalRevenue,
        salesData: allSales
      });
    }
  } catch (error) {
    console.error('Error fetching revenue summary:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

module.exports = { getTotalRevenueSummary };