const Reservation = require('../../models/reservationModel');
const Product = require('../../models/productModel');
const User = require('../../models/userModel');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

/**
 * Get reservation-based income report for a shop
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getReservationIncomeReport = async (req, res) => {
  const { shopId, format, names } = req.query;

  try {
    // Fetch all reservations linked to products of the shop
    const reservations = await Reservation.find()
      .populate({
        path: 'productID',
        match: { ShopID: shopId },
        populate: { path: 'ShopID', model: 'user' }
      })
      .populate('userID')
      .exec();

    // Filter only reservations where productID is not null (valid products)
    const filteredReservations = reservations.filter(r => r.productID !== null);

    // Map and calculate income details
    const reservationData = filteredReservations.map(r => {
      const sizeObj = r.productID.Size.find(s => s.size === r.size);
      const price = sizeObj?.price || 0;
      const revenue = price * r.Quantity;

      return {
        id: r._id,
        productName: r.productID.productName,
        reservationDate: r.ReservationDate,
        size: r.size,
        quantity: r.Quantity,
        price,
        revenue,
        customer: r.userID?.name || 'Unknown',
        validationStatus: r.ValidateReservation
      };
    });

    // Calculate total revenue
    const totalRevenue = reservationData.reduce((sum, item) => sum + item.revenue, 0);
    
    // Calculate revenue from only confirmed reservations
    const confirmedRevenue = reservationData
      .filter(item => item.validationStatus === 'Confirmed')
      .reduce((sum, item) => sum + item.revenue, 0);

    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 50 });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="reservation_income_report.pdf"');

      doc.pipe(res);

      doc.fontSize(20).text('Reservation Income Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Shop Name: ${names}`, { align: 'left' });
      doc.fontSize(14).text(`Date Generated: ${new Date().toLocaleDateString()}`, { align: 'left' });
      doc.moveDown(2);

      doc.fontSize(16).text(`Total Reservations: ${reservationData.length}`, { align: 'left' });
      doc.fontSize(16).text(`Total Income: LKR ${totalRevenue.toFixed(2)}`, { align: 'left' });
      doc.fontSize(16).text(`Confirmed Income: LKR ${confirmedRevenue.toFixed(2)}`, { align: 'left' });
      doc.moveDown(2);

      // Table Headers
      const tableTop = doc.y;
      doc.font('Helvetica-Bold').fontSize(10);
      doc.text('Product', 50, tableTop);
      doc.text('Date', 160, tableTop);
      doc.text('Size', 250, tableTop);
      doc.text('Qty', 290, tableTop);
      doc.text('Price', 330, tableTop);
      doc.text('Revenue', 380, tableTop);
      doc.text('Customer', 450, tableTop);
      doc.text('Status', 520, tableTop);

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

      reservationData.forEach((item) => {
        rowTop = checkAndAddPage(rowTop);

        const reservationDate = new Date(item.reservationDate).toLocaleDateString();

        doc.text(item.productName.substring(0, 18), 50, rowTop, { width: 100 });
        doc.text(reservationDate, 160, rowTop);
        doc.text(item.size, 250, rowTop);
        doc.text(item.quantity.toString(), 290, rowTop);
        doc.text(`LKR ${item.price.toFixed(2)}`, 330, rowTop);
        doc.text(`LKR ${item.revenue.toFixed(2)}`, 380, rowTop);
        doc.text(item.customer.substring(0, 15), 450, rowTop);
        doc.text(item.validationStatus || 'Pending', 520, rowTop);

        rowTop += 20;
      });

      doc.end();

    } else if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Reservation Income');

      sheet.columns = [
        { header: 'Product Name', key: 'productName', width: 20 },
        { header: 'Reservation Date', key: 'reservationDate', width: 20 },
        { header: 'Size', key: 'size', width: 10 },
        { header: 'Quantity', key: 'quantity', width: 10 },
        { header: 'Price (LKR)', key: 'price', width: 15 },
        { header: 'Revenue (LKR)', key: 'revenue', width: 15 },
        { header: 'Customer', key: 'customer', width: 20 },
        { header: 'Validation Status', key: 'validationStatus', width: 20 }
      ];

      // Add reservation data
      reservationData.forEach((item) => {
        sheet.addRow({
          productName: item.productName,
          reservationDate: new Date(item.reservationDate).toLocaleDateString(),
          size: item.size,
          quantity: item.quantity,
          price: item.price,
          revenue: item.revenue,
          customer: item.customer,
          validationStatus: item.validationStatus
        });
      });

      // Add total summary at the bottom
      sheet.addRow({});
      sheet.addRow({
        productName: 'Total Income',
        revenue: totalRevenue
      });
      sheet.addRow({
        productName: 'Confirmed Income',
        revenue: confirmedRevenue
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="reservation_income_report.xlsx"');

      await workbook.xlsx.write(res);
      res.end();
    } else {
      res.status(200).json({
        totalReservations: reservationData.length,
        totalIncome: totalRevenue,
        confirmedIncome: confirmedRevenue, 
        reservations: reservationData
      });
    }
  } catch (error) {
    console.error('Error generating reservation income report:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getReservationIncomeReport
};