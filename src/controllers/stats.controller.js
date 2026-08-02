const Product = require("../models/product.model");
const User = require("../models/user.model");
const Order = require("../models/order.model");
const Comment = require("../models/comment.model");

const getAdminStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();

    const revenueResult = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
    ]);

    const salesData = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 15 },
    ]);

    const brandDistribution = await Product.aggregate([
      { $group: { _id: "$brand", value: { $sum: 1 } } },
      { $project: { name: "$_id", value: 1, _id: 0 } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue: revenueResult[0]?.totalRevenue || 0,
      },
      charts: {
        salesOverTime: salesData.map((d) => ({ date: d._id, sales: d.sales, orders: d.orders })),
        brandData: brandDistribution,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getUserStats = async (req, res) => {
  try {
    const { email } = req.params;
    const userOrders = await Order.find({ userEmail: email });
    const totalOrders = userOrders.length;
    const totalSpent = userOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const pendingOrders = userOrders.filter((o) => o.status === "pending").length;
    const totalComments = await Comment.countDocuments({ userEmail: email, isDeleted: false });
    const recentOrders = await Order.find({ userEmail: email }).sort({ createdAt: -1 }).limit(3);

    res.status(200).json({
      success: true,
      stats: { totalOrders, totalSpent, pendingOrders, totalComments: totalComments || 0 },
      recentOrders,
      activity: { lastActivity: userOrders.length > 0 ? userOrders[0].createdAt : new Date() },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAdminStats, getUserStats };
