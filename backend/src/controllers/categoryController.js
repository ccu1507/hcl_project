import Category from '../models/Category.js';
import Product from '../models/Product.js';

// @desc    Create a category (admin)
// @route   POST /api/categories
export const createCategory = async (req, res) => {
  try {
    const { name, description, logoUrl } = req.body;
    const sellerId = req.user._id;

    if (!name || !description) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'Please provide name and description' });
    }

    const categoryExists = await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') }, sellerId });
    if (categoryExists) {
      return res.status(400).json({ error: 'CATEGORY_EXISTS', message: 'Category already exists for this seller' });
    }

    const category = await Category.create({ 
      name, 
      description, 
      logoUrl: logoUrl || '', 
      sellerId 
    });
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Server error creating category' });
  }
};

// @desc    Get all categories (public)
// @route   GET /api/categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Server error fetching categories' });
  }
};

// @desc    Get all categories for specific admin
// @route   GET /api/categories/admin/all
export const getAdminCategories = async (req, res) => {
  try {
    const categories = await Category.find({ sellerId: req.user._id }).sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Server error fetching categories' });
  }
};

// @desc    Update a category (admin)
// @route   PUT /api/categories/:id
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, logoUrl } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Category not found' });
    }

    if (category.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Not authorized to update this category' });
    }

    const updated = await Category.findByIdAndUpdate(
      id,
      {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(logoUrl !== undefined && { logoUrl }),
      },
      { new: true, runValidators: true }
    );

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Server error updating category' });
  }
};

// @desc    Delete a category (admin)
// @route   DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Category not found' });
    }

    // Check if category has products
    const productCount = await Product.countDocuments({ categoryId: id });
    if (productCount > 0) {
      return res.status(400).json({
        error: 'HAS_PRODUCTS',
        message: `Cannot delete category with ${productCount} product(s). Remove products first.`,
      });
    }

    if (category.sellerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Not authorized to delete this category' });
    }

    await Category.findByIdAndDelete(id);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Server error deleting category' });
  }
};

// @desc    Get products by category ID (public, paginated)
// @route   GET /api/categories/:id/products
export const getCategoryProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const products = await Product.find({ categoryId: id })
      .skip(skip)
      .limit(limit)
      .populate('addons');
    const total = await Product.countDocuments({ categoryId: id });

    res.json({ products, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Server error fetching category products' });
  }
};
