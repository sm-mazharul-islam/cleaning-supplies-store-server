const Order = require("../models/order.model");

const createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    if (!orderData.userEmail || !orderData.items) {
      return res.status(400).json({ success: false, message: "Order data missing" });
    }

    const newOrder = await Order.create({ ...orderData, status: "pending" });
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: newOrder,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { email } = req.params;
    if (req.user && req.user.email !== email) {
      return res.status(403).json({ success: false, message: "Forbidden: Access denied to other user's data" });
    }

    const result = await Order.find({ userEmail: email }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteUserOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (order.userEmail !== req.user.email) {
      return res.status(403).json({ success: false, message: "Unauthorized: You can only delete your own orders" });
    }

    const orderTime = new Date(order.createdAt).getTime();
    if (new Date().getTime() - orderTime > 24 * 60 * 60 * 1000) {
      return res.status(403).json({ success: false, message: "Cancellation period expired. Orders can only be deleted within 24 hours." });
    }

    await Order.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Order cancelled successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createOrder, getUserOrders, deleteUserOrder };
