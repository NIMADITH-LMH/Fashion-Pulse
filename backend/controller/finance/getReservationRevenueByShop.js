  const Reservation = require('../../models/reservationModel');
  const Product = require('../../models/productModel');
  const User = require('../../models/userModel');
  const PDFDocument = require('pdfkit');
  const ExcelJS = require('exceljs');

  /**
   * Get reservation statistics by validation status for a shop
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  const getReservationValidationStats = async (req, res) => {
    const { shopId, format, names } = req.query;

    try {
      // Fetch all reservations related to the shop's products
      const reservations = await Reservation.find()
        .populate({
          path: 'productID',
          match: { ShopID: shopId },
          populate: { path: 'ShopID', model: 'user' }
        })
        .populate('userID')
        .exec();

      // Filter out reservations where productID is null (product not found or not from this shop)
      const filteredReservations = reservations.filter(r => r.productID !== null);

      // Group reservations by validation status
      const validationStats = {
        confirmed: filteredReservations.filter(r => r.ValidateReservation === 'Confirmed'),
        notVisited: filteredReservations.filter(r => r.ValidateReservation === 'Not visited'),
        rejected: filteredReservations.filter(r => r.ValidateReservation === 'Rejected'),
        totalCount: filteredReservations.length
      };

      // Calculate revenue for each category
      const calculateRevenueData = (reservations) => {
        return reservations.map(r => {
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
      };

      // Process each category
      const confirmedData = calculateRevenueData(validationStats.confirmed);
      const notVisitedData = calculateRevenueData(validationStats.notVisited);
      const rejectedData = calculateRevenueData(validationStats.rejected);

      // Calculate summary statistics
      const confirmedRevenue = confirmedData.reduce((sum, item) => sum + item.revenue, 0);
      const notVisitedRevenue = notVisitedData.reduce((sum, item) => sum + item.revenue, 0);
      const rejectedRevenue = rejectedData.reduce((sum, item) => sum + item.revenue, 0);
      const totalRevenue = confirmedRevenue + notVisitedRevenue + rejectedRevenue;

      // Generate response based on requested format
      if (format === 'pdf') {
        // Create a new PDF document
        const doc = new PDFDocument({ margin: 50 });
        
        // Set response headers for PDF download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="reservation_validation_report.pdf"');
        
        // Pipe the PDF document to the response
        doc.pipe(res);
        
        // Add title
        doc.fontSize(20).text('Reservation Validation Status Report', { align: 'center' });
        doc.moveDown();
        
        // Add shop information
        doc.fontSize(14).text(`Shop Name: ${names}`, { align: 'left' });
        doc.fontSize(14).text(`Date Generated: ${new Date().toLocaleDateString()}`, { align: 'left' });
        doc.moveDown(2);
        
        // Add summary statistics
        doc.fontSize(16).text('Summary Statistics', { align: 'left' });
        doc.moveDown();
        doc.fontSize(12).text(`Total Reservations: ${validationStats.totalCount}`, { align: 'left' });
        doc.fontSize(12).text(`Confirmed Reservations: ${validationStats.confirmed.length} (${((validationStats.confirmed.length / validationStats.totalCount) * 100).toFixed(2)}%)`, { align: 'left' });
        doc.fontSize(12).text(`Not Visited Reservations: ${validationStats.notVisited.length} (${((validationStats.notVisited.length / validationStats.totalCount) * 100).toFixed(2)}%)`, { align: 'left' });
        doc.fontSize(12).text(`Rejected Reservations: ${validationStats.rejected.length} (${((validationStats.rejected.length / validationStats.totalCount) * 100).toFixed(2)}%)`, { align: 'left' });
        doc.moveDown();
        doc.fontSize(12).text(`Confirmed Revenue: $${confirmedRevenue.toFixed(2)}`, { align: 'left' });
        doc.fontSize(12).text(`Not Visited Revenue: $${notVisitedRevenue.toFixed(2)}`, { align: 'left' });
        doc.fontSize(12).text(`Rejected Revenue: $${rejectedRevenue.toFixed(2)}`, { align: 'left' });
        doc.fontSize(12).text(`Total Potential Revenue: $${totalRevenue.toFixed(2)}`, { align: 'left' });
        doc.moveDown(2);
        
        // Display detailed reservation data by validation status
        const createValidationTable = (title, data, startY) => {
          // Add section title
          doc.fontSize(14).text(title, { align: 'left' });
          doc.moveDown();
          
          if (data.length === 0) {
            doc.fontSize(10).text('No data available', { align: 'left' });
            doc.moveDown();
            return doc.y;
          }
          
          // Create table headers
          const tableTop = doc.y;
          doc.font('Helvetica-Bold');
          doc.fontSize(10);
          doc.text('Product', 50, tableTop);
          doc.text('Date', 160, tableTop);
          doc.text('Size', 250, tableTop);
          doc.text('Qty', 290, tableTop);
          doc.text('Price', 330, tableTop);
          doc.text('Revenue', 380, tableTop);
          doc.text('Customer', 450, tableTop);
          
          // Draw a line
          doc.moveTo(50, tableTop + 15)
            .lineTo(550, tableTop + 15)
            .stroke();
          
          // Draw table rows
          let rowTop = tableTop + 25;
          doc.font('Helvetica');
          
          // Function to handle page breaks
          const checkAndAddPage = (yPosition) => {
            if (yPosition > 700) {
              doc.addPage();
              return 50;
            }
            return yPosition;
          };
          
          data.forEach((item) => {
            rowTop = checkAndAddPage(rowTop);
            
            const reservationDate = new Date(item.reservationDate).toLocaleDateString();
            
            doc.fontSize(10).text(item.productName.substring(0, 18), 50, rowTop, { width: 100 });
            doc.text(reservationDate, 160, rowTop);
            doc.text(item.size, 250, rowTop);
            doc.text(item.quantity.toString(), 290, rowTop);
            doc.text(`$${item.price.toFixed(2)}`, 330, rowTop);
            doc.text(`$${item.revenue.toFixed(2)}`, 380, rowTop);
            doc.text(item.customer.substring(0, 15), 450, rowTop);
            
            rowTop += 20;
          });
          
          doc.moveDown(2);
          return doc.y;
        };
        
        // Create tables for each validation status
        doc.addPage();
        let currentY = 50;
        currentY = createValidationTable('Confirmed Reservations', confirmedData, currentY);
        
        doc.addPage();
        currentY = 50;
        currentY = createValidationTable('Not Visited Reservations', notVisitedData, currentY);
        
        doc.addPage();
        currentY = 50;
        currentY = createValidationTable('Rejected Reservations', rejectedData, currentY);
        
        // Finalize the PDF
        doc.end();
        
      } else if (format === 'excel') {
        // Create a new Excel workbook
        const workbook = new ExcelJS.Workbook();
        
        // Add summary worksheet
        const summarySheet = workbook.addWorksheet('Summary');
        summarySheet.columns = [
          { header: 'Validation Status', key: 'status', width: 20 },
          { header: 'Count', key: 'count', width: 15 },
          { header: 'Percentage', key: 'percentage', width: 15 },
          { header: 'Revenue ($)', key: 'revenue', width: 15 }
        ];
        
        // Style the header row
        summarySheet.getRow(1).font = { bold: true };
        summarySheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
        summarySheet.getRow(1).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD3D3D3' }
        };
        
        // Add summary data
        summarySheet.addRows([
          { 
            status: 'Confirmed', 
            count: validationStats.confirmed.length,
            percentage: validationStats.totalCount > 0 ? (validationStats.confirmed.length / validationStats.totalCount) : 0,
            revenue: confirmedRevenue
          },
          { 
            status: 'Not Visited', 
            count: validationStats.notVisited.length,
            percentage: validationStats.totalCount > 0 ? (validationStats.notVisited.length / validationStats.totalCount) : 0,
            revenue: notVisitedRevenue
          },
          { 
            status: 'Rejected', 
            count: validationStats.rejected.length,
            percentage: validationStats.totalCount > 0 ? (validationStats.rejected.length / validationStats.totalCount) : 0,
            revenue: rejectedRevenue
          },
          { 
            status: 'Total', 
            count: validationStats.totalCount,
            percentage: 1,
            revenue: totalRevenue
          }
        ]);
        
        // Format number columns
        summarySheet.getColumn('percentage').numFmt = '0.00%';
        summarySheet.getColumn('revenue').numFmt = '$#,##0.00';
        
        // Add shop info
        summarySheet.getCell('A7').value = 'Shop Name:';
        summarySheet.getCell('B7').value = names;
        summarySheet.getCell('A8').value = 'Report Generated:';
        summarySheet.getCell('B8').value = new Date();
        summarySheet.getCell('B8').numFmt = 'yyyy-mm-dd hh:mm:ss';
        
        // Function to create detail worksheet
        const createDetailWorksheet = (name, data) => {
          const worksheet = workbook.addWorksheet(name);
          
          worksheet.columns = [
            { header: 'Product Name', key: 'productName', width: 25 },
            { header: 'Reservation Date', key: 'reservationDate', width: 20 },
            { header: 'Size', key: 'size', width: 10 },
            { header: 'Quantity', key: 'quantity', width: 10 },
            { header: 'Price ($)', key: 'price', width: 12 },
            { header: 'Revenue ($)', key: 'revenue', width: 15 },
            { header: 'Customer', key: 'customer', width: 20 }
          ];
          
          // Style the header row
          worksheet.getRow(1).font = { bold: true };
          worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
          worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
          };
          
          // Add data rows with formatted dates
          const formattedData = data.map(item => ({
            productName: item.productName,
            reservationDate: new Date(item.reservationDate),
            size: item.size,
            quantity: item.quantity,
            price: item.price,
            revenue: item.revenue,
            customer: item.customer
          }));
          
          worksheet.addRows(formattedData);
          
          // Format columns
          worksheet.getColumn('reservationDate').numFmt = 'yyyy-mm-dd';
          worksheet.getColumn('price').numFmt = '$#,##0.00';
          worksheet.getColumn('revenue').numFmt = '$#,##0.00';
          
          // Add total row
          const totalRowIndex = formattedData.length + 2;
          worksheet.getCell(`A${totalRowIndex}`).value = 'Total';
          worksheet.getCell(`F${totalRowIndex}`).value = {
            formula: `SUM(F2:F${formattedData.length + 1})`,
            date1904: false
          };
          worksheet.getCell(`F${totalRowIndex}`).font = { bold: true };
          worksheet.getCell(`F${totalRowIndex}`).numFmt = '$#,##0.00';
          
          // Freeze the header row
          worksheet.views = [
            { state: 'frozen', xSplit: 0, ySplit: 1, activeCell: 'A2' }
          ];
        };
        
        // Create detail worksheets for each status
        createDetailWorksheet('Confirmed', confirmedData);
        createDetailWorksheet('Not Visited', notVisitedData);
        createDetailWorksheet('Rejected', rejectedData);
        
        // Set response headers for Excel download
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="reservation_validation_report.xlsx"');
        
        // Write to response
        await workbook.xlsx.write(res);
        res.end();
        
      } else {
        // Return JSON response for API calls
        return res.json({
          success: true,
          message: 'Reservation validation status report generated',
          summary: {
            totalReservations: validationStats.totalCount,
            confirmedCount: validationStats.confirmed.length,
            confirmedPercentage: validationStats.totalCount > 0 ? 
              ((validationStats.confirmed.length / validationStats.totalCount) * 100).toFixed(2) + '%' : '0%',
            notVisitedCount: validationStats.notVisited.length,
            notVisitedPercentage: validationStats.totalCount > 0 ? 
              ((validationStats.notVisited.length / validationStats.totalCount) * 100).toFixed(2) + '%' : '0%',
            rejectedCount: validationStats.rejected.length,
            rejectedPercentage: validationStats.totalCount > 0 ? 
              ((validationStats.rejected.length / validationStats.totalCount) * 100).toFixed(2) + '%' : '0%',
            confirmedRevenue: confirmedRevenue.toFixed(2),
            notVisitedRevenue: notVisitedRevenue.toFixed(2),
            rejectedRevenue: rejectedRevenue.toFixed(2),
            totalRevenue: totalRevenue.toFixed(2)
          },
          data: {
            confirmed: confirmedData,
            notVisited: notVisitedData,
            rejected: rejectedData
          }
        });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }
  };

  module.exports = getReservationValidationStats;