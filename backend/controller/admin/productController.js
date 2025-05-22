const Product = require('../../models/productModel');
const User = require('../../models/userModel');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

/**
 * Get all products with optional filters
 * @param {Object} req 
 * @param {Object} res 
 */
const getAllProducts = async (req, res) => {
  try {
    const { category, sellerName, gender, search } = req.query;

    // Build filter object dynamically
    const filter = {};

    if (category) filter.category = category;
    if (gender) filter.Gender = gender;
    if (search) filter.productName = { $regex: search, $options: 'i' };

    if (sellerName) {
      const seller = await User.findOne({ name: { $regex: sellerName, $options: 'i' } });
      if (seller) {
        filter.ShopID = seller._id;
      } else {
        return res.status(200).json({ success: true, data: [] });
      }
    }

    const products = await Product.find(filter)
      .populate('ShopID', 'name email') // Only get seller's name & email
      .exec();

    res.status(200).json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products',
      error: error.message
    });
  }
};

/**
 * Get product details by ID
 * @param {Object} req 
 * @param {Object} res 
 */
const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id)
      .populate('ShopID', 'name email')
      .exec();

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product details',
      error: error.message
    });
  }
};

/**
 * Approve or Reject a product
 * @param {Object} req 
 * @param {Object} res 
 */
const approveOrRejectProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // expected status: "approved" or "rejected"

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const product = await Product.findByIdAndUpdate(id, { status }, { new: true });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      message: `Product ${status} successfully`,
      data: product
    });

  } catch (error) {
    console.error('Error approving/rejecting product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating product status',
      error: error.message
    });
  }
};

/**
 * Edit Product (admin access)
 * @param {Object} req 
 * @param {Object} res 
 */
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating product',
      error: error.message
    });
  }
};

/**
 * Delete Product (admin access)
 * @param {Object} req 
 * @param {Object} res 
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting product',
      error: error.message
    });
  }
};

/**
 * Manage inventory (update quantity for a specific size)
 * @param {Object} req 
 * @param {Object} res 
 */
const updateInventory = async (req, res) => {
  try {
    const { productId } = req.params;
    const { size, quantity } = req.body; // size: "M", quantity: 10

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const sizeEntry = product.Size.find(s => s.size === size);

    if (sizeEntry) {
      sizeEntry.quantity = quantity;
    } else {
      product.Size.push({ size, quantity, price: 0 }); // if not exist, add new size
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: 'Inventory updated successfully',
      data: product
    });

  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating inventory',
      error: error.message
    });
  }
};

module.exports = {
  getAllProducts,
  getProductDetails,
  approveOrRejectProduct,
  editProduct,
  deleteProduct,
  updateInventory
};
