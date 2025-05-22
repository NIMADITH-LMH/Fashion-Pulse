const Order = require('../../models/orderModel');
const { generatePDF, generateExcel } = require("../../utils/reportGenerator");
// Fetch sales report (filtered by date range)
exports.getSalesReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const filter = {};

        if (startDate && endDate) {
            filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }

        const orders = await Order.find(filter).populate("productID userID");
        let totalRevenue = 0;
        let totalOrders = orders.length;

        orders.forEach(order => {
            totalRevenue += order.TotalAmount;
        });

        res.json({ totalOrders, totalRevenue, orders });
    } catch (error) {
        res.status(500).json({ message: "Error fetching sales report", error });
    }
};

// Generate and download PDF report
exports.generatePDFReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const orders = await Order.find({
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }).populate("productID userID");

        const pdfBuffer = await generatePDF(orders);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=sales-report.pdf");
        res.send(pdfBuffer);
    } catch (error) {
        res.status(500).json({ message: "Error generating PDF report", error });
    }
};

// Generate and download Excel report
exports.generateExcelReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const orders = await Order.find({
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }).populate("productID userID");

        const excelBuffer = await generateExcel(orders);
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.setHeader("Content-Disposition", "attachment; filename=sales-report.xlsx");
        res.send(excelBuffer);
    } catch (error) {
        res.status(500).json({ message: "Error generating Excel report", error });
    }
};
