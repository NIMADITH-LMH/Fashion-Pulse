const express = require('express');
const router = express.Router();
const Reservation = require("../models/reservationModel");
const Product = require("../models/productModel");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const authToken = require('../middleware/authToken');
const { getSalesReport, generatePDFReport, generateExcelReport } = require("../controller/finance/financeController");
const userSignUpController = require('../controller/user/userSignUp');
const userSigninController = require('../controller/user/userSignin');
const userDetailsController = require('../controller/user/userDetails');
const userLogout = require('../controller/user/userLogout');
const allUsers = require('../controller/user/allUsers');
const updateUser = require('../controller/user/updateUser');
const uploadProductController = require('../controller/product/uploadProduct');
const getProductController = require('../controller/product/getProduct');
const updateProductController = require('../controller/product/updateProduct');
const getCategoryProduct = require('../controller/product/getCategoryProductOne');
const getCategoryWiseProduct = require('../controller/product/getCategoryWiseProduct');
const getproductDetails = require('../controller/product/getProductDetails');
const deleteProductController = require('../controller/product/deleteProduct');
const addReservation = require('../controller/reservation/addreservation');
const getSellerProduct=require('../controller/product/getSellerProduct');
const paymentController = require('../controller/order/paymentController');
const webhook = require('../controller/order/webhook');
const addToCartController = require('../controller/user/addToCartController');
const countOfAddToCartProduct = require('../controller/user/countOfAddToCartProduct');
const CartProduct = require("../models/cartProduct");
const getReservationDetails=require('../controller/reservation/getreservation')
const updatereservation = require('../controller/reservation/updateReservation');
const getGroupbyReservation =require('../controller/reservation/getGroupbyDetails')
const getOrderDetails=require('../controller/order/getOrderdetails')
const updateorderStatus=require('../controller/order/updateOrderStatus')
const generateBalanceSheet=require('../controller/order/generatebalance')
const createBid=require('../controller/bid/insertBid')
const getBid=require('../controller/bid/getBid')
const getBidbyspecific=require('../controller/bid/getBidbyspecific')
const updateBid=require('../controller/bid/updateBid')
const searchProduct = require('../controller/product/searchProduct');
const getShopdetails=require('../controller/user/shopDetails')
const retreiwLocation=require('../controller/user/retreiwLocation')
const sellerSalesOverView=require('../controller/finance/sellerSalesOverview')
const orderIncomeReport=require('../controller/finance/orderIncomeReport')
const getReservationReview=require('../controller/finance/getReservationRevenueByShop')
const { processBidCloseouts, getBidIncomeStats } = require('../controller/finance/bidIncomeController');
const { addComment, getComments, toggleCommentLike, deleteComment } = require('../controller/comment/commentController');
const {
    getAllUsers,
    
    toggleBlockUser,
    deleteUser,
    assignRole,
  } = require('../controller/admin/userController');

const{getAllOrders,
    getOrderDetail,
    generateOrderReport}=require('../controller/admin/ordermanagementcontroller')
const productController = require('../controller/admin/productController');


const{ getAllBids,
  getBidDetail,
  updateBidDuration,
  archiveCompletedBids,
  resolveDispute,
  generateBidReport}=require('../controller/admin/bidcontrolleradmin')
const{
    getReservations,
  validateReservation,
  markExpiredOrCompletedReservations} = require('../controller/admin/reservationalControl');

const {
    getAllComments,
      getAverageProductRating,
      deleteComments,
      toggleLikeComment,
      getLikesAnalysis,
      flagComment
}   = require('../controller/admin/commentmanagement');
const { getTotalRevenueSummary } = require('../controller/adminfinance/totalRevenueSummary');



const {getBiddingSalesIncome }= require('../controller/adminfinance/winningbidincome');
const {getReservationIncomeReport}= require('../controller/adminfinance/adminreservationincome');
const{getSellerProductReviews}=require('../controller/comment/sellercomment')
const { getCustomerSellerAnalytics }=require('../controller/adminfinance/customerSellerAnalytics')

router.get('/customer-seller', getCustomerSellerAnalytics);

router.get('/total-revenue-summary', getTotalRevenueSummary);
router.get('/get-seller-product-reviews', getSellerProductReviews);
router.get('/get-bidding-sales-income', getBiddingSalesIncome);
router.get('/get-reservation-income-report', getReservationIncomeReport);

router.get('/get-all-comments', getAllComments);
router.get('/get-average-rating/:productId', getAverageProductRating);  
router.delete('/delete-comment/:commentId', deleteComments);
router.post('/toggle-like/:commentId', toggleLikeComment);
router.get('/get-likes-analysis', getLikesAnalysis);
router.post('/flag-comment/:commentId', flagComment);



router.get('/get-reservations-admin', getReservations);
router.post('/validate-reservation-admin', validateReservation);
router.post('/mark-expired-or-completed-reservations', markExpiredOrCompletedReservations);

router.get('/get-all-admin', getAllBids);
router.get('/get-bid-details/:bidId', getBidDetail);
router.put('/update-bid-duration/:bidId', updateBidDuration);
router.put('/archive-completed-bids', archiveCompletedBids);
router.post('/resolve-dispute', resolveDispute);
router.get('/generate-bid-report', generateBidReport);

router.get('/get-all-orders', getAllOrders);
router.get('/get-order-details/:orderId', getOrderDetail);
router.get('/generate-order-report', generateOrderReport);




router.get('/get-all-users', getAllUsers);

router.post('/toggle-block-user/:userId', toggleBlockUser);

router.delete('/delete-user/:userId', deleteUser);
router.post('/assign-role/:userId', assignRole);



router.post('/process-closeouts', processBidCloseouts);
router.get('/bid-income-stats', getBidIncomeStats);// Auth routes

 
router.post("/Signup", userSignUpController);
router.post("/signin", userSigninController);
router.get("/user-details", authToken, userDetailsController);
router.get("/userLogout", userLogout);

// Admin routes
router.get("/all-user", authToken, allUsers);
router.post("/update-user", authToken, updateUser);

// Product routes
router.post("/upload-product", authToken, uploadProductController);
router.get("/get-product", getProductController);
router.post("/update-product", authToken, updateProductController);
router.get("/get-categoryProduct", getCategoryProduct);
router.post("/category-product", getCategoryWiseProduct);
router.post("/product-details", getproductDetails);
router.post("/delete-product", deleteProductController);
router.get("/all-product-seller", getSellerProduct);
router.get("/search-products", searchProduct);
router.get("/search-products", searchProduct);
  
// Reservation routes
router.post("/add-reservation", authToken, addReservation, paymentController);
router.post("/add-reservation",authToken,addReservation);
router.get("/get-reservation",getReservationDetails);
router.post("/update-reservation",updatereservation);
router.get("/get-groupby-reservation",getGroupbyReservation);


// Comment routes - use root paths
router.post('/comments', authToken, addComment);
router.get('/comments/:productId', getComments);
router.post('/comments/:commentId/like', authToken, toggleCommentLike);
router.delete('/comments/:commentId', authToken, deleteComment);




// Cart routes - all protected by authToken
router.post("/add-to-cart",  addToCartController);
router.get("/countOfAddToCartProduct", authToken, countOfAddToCartProduct);
router.get("/view-cart-product", authToken, async (req, res) => {
    try {
        const cartItems = await CartProduct.find({ userId: req.userId })
            .populate('productId')
            .exec();
        
        // Enhance the cart items with the price for the specific size
        let enhancedCartItems = cartItems.map(item => {
            const cartItem = item.toObject();
            
            // Find the price for the specific size
            if (cartItem.productId && cartItem.productId.Size && Array.isArray(cartItem.productId.Size)) {
                const sizeInfo = cartItem.productId.Size.find(s => s.size === cartItem.size);
                if (sizeInfo && sizeInfo.price) {
                    // Add a sellingPrice field to the productId object
                    cartItem.productId.sellingPrice = sizeInfo.price;
                }
            }
            
            return cartItem;
        });
        
        res.json({
            success: true,
            data: enhancedCartItems,
            message: "Cart items retrieved successfully"
        });
    } catch (error) {
        console.error('Error fetching cart items:', error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch cart items",
            error: error.message
        });
    }
});


// Protected cart count endpoint
router.get("/count-of-cart", authToken, async (req, res) => {
    try {
        const count = await CartProduct.countDocuments({ userId: req.userId });
        res.json({ 
            success: true,
            data: { count },
            message: "Cart count retrieved successfully"
        });
    } catch (error) {
        console.error('Error getting cart count:', error);
        res.status(500).json({ 
            success: false,
            message: "Failed to get cart count",
            error: error.message
        });
    }
});

// Delete cart item endpoint

router.post("/delete-cart-product", authToken, async (req, res) => {
    try {
        const { _id } = req.body;
        
        if (!_id) {
            return res.status(400).json({
                success: false,
                message: "Missing cart item ID",
                error: "Cart item ID is required"
            });
        }
        
        console.log("Attempting to delete cart item:", _id, "for user:", req.userId);
        
        const deletedItem = await CartProduct.findOneAndDelete({
            _id: _id,
            userId: req.userId
        });
        
        if (!deletedItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found or you don't have permission to delete it",
                error: "Item not found"
            });
        }
        
        res.json({
            success: true,
            message: "Item removed from cart successfully",
            data: deletedItem
        });
    } catch (error) {
        console.error('Error deleting cart item:', error);
        res.status(500).json({
            success: false,
            message: "Failed to remove item from cart",
            error: error.message
        });
    }
});

// Update cart item quantity endpoint
router.post("/update-cart-product", authToken, async (req, res) => {
    try {
        const { _id, quantity } = req.body;
        
        if (!_id) {
            return res.status(400).json({
                success: false,
                message: "Missing cart item ID",
                error: "Cart item ID is required"
            });
        }
        
        if (quantity === undefined || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Invalid quantity. Quantity must be at least 1.",
                error: "Invalid quantity"
            });
        }
        
        console.log("Updating cart item quantity:", _id, "to:", quantity, "for user:", req.userId);
        
        const updatedItem = await CartProduct.findOneAndUpdate(
            { _id: _id, userId: req.userId },
            { quantity: quantity },
            { new: true }
        );
        
        if (!updatedItem) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found or you don't have permission to update it",
                error: "Item not found"
            });
        }
        
        res.json({
            success: true,
            message: "Cart item quantity updated successfully",
            data: updatedItem
        });
    } catch (error) {
        console.error('Error updating cart item quantity:', error);
        res.status(500).json({
            success: false,
            message: "Failed to update quantity",
            error: error.message
        });
    }
});
//orders
router.get("/get-orders",getOrderDetails);
router.post("/update-order-status",updateorderStatus)
router.get('/generate-balance-sheet',generateBalanceSheet)

//bid
router.post('/create-bid',createBid)
router.get('/get-bid',getBid)
router.get('/get-bid-by-specific',getBidbyspecific)
router.post('/update-bid',updateBid)

//payment
router.post("/create-checkout-session", authToken, paymentController);
router.post("/webhook", webhook);
// Add direct cart clear route that can be called from success page
router.post("/clear-cart-after-payment", authToken, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User ID not found",
                error: "Unauthorized"
            });
        }
        
        console.log(`Manual cart clear request for user: ${userId}`);
        const result = await CartProduct.deleteMany({ userId: userId });
        
        res.json({
            success: true,
            message: `Successfully cleared ${result.deletedCount} items from cart`,
            count: result.deletedCount
        });
    } catch (error) {
        console.error('Error clearing cart after payment:', error);
        res.status(500).json({
            success: false,
            message: "Failed to clear cart items",
            error: error.message
        });
    }
});

// Add a dedicated endpoint to manually create orders from cart items after payment
router.post("/create-orders-after-payment", authToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { address } = req.body;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User ID not found",
                error: "Unauthorized"
            });
        }
        
        console.log(`Manual order creation request for user: ${userId}`);
        
        // Get cart items
        const cartItems = await CartProduct.find({ userId: userId }).populate('productId');
        
        if (!cartItems || cartItems.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No items in cart to create orders from",
                error: "Cart is empty"
            });
        }
        
        console.log(`Found ${cartItems.length} cart items to create orders from`);
        
        // Create orders
        const orderPromises = cartItems.map(async (item) => {
            try {
                if (!item.productId) {
                    console.log(`Skipping cart item without product ID: ${item._id}`);
                    return null;
                }
                
                // Create order data
                const orderData = {
                    productID: item.productId._id,
                    userID: userId,
                    TotalAmount: item.productId.sellingPrice * item.quantity,
                    Address: address || 'Address not provided',
                    Quantity: item.quantity,
                    Size: item.size || 'Default',
                    Status: "processing"
                };
                
                // Create and save the order
                const newOrder = new orderModel(orderData);
                return await newOrder.save();
            } catch (error) {
                console.error(`Error creating order for cart item ${item._id}:`, error);
                return null;
            }
        });
        
        // Wait for all orders to be created
        const createdOrders = await Promise.all(orderPromises);
        const successfulOrders = createdOrders.filter(order => order !== null);
        
        // Clear cart after orders are created
        if (successfulOrders.length > 0) {
            await CartProduct.deleteMany({ userId: userId });
            console.log(`Cleared cart for user ${userId} after creating ${successfulOrders.length} orders`);
        }
        
        res.json({
            success: true,
            message: `Successfully created ${successfulOrders.length} orders from cart items`,
            orderCount: successfulOrders.length
        });
    } catch (error) {
        console.error('Error creating orders after payment:', error);
        res.status(500).json({
            success: false,
            message: "Failed to create orders",
            error: error.message
        });
    }
});

// Add refresh cart count endpoint
router.get("/refresh-cart-count", authToken, async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User ID not found",
                error: "Unauthorized"
            });
        }
        
        // Get accurate count from database
        const count = await CartProduct.countDocuments({ userId: userId });
        
        res.json({
            success: true,
            data: { count },
            message: "Cart count refreshed successfully"
        });
    } catch (error) {
        console.error('Error refreshing cart count:', error);
        res.status(500).json({
            success: false,
            message: "Failed to refresh cart count",
            error: error.message
        });
    }
});

//financial 
router.get("/sales-report", getSalesReport);  
router.get("/download/pdf", generatePDFReport);  
router.get("/download/excel", generateExcelReport);  


router.get("/summary-reserve", async (req, res) => {
    try {
        const reservations = await Reservation.find().populate("userID").populate("productID");

        let totalRevenue = 0;
        let totalReservations = reservations.length;
        let statusCounts = { NotVisited: 0, Confirmed: 0, Rejected: 0 };

        for (const resv of reservations) {
            if (resv.ValidateReservation) {
                statusCounts[resv.ValidateReservation] = (statusCounts[resv.ValidateReservation] || 0) + 1;
            }
            const product = resv.productID;
            if (product) {
                const sizeDetail = product.Size.find(s => s.size === resv.size);
                if (sizeDetail) {
                    totalRevenue += resv.Quantity * sizeDetail.price;
                }
            }
        }

        res.json({ totalRevenue, totalReservations, statusCounts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Export reservations to Excel
router.get("/export-reserve-excel", async (req, res) => {
    try {
        const reservations = await Reservation.find().populate("userID").populate("productID");
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Financial Report");

        worksheet.columns = [
            { header: "Reservation ID", key: "ReservationID", width: 20 },
            { header: "Customer Name", key: "CustomerName", width: 20 },
            { header: "Product ID", key: "productID", width: 20 },
            { header: "Size", key: "Size", width: 10 },
            { header: "Quantity", key: "Quantity", width: 10 },
            { header: "Total Price", key: "TotalPrice", width: 15 },
            { header: "Reservation Date", key: "ReservationDate", width: 15 },
            { header: "Validation Status", key: "ValidateReservation", width: 15 }
        ];

        for (const resv of reservations) {
            const product = resv.productID;
            let totalPrice = 0;
            if (product) {
                const sizeDetail = product.Size.find(s => s.size === resv.size);
                if (sizeDetail) {
                    totalPrice = resv.Quantity * sizeDetail.price;
                }
            }
            worksheet.addRow({
                ReservationID: resv.ReservationID,
                CustomerName: resv.userID ? resv.userID.name : "N/A",
                productID: resv.productID ? resv.productID._id : "N/A",
                Size: resv.size,
                Quantity: resv.Quantity,
                TotalPrice: totalPrice,
                ReservationDate: resv.ReservationDate,
                ValidateReservation: resv.ValidateReservation
            });
        }

        res.setHeader("Content-Disposition", "attachment; filename=Financial_Report.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Export reservations to PDF
router.get("/export-pdf-reserve", async (req, res) => {
    try {
        const reservations = await Reservation.find().populate("userID").populate("productID");
        const doc = new PDFDocument();

        res.setHeader("Content-Disposition", "attachment; filename=Financial_Report.pdf");
        res.setHeader("Content-Type", "application/pdf");

        doc.pipe(res);
        doc.fontSize(16).text("Financial Report", { align: "center" });
        doc.moveDown();

        let groupedReservations = { NotVisited: [], Confirmed: [], Rejected: [] };

        for (const resv of reservations) {
            const product = resv.productID;
            let totalPrice = 0;
            if (product) {
                const sizeDetail = product.Size.find(s => s.size === resv.size);
                if (sizeDetail) {
                    totalPrice = resv.Quantity * sizeDetail.price;
                }
            }

            let reservationInfo = `Reservation ID: ${resv.ReservationID}\n`
                + `Customer Name: ${resv.userID ? resv.userID.name : "N/A"}\n`
                + `Product ID: ${resv.productID ? resv.productID._id : "N/A"}\n`
                + `Size: ${resv.size}\n`
                + `Quantity: ${resv.Quantity}\n`
                + `Total Price: ${totalPrice}\n`
                + `Reservation Date: ${resv.ReservationDate}\n`;

            if (resv.ValidateReservation) {
                groupedReservations[resv.ValidateReservation].push(reservationInfo);
            }
        }

        for (let [status, reservations] of Object.entries(groupedReservations)) {
            doc.fontSize(14).text(status, { underline: true });
            doc.moveDown();
            reservations.forEach(info => {
                doc.fontSize(12).text(info);
                doc.moveDown();
            });
        }

        doc.end();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


//shop details
router.get("/get-shop-details",getShopdetails)
router.get("/get-seller-location",retreiwLocation)



//finacial
router.get("/get-seller-sales-overview",sellerSalesOverView);
router.get("/get-income-order-report",orderIncomeReport);
router.get('/get-reservation-revenue-by-shop',getReservationReview)


// Test route for direct comment insertion without auth
router.post('/test-comment', async (req, res) => {
    try {
        const CommentModel = require('../models/commentModel');
        
        console.log('Test comment endpoint hit');
        console.log('Body:', req.body);
        
        // Create hardcoded comment for testing
        const testComment = new CommentModel({
            productId: req.body.productId || '655f5d4c2e3b56a50cc3abe9',
            userId: '655f5d4c2e3b56a50cc3abe8',
            text: req.body.text || 'Test comment',
            userName: 'Test User',
            rating: req.body.rating || 5,
            likes: []
        });
        
        const savedComment = await testComment.save();
        console.log('Test comment saved:', savedComment._id);
        
        return res.json({
            success: true,
            message: 'Test comment added',
            data: savedComment
        });
    } catch (error) {
        console.error('Test comment error:', error);
        return res.json({
            success: false,
            message: 'Error: ' + error.message
        });
    }
});

router.get('/shop/:shopId', async (req, res) => {
    const { shopId } = req.params;

    try {
        // Step 1: Find all products for the given shop
        const products = await ProductModel.find({ ShopID: shopId }).select('_id');

        if (!products.length) {
            return res.status(404).json({ message: 'No products found for this shop.' });
        }

        const productIds = products.map(product => product._id);

        // Step 2: Find comments related to these products
        const comments = await CommentModel.find({ productId: { $in: productIds } })
            .populate('productId', 'productName') // populate product name
            .populate('userId', 'name email')     // populate user info (optional)
            .sort({ createdAt: -1 });             // latest first

        res.status(200).json({ reviews: comments });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Server error while fetching reviews.' });
    }
});

//admin roouter

router.get('/getallproduct', productController.getAllProducts);
router.get('/get-product-details/:id', productController.getProductDetails);
router.patch('/give-permission/:id/approve', productController.approveOrRejectProduct);
router.put('/edit-product-details/:id', productController.editProduct);
router.delete('/delete-product-details/:id', productController.deleteProduct);
router.patch('/update-inventory/:productId/inventory', productController.updateInventory);

// Add a super simple test order endpoint
router.post("/create-minimal-order", authToken, async (req, res) => {
    try {
        const userId = req.userId;
        const mongoose = require('mongoose');
        
        console.log('Creating minimal test order...');
        
        // Directly use the model's test method
        const testOrder = await orderModel.createTestOrder(userId);
        
        res.json({
            success: true,
            message: "Minimal test order created",
            order: testOrder
        });
    } catch (error) {
        console.error('Error creating minimal order:', error);
        res.status(500).json({
            success: false,
            message: "Failed to create minimal order",
            error: error.message,
            stack: error.stack
        });
    }
});

// Add a diagnostic endpoint to create a test order directly
router.post("/create-test-order", authToken, async (req, res) => {
    try {
        const userId = req.userId;
        const mongoose = require('mongoose');
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: User ID not found",
                error: "Unauthorized"
            });
        }
        
        console.log(`Creating test order for user: ${userId}`);
        
        // Find a product to use
        const product = await Product.findOne();
        
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "No products found in the database",
                error: "Product not found"
            });
        }
        
        // Create test order data
        const testOrderData = {
            productID: product._id,
            userID: userId,
            TotalAmount: 100, // Example price
            Address: "Test Address for Diagnostic",
            Quantity: 1,
            Size: "M",
            Status: "test_order"
        };
        
        console.log("Test order data:", JSON.stringify(testOrderData, null, 2));
        
        // Ensure IDs are ObjectIds
        if (typeof testOrderData.productID === 'string') {
            testOrderData.productID = new mongoose.Types.ObjectId(testOrderData.productID);
        }
        
        if (typeof testOrderData.userID === 'string') {
            testOrderData.userID = new mongoose.Types.ObjectId(testOrderData.userID);
        }
        
        // Create and save the order
        const newOrder = new orderModel(testOrderData);
        const savedOrder = await newOrder.save();
        
        // Verify the order was saved by retrieving it
        const verifyOrder = await orderModel.findById(savedOrder._id);
        
        if (!verifyOrder) {
            return res.status(500).json({
                success: false,
                message: "Order was created but could not be verified in database",
                error: "Verification failed",
                orderData: savedOrder
            });
        }
        
        console.log(`Test order created with ID: ${savedOrder._id}`);
        
        // Check total count of orders
        const totalOrders = await orderModel.countDocuments();
        console.log(`Total orders in database: ${totalOrders}`);
        
        res.json({
            success: true,
            message: "Test order created successfully",
            order: savedOrder,
            totalOrders: totalOrders
        });
    } catch (error) {
        console.error('Error creating test order:', error);
        res.status(500).json({
            success: false,
            message: "Failed to create test order",
            error: error.message,
            stack: error.stack
        });
    }
});

module.exports = router;


