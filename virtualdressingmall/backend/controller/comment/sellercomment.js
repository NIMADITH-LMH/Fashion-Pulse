const Comment = require('../../models/commentModel');
const Product = require('../../models/productModel');
const User = require('../../models/userModel');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

const getSellerProductReviews = async (req, res) => {
  const { sellerId, startDate, endDate, format } = req.query;

  try {
    // Validate input
    if (!sellerId) {
      return res.status(400).json({ success: false, message: 'Seller ID is required.' });
    }

    // Create date filter if dates provided
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(`${endDate}T23:59:59.999Z`) // Include the full end day
      };
    } else if (startDate) {
      dateFilter.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      dateFilter.createdAt = { $lte: new Date(`${endDate}T23:59:59.999Z`) };
    }

    // Find all products by this seller
    const sellerProducts = await Product.find({ ShopID: sellerId });

    if (!sellerProducts || sellerProducts.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const productIds = sellerProducts.map(product => product._id);

    // Find all comments for these products with proper error handling
    let comments = [];
    try {
      comments = await Comment.find({
        productId: { $in: productIds },
        ...dateFilter
      })
      .populate('productId', 'productName productImage')
      .populate('userId', 'name email profilePic')
      .lean(); // Using lean() for better performance
    } catch (err) {
      console.error('Error querying comments:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error retrieving comments',
        error: err.message 
      });
    }

    // Prepare final result with null checks
    const reviewData = comments.map(comment => ({
      productName: comment.productId ? comment.productId.productName : 'Unknown',
      productImage: comment.productId && comment.productId.productImage ? comment.productId.productImage : [],
      reviewerName: comment.userId ? comment.userId.name : (comment.userName || 'Anonymous'),
      reviewerEmail: comment.userId ? comment.userId.email : 'N/A',
      reviewerProfilePic: comment.userId && comment.userId.profilePic ? comment.userId.profilePic : 
                         (comment.userImage || null),
      rating: comment.rating || 0,
      text: comment.text || '',
      likesCount: comment.likes ? comment.likes.length : 0,
      commentDate: comment.createdAt
    }));

    // If format is pdf or excel, export
    if (format === 'pdf') {
      try {
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="reviews_report.pdf"');
        doc.pipe(res);

        doc.fontSize(20).text('Product Reviews Report', { align: 'center' });
        doc.moveDown();
        
        // Add date range if provided
        if (startDate || endDate) {
          const dateRangeText = `Date Range: ${startDate || 'All time'} - ${endDate || 'Present'}`;
          doc.fontSize(14).text(dateRangeText, { align: 'center' });
          doc.moveDown(2);
        }

        // Add seller info
        doc.fontSize(16).text(`Seller ID: ${sellerId}`, { align: 'left' });
        doc.fontSize(16).text(`Total Reviews: ${reviewData.length}`, { align: 'left' });
        doc.moveDown(2);

        reviewData.forEach((review, index) => {
          doc.fontSize(12).text(`Review #${index + 1}`);
          doc.text(`Product Name: ${review.productName}`);
          doc.text(`Reviewer Name: ${review.reviewerName}`);
          doc.text(`Reviewer Email: ${review.reviewerEmail}`);
          doc.text(`Rating: ${review.rating} ⭐`);
          doc.text(`Review Text: ${review.text}`);
          doc.text(`Likes: ${review.likesCount}`);
          doc.text(`Date: ${new Date(review.commentDate).toLocaleDateString()}`);
          doc.moveDown(2);
        });

        doc.end();
      } catch (pdfError) {
        console.error('Error generating PDF:', pdfError);
        return res.status(500).json({ 
          success: false, 
          message: 'Error generating PDF report',
          error: pdfError.message 
        });
      }
    } 
    else if (format === 'excel') {
      try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Reviews');

        // Set headers
        worksheet.columns = [
          { header: 'Product Name', key: 'productName', width: 30 },
          { header: 'Reviewer Name', key: 'reviewerName', width: 25 },
          { header: 'Reviewer Email', key: 'reviewerEmail', width: 30 },
          { header: 'Rating', key: 'rating', width: 10 },
          { header: 'Review Text', key: 'text', width: 40 },
          { header: 'Likes', key: 'likesCount', width: 10 },
          { header: 'Date', key: 'commentDate', width: 20 }
        ];

        // Add rows
        reviewData.forEach(review => {
          worksheet.addRow({
            productName: review.productName,
            reviewerName: review.reviewerName,
            reviewerEmail: review.reviewerEmail,
            rating: review.rating,
            text: review.text,
            likesCount: review.likesCount,
            commentDate: new Date(review.commentDate).toLocaleDateString()
          });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="reviews_report.xlsx"');

        await workbook.xlsx.write(res);
        res.end();
      } catch (excelError) {
        console.error('Error generating Excel:', excelError);
        return res.status(500).json({ 
          success: false, 
          message: 'Error generating Excel report',
          error: excelError.message 
        });
      }
    }
    else {
      // Normal JSON response
      return res.json({ success: true, data: reviewData });
    }

  } catch (error) {
    console.error('Server Error in getSellerProductReviews:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server Error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

module.exports = { getSellerProductReviews };