const Order = require("../models/order.model");

const getAllOrders = async (req, res) => {
  try {
    const result = await Order.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    let autoMessage = "";
    if (status === "approved") {
      autoMessage = "Thank You for ordering us , we can send as soon as possible please be patient and connect with us";
    }

    const updatedDoc = await Order.findByIdAndUpdate(
      id,
      { $set: { status, adminMessage: autoMessage } },
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: autoMessage || `Order status updated to ${status}`,
      data: updatedDoc,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const adminDeleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Order.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, message: "Order deleted by Admin successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllOrders, updateOrderStatus, adminDeleteOrder };
