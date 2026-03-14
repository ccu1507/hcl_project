import Product from '../models/Product.js';
import StockLedger from '../models/StockLedger.js';
import Order from '../models/Order.js';

// @desc    Create a product (admin)
// @route   POST /api/products
export const createProduct = async (req, res) => {
  try {
    const { categoryId, title, description, cost, taxPercentage, imageUrl, stockQuantity, isCombo, addons } = req.body;

    if (!categoryId || !title || !description || cost === undefined || stockQuantity === undefined) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Please provide all required fields' });
    }

    const product = await Product.create({
      categoryId,
      sellerId: req.user._id,
      title,
      description,
      cost: Number(cost),
      taxPercentage: taxPercentage || 0,
      imageUrl,
      stockQuantity: Number(stockQuantity),
      isCombo: isCombo || false,
      addons: addons || [],
    });

    if (stockQuantity > 0) {
      await StockLedger.create({
        productId: product._id,
        changeAmount: Number(stockQuantity),
        reason: 'Initial Stock Deposit',
        performedBy: req.user._id,
      });
    }

    res.status(201).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Server error creating product' });
  }
};

// @desc    Get all products for admin (no pagination limit)
// @route   GET /api/products/admin/all
export const getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find({ sellerId: req.user._id })
      .populate('categoryId', 'name')
      .populate('addons', 'title cost imageUrl')
      .sort({ createdAt: -1 });

    // Compute revenue per product from Order history
    // Only fetch orders that contain products belonging to this seller
    const productIds = products.map(p => p._id.toString());
    const allOrders = await Order.find({ 
      status: 'Paid',
      'items.productId': { $in: productIds }
    });
    const revenueMap = {};
    const unitsSoldMap = {};

    for (const order of allOrders) {
      for (const item of order.items) {
        const pid = item.productId.toString();
        revenueMap[pid] = (revenueMap[pid] || 0) + item.priceAtPurchase * item.quantity;
        unitsSoldMap[pid] = (unitsSoldMap[pid] || 0) + item.quantity;
      }
    }

    const enriched = products.map(p => ({
      ...p.toObject(),
      revenue: revenueMap[p._id.toString()] || 0,
      unitsSold: unitsSoldMap[p._id.toString()] || 0,
    }));

    res.json(enriched);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Server error fetching admin products' });
  }
};

// @desc    Get all products (paginated, public)
// @route   GET /api/products
export const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find({})
      .populate('categoryId', 'name')
      .populate('addons')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments({});

    res.json({ products, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Server error fetching products' });
  }
};

// @desc    Search products
// @route   GET /api/products/search
export const searchProducts = async (req, res) => {
  try {
    const { q, categoryId } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Search query parameter "q" is required' });
    }

    const query = { $text: { $search: q } };
    if (categoryId && categoryId !== 'all') {
      query.categoryId = categoryId;
    }

    const products = await Product.find(
      query,
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } }).populate('addons');

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Server error searching products' });
  }
};

// @desc    Update a product (admin)
// @route   PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, cost, taxPercentage, imageUrl, stockQuantity, isCombo, addons, categoryId } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Product not found' });
    }

    if (product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Not authorized to update this product' });
    }

    // Handle stock change and log ledger
    if (stockQuantity !== undefined && Number(stockQuantity) !== product.stockQuantity) {
      const diff = Number(stockQuantity) - product.stockQuantity;
      await StockLedger.create({
        productId: id,
        changeAmount: diff,
        reason: 'Admin Stock Adjustment',
        performedBy: req.user._id,
      });
    }

    const updated = await Product.findByIdAndUpdate(
      id,
      {
        ...(categoryId !== undefined && { categoryId }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(cost !== undefined && { cost: Number(cost) }),
        ...(taxPercentage !== undefined && { taxPercentage: Number(taxPercentage) }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(stockQuantity !== undefined && { stockQuantity: Number(stockQuantity) }),
        ...(isCombo !== undefined && { isCombo }),
        ...(addons !== undefined && { addons }),
      },
      { new: true, runValidators: true }
    ).populate('categoryId', 'name').populate('addons', 'title cost imageUrl');

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Server error updating product' });
  }
};

// @desc    Delete a product (admin)
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Product not found' });
    }

    if (product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Not authorized to delete this product' });
    }

    await Product.findByIdAndDelete(id);
    await StockLedger.deleteMany({ productId: id });

    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Server error deleting product' });
  }
};

// @desc    Update product stock (admin)
// @route   PUT /api/products/:id/stock
export const updateStock = async (req, res) => {
  try {
    const { changeAmount, reason } = req.body;
    const productId = req.params.id;

    if (changeAmount === undefined || !reason) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Please provide changeAmount and reason' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Product not found' });
    }

    if (product.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Not authorized to update stock for this product' });
    }

    const newStock = product.stockQuantity + Number(changeAmount);
    if (newStock < 0) {
      return res.status(400).json({ error: 'INSUFFICIENT_STOCK', message: 'Stock cannot be negative' });
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId },
      { $inc: { stockQuantity: Number(changeAmount) } },
      { new: true, runValidators: true }
    );

    await StockLedger.create({
      productId,
      changeAmount: Number(changeAmount),
      reason,
      performedBy: req.user._id,
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Server error updating stock' });
  }
};
