const Order = require('../../models/orderModel');
const User = require('../../models/userModel');
const Product = require('../../models/productModel');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

// ✅ Get All Orders (with optional status filter)
const getAllOrders = async (req, res) => {
  const { status } = req.query;

  try {
    const filter = {};
    if (status) {
      filter.Status = status;
    }

    const orders = await Order.find(filter)
      .populate('userID', 'name email')
      .populate('productID', 'productName')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders.' });
  }
};

// ✅ Get Single Order Details
const getOrderDetail = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId)
      .populate('userID', 'name email location address')
      .populate('productID', 'productName price description');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch order details.' });
  }
};

// ✅ Generate Order Report (PDF or Excel)
const generateOrderReport = async (req, res) => {
  const { status, startDate, endDate, format } = req.query;

  try {
    const filter = {};
    if (status) filter.Status = status;
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(`${endDate}T23:59:59.999Z`)
      };
    }

    const orders = await Order.find(filter)
      .populate('userID', 'name email')
      .populate('productID', 'productName');

    if (!orders.length) {
      return res.status(404).json({ success: false, message: 'No orders found for the given criteria.' });
    }

    const orderData = orders.map((order, index) => ({
      orderNumber: index + 1,
      productName: order.productID?.productName || 'Unknown',
      quantity: order.Quantity,
      size: order.Size,
      totalAmount: order.TotalAmount,
      status: order.Status,
      customerName: order.userID?.name || 'N/A',
      customerEmail: order.userID?.email || 'N/A',
      address: order.Address,
      orderDate: order.createdAt
    }));

    // --- PDF Generation ---
    if (format === 'pdf') {
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="order_report.pdf"');
      doc.pipe(res);

      doc.fontSize(20).text('Order Report', { align: 'center' });
      doc.moveDown(2);

      orderData.forEach((order, idx) => {
        doc.fontSize(12).text(`Order #${order.orderNumber}`, { underline: true });
        doc.text(`Product: ${order.productName}`);
        doc.text(`Quantity: ${order.quantity}`);
        doc.text(`Size: ${order.size}`);
        doc.text(`Total Amount: $${order.totalAmount.toFixed(2)}`);
        doc.text(`Status: ${order.status}`);
        doc.text(`Customer: ${order.customerName}`);
        doc.text(`Email: ${order.customerEmail}`);
        doc.text(`Address: ${order.address}`);
        doc.text(`Order Date: ${new Date(order.orderDate).toLocaleString()}`);
        doc.moveDown(2);
      });

      doc.end();

    // --- Excel Generation ---
    } else if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Order Report');

      worksheet.columns = [
        { header: 'Order #', key: 'orderNumber', width: 10 },
        { header: 'Product Name', key: 'productName', width: 30 },
        { header: 'Quantity', key: 'quantity', width: 10 },
        { header: 'Size', key: 'size', width: 10 },
        { header: 'Total Amount ($)', key: 'totalAmount', width: 15 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Customer Name', key: 'customerName', width: 25 },
        { header: 'Customer Email', key: 'customerEmail', width: 30 },
        { header: 'Address', key: 'address', width: 40 },
        { header: 'Order Date', key: 'orderDate', width: 20 }
      ];

      orderData.forEach(order => {
        worksheet.addRow(order);
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="order_report.xlsx"');

      await workbook.xlsx.write(res);
      res.end();

    } else {
      res.status(400).json({ success: false, message: 'Invalid format. Choose pdf or excel.' });
    }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to generate report.' });
  }
};

module.exports = {
  getAllOrders,
  getOrderDetail,
  generateOrderReport
};
