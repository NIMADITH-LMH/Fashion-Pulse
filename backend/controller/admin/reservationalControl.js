const Reservation = require('../../models/reservationModel');
const Product = require('../../models/productModel');
const User = require('../../models/userModel');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

const getReservations = async (req, res) => {
  const { productID, userID, status, startDate, endDate, format } = req.query;

  try {
    // Build filter object
    const filter = {};

    if (productID) {
      filter.productID = productID;
    }
    if (userID) {
      filter.userID = userID;
    }
    if (status) {
      filter.ValidateReservation = status;
    }
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(`${endDate}T23:59:59.999Z`)
      };
    }

    // Fetch reservations with populated user and product info
    const reservations = await Reservation.find(filter)
      .populate('productID', 'productName brandName category')
      .populate('userID', 'name email');

    // If export is requested
    if (format === 'pdf') {
      // Create enhanced PDF document with tabular format
      await generateReservationsPDFReport(res, reservations, { startDate, endDate });
      return;
    }

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Reservations');

      worksheet.columns = [
        { header: 'Reservation ID', key: 'id', width: 25 },
        { header: 'Product Name', key: 'productName', width: 20 },
        { header: 'Brand', key: 'brandName', width: 20 },
        { header: 'User Name', key: 'userName', width: 20 },
        { header: 'User Email', key: 'userEmail', width: 25 },
        { header: 'Size', key: 'size', width: 10 },
        { header: 'Quantity', key: 'quantity', width: 10 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Reservation Date', key: 'reservationDate', width: 20 },
      ];

      reservations.forEach(reservation => {
        worksheet.addRow({
          id: reservation.ReservationID,
          productName: reservation.productID?.productName || 'N/A',
          brandName: reservation.productID?.brandName || 'N/A',
          userName: reservation.userID?.name || 'N/A',
          userEmail: reservation.userID?.email || 'N/A',
          size: reservation.size,
          quantity: reservation.Quantity,
          status: reservation.ValidateReservation || 'Pending',
          reservationDate: reservation.ReservationDate
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="reservations_report.xlsx"');

      await workbook.xlsx.write(res);
      res.end();
      return;
    }

    // Return normal JSON if no export
    res.json({ success: true, data: reservations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

/**
 * Generate an enhanced PDF report with tabular format for reservations
 * @param {Object} res - Express response object
 * @param {Array} reservations - Array of reservation objects
 * @param {Object} filters - Filter options like date range
 */
const generateReservationsPDFReport = async (res, reservations, filters) => {
  // Create a new PDF document
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    autoFirstPage: true
  });

  // Pipe the PDF to the response
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="reservations_report.pdf"');
  doc.pipe(res);

  // Define colors for styling
  const colors = {
    primary: '#0047AB', // Strong Blue
    secondary: '#333333', // Dark Gray
    lightGray: '#F0F0F0', // Light Gray for alternating rows
    headerBg: '#0047AB', // Header background
    headerText: '#FFFFFF', // Header text
    borderColor: '#CCCCCC' // Border color
  };

  // Add title and header
  doc.font('Helvetica-Bold')
     .fontSize(22)
     .fillColor(colors.primary)
     .text('Reservation Report', { align: 'center' });
  
  doc.moveDown();

  // Add date range if specified
  if (filters.startDate && filters.endDate) {
    doc.font('Helvetica')
       .fontSize(12)
       .fillColor(colors.secondary)
       .text(`Date Range: ${new Date(filters.startDate).toLocaleDateString()} - ${new Date(filters.endDate).toLocaleDateString()}`, 
        { align: 'center' });
    doc.moveDown();
  }

  // Add summary count
  doc.font('Helvetica-Bold')
     .fontSize(14)
     .fillColor(colors.primary)
     .text(`Total Reservations: ${reservations.length}`, { align: 'left' });
  
  doc.moveDown(2);

  // Prepare for table - define column widths
  const pageWidth = doc.page.width - 100;
  const columns = {
    id: { x: 50, width: pageWidth * 0.15, name: 'ID' },
    product: { x: 50 + pageWidth * 0.15, width: pageWidth * 0.20, name: 'Product' },
    user: { x: 50 + pageWidth * 0.35, width: pageWidth * 0.15, name: 'User' },
    size: { x: 50 + pageWidth * 0.50, width: pageWidth * 0.10, name: 'Size' },
    qty: { x: 50 + pageWidth * 0.60, width: pageWidth * 0.10, name: 'Qty' },
    status: { x: 50 + pageWidth * 0.70, width: pageWidth * 0.15, name: 'Status' },
    date: { x: 50 + pageWidth * 0.85, width: pageWidth * 0.15, name: 'Date' }
  };

  // Draw table header
  const headerY = doc.y;
  
  // Header background
  doc.rect(50, headerY, pageWidth, 30)
     .fill(colors.headerBg);
  
  // Header text
  doc.font('Helvetica-Bold')
     .fontSize(10)
     .fillColor(colors.headerText);
  
  Object.values(columns).forEach(column => {
    doc.text(column.name, column.x + 3, headerY + 10, {
      width: column.width - 6,
      align: column.name === 'Qty' ? 'right' : 'left'
    });
  });

  // Helper function for text truncation
  const truncate = (text, maxLength) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Helper function for handling page breaks
  const checkPageBreak = (y, rowHeight = 25) => {
    if (y + rowHeight > doc.page.height - 50) {
      doc.addPage();
      
      // Add header on new page
      doc.font('Helvetica-Bold')
         .fontSize(14)
         .fillColor(colors.primary)
         .text('Reservation Report (Continued)', 50, 50);
      
      // Redraw table header
      const newHeaderY = 80;
      doc.rect(50, newHeaderY, pageWidth, 30)
         .fill(colors.headerBg);
      
      doc.font('Helvetica-Bold')
         .fontSize(10)
         .fillColor(colors.headerText);
      
      Object.values(columns).forEach(column => {
        doc.text(column.name, column.x + 3, newHeaderY + 10, {
          width: column.width - 6,
          align: column.name === 'Qty' ? 'right' : 'left'
        });
      });
      
      return newHeaderY + 30;
    }
    return y;
  };

  // Draw table rows
  let rowY = headerY + 30;
  let isEvenRow = false;

  for (let i = 0; i < reservations.length; i++) {
    const reservation = reservations[i];
    rowY = checkPageBreak(rowY);
    
    // Draw row background (zebra striping)
    if (isEvenRow) {
      doc.rect(50, rowY, pageWidth, 25)
         .fill(colors.lightGray);
    }
    isEvenRow = !isEvenRow;
    
    // Draw row text
    doc.font('Helvetica')
       .fontSize(9)
       .fillColor(colors.secondary);
    
    // ID column
    doc.text(truncate(reservation.ReservationID || `#${i+1}`, 10), 
             columns.id.x + 3, rowY + 8, { width: columns.id.width - 6 });
    
    // Product column
    doc.text(truncate(reservation.productID?.productName || 'N/A', 20),
             columns.product.x + 3, rowY + 8, { width: columns.product.width - 6 });
    
    // User column
    doc.text(truncate(reservation.userID?.name || 'N/A', 15),
             columns.user.x + 3, rowY + 8, { width: columns.user.width - 6 });
    
    // Size column
    doc.text(reservation.size || 'N/A',
             columns.size.x + 3, rowY + 8, { width: columns.size.width - 6 });
    
    // Quantity column
    doc.text(reservation.Quantity?.toString() || '0',
             columns.qty.x + 3, rowY + 8, { width: columns.qty.width - 6, align: 'right' });
    
    // Status column
    doc.text(reservation.ValidateReservation || 'Pending',
             columns.status.x + 3, rowY + 8, { width: columns.status.width - 6 });
    
    // Date column
    const reservationDate = reservation.ReservationDate ? 
      new Date(reservation.ReservationDate).toLocaleDateString() : 'N/A';
    doc.text(reservationDate,
             columns.date.x + 3, rowY + 8, { width: columns.date.width - 6 });
    
    // Draw horizontal line after each row
    doc.strokeColor(colors.borderColor)
       .lineWidth(0.5)
       .moveTo(50, rowY + 25)
       .lineTo(50 + pageWidth, rowY + 25)
       .stroke();
    
    rowY += 25;
  }

  // Add footer
  const footerY = doc.page.height - 50;
  doc.font('Helvetica')
     .fontSize(8)
     .fillColor('#666666')
     .text('This report contains reservation data from the Virtual Dressing Mall system.',
          50, footerY, { align: 'center', width: pageWidth });
  
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 
          50, footerY + 15, { align: 'center', width: pageWidth });

  // Finalize the PDF
  doc.end();
};

const validateReservation = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // status: 'Validated' or 'Rejected' or etc.

  try {
    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    reservation.ValidateReservation = status;
    await reservation.save();

    res.json({ success: true, message: 'Reservation status updated successfully', data: reservation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

const markExpiredOrCompletedReservations = async (req, res) => {
  try {
    const currentDate = new Date();

    // Example logic: Reservations older than 30 days are expired
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(currentDate.getDate() - 30);

    const expiredReservations = await Reservation.updateMany(
      { ReservationDate: { $lte: thirtyDaysAgo }, ValidateReservation: { $ne: 'Completed' } },
      { ValidateReservation: 'Expired' }
    );

    res.json({ success: true, message: 'Expired reservations updated successfully', data: expiredReservations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  getReservations,
  validateReservation,
  markExpiredOrCompletedReservations
};
