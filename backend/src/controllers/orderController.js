import Order from '../models/Order.js';
import Product from '../models/Product.js';
import StockLedger from '../models/StockLedger.js';
import { sendOrderReceiptEmail } from '../services/emailService.js';

// @desc    Place a mock order (no payment gateway)
// @route   POST /api/orders/place
export const createMockOrder = async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'No order items provided' });
    }

    // 1. Verify stock availability for all items
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: 'NOT_FOUND', message: `Product ${item.productId} not found` });
      }
      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          error: 'INSUFFICIENT_STOCK',
          message: `Insufficient stock for "${product.title}". Only ${product.stockQuantity} left.`,
        });
      }
    }

    // 2. Create Order with status Paid (mock payment always succeeds)
    const order = await Order.create({
      userId: req.user._id,
      items,
      totalAmount,
      status: 'Paid',
    });

    // 3. Reduce stock and log ledger for each item
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stockQuantity: -item.quantity } },
        { new: true }
      );

      await StockLedger.create({
        productId: item.productId,
        changeAmount: -item.quantity,
        reason: `Order Sale #${order._id}`,
        performedBy: req.user._id,
      });
    }

    // 4. Send Email Receipt
    // In background, don't await so we don't block the response
    sendOrderReceiptEmail(req.user.email, req.user.name, {
      orderId: order._id,
      items,
      totalAmount
    }).catch(err => console.error("Failed to send order email:", err));

    res.status(201).json({ success: true, orderId: order._id, message: 'Order placed successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Server error placing order' });
  }
};

// @desc    Get current user's order history
// @route   GET /api/orders/history
export const getOrderHistory = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('items.productId', 'title imageUrl cost')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Server error fetching order history' });
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders/admin/all
export const getAllOrders = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // 1. Get all product IDs belonging to this seller
    const sellerProducts = await Product.find({ sellerId }).select('_id');
    const sellerProductIds = sellerProducts.map(p => p._id.toString());

    // 2. Find orders that contain at least one of these products
    const orders = await Order.find({
      'items.productId': { $in: sellerProductIds }
    })
      .populate('userId', 'name email')
      .populate('items.productId', 'title imageUrl cost sellerId')
      .sort({ createdAt: -1 });

    // 3. (Optional but recommended) Filter the items list within each order 
    // so the seller only sees THEIR products in the order view.
    const filteredOrders = orders.map(order => {
      const orderObj = order.toObject();
      orderObj.items = orderObj.items.filter(item => 
        item.productId && item.productId.sellerId?.toString() === sellerId.toString()
      );
      return orderObj;
    });

    res.json(filteredOrders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Server error fetching all orders' });
  }
};
