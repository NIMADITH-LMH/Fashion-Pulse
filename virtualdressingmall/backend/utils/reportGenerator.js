const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");

// Generate PDF Report
exports.generatePDF = (orders) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        let buffers = [];

        doc.on("data", (chunk) => buffers.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(buffers)));

        doc.fontSize(16).text("Inventory Sales Report", { align: "center" });
        doc.moveDown();

        orders.forEach(order => {
            doc.fontSize(12).text(`Order ID: ${order._id}`);
            doc.text(`Product: ${order.productID.name}`);
            doc.text(`User: ${order.userID.name}`);
            doc.text(`Total Amount: $${order.TotalAmount}`);
            doc.text(`Quantity: ${order.Quantity}`);
            doc.text(`Status: ${order.Status}`);
            doc.moveDown();
        });

        doc.end();
    });
};

// Generate Excel Report
exports.generateExcel = async (orders) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Sales Report");

    worksheet.columns = [
        { header: "Order ID", key: "_id", width: 25 },
        { header: "Product", key: "productID", width: 20 },
        { header: "User", key: "userID", width: 20 },
        { header: "Total Amount", key: "TotalAmount", width: 15 },
        { header: "Quantity", key: "Quantity", width: 10 },
        { header: "Status", key: "Status", width: 15 },
    ];

    orders.forEach(order => {
        worksheet.addRow({
            _id: order._id,
            productID: order.productID.name,
            userID: order.userID.name,
            TotalAmount: order.TotalAmount,
            Quantity: order.Quantity,
            Status: order.Status
        });
    });

    return workbook.xlsx.writeBuffer();
};