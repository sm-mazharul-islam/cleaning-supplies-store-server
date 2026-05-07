const { ObjectId } = require("mongodb");
const connectToDatabase = require("../config/db");

const getProducts = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { brand, searchQuery } = req.query;
    let query = {};

    if (searchQuery && searchQuery.trim() !== "") {
      query.$or = [
        { title: { $regex: searchQuery, $options: "i" } },
        { name: { $regex: searchQuery, $options: "i" } },
      ];
    }

    if (brand && brand.trim() !== "" && brand !== "undefined") {
      const brandArray = brand.split(",");
      query.brand = { $in: brandArray };
    }

    const total = await db.collection("products").countDocuments(query);
    const result = await db
      .collection("products")
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();

    res.json({
      success: true,
      data: result,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }

    const result = await db
      .collection("products")
      .findOne({ _id: new ObjectId(id) });

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const addProduct = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const productData = req.body;

    if (!productData.title || !productData.salePrice || !productData.image) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const newProduct = {
      ...productData,
      flashSale:
        productData.flashSale === "true" || productData.flashSale === true,
      createdAt: new Date(),
    };

    const result = await db.collection("products").insertOne(newProduct);
    res.status(201).json({
      success: true,
      data: { ...newProduct, _id: result.insertedId },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const { id } = req.params;
    const updatedData = req.body;

    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }

    const { _id, ...updateFields } = updatedData;
    if (updateFields.flashSale !== undefined) {
      updateFields.flashSale =
        updateFields.flashSale === "true" || updateFields.flashSale === true;
    }

    const result = await db
      .collection("products")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { ...updateFields, updatedAt: new Date() } },
        { returnDocument: "after" },
      );

    const updatedDoc = result.value || result;

    if (!updatedDoc) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({
      success: true,
      message: "Updated successfully",
      data: updatedDoc,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }

    const result = await db
      .collection("products")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getFlashSale = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const data = await db
      .collection("flash-sale")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    console.log("Flash Sale Collection Data:", data.length);

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getFlashSaleDetails = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const { id } = req.params;

    const result = await db.collection("flash-sale").findOne({
      _id: new ObjectId(id),
    });

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Detail not found" });
    }

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
const createOrder = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const orderData = req.body;

    if (!orderData.userEmail || !orderData.items) {
      return res
        .status(400)
        .json({ success: false, message: "Order data missing" });
    }

    const newOrder = {
      ...orderData,
      status: "pending",
      createdAt: new Date(),
    };

    const result = await db.collection("orders").insertOne(newOrder);
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: { ...newOrder, _id: result.insertedId },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const result = await db
      .collection("orders")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const { email } = req.params;

    if (req.user && req.user.email !== email) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: Access denied to other user's data",
      });
    }

    const result = await db
      .collection("orders")
      .find({ userEmail: email })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteUserOrder = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const { id } = req.params;
    const currentUserEmail = req.user.email;

    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Order ID" });
    }

    const order = await db
      .collection("orders")
      .findOne({ _id: new ObjectId(id) });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.userEmail !== currentUserEmail) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You can only delete your own orders",
      });
    }

    const orderTime = new Date(order.createdAt).getTime();
    const currentTime = new Date().getTime();
    const limit = 24 * 60 * 60 * 1000;

    if (currentTime - orderTime > limit) {
      return res.status(403).json({
        success: false,
        message:
          "Cancellation period expired. Orders can only be deleted within 24 hours.",
      });
    }

    const result = await db
      .collection("orders")
      .deleteOne({ _id: new ObjectId(id) });

    res
      .status(200)
      .json({ success: true, message: "Order cancelled successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const { id } = req.params;
    const { status } = req.body;

    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }

    let autoMessage = "";
    if (status === "approved") {
      autoMessage =
        "Thank You for ordering us , we can send as soon as possible please be patient and connect with us";
    }

    const updateDoc = {
      $set: {
        status: status,
        adminMessage: autoMessage,
        updatedAt: new Date(),
      },
    };

    const result = await db
      .collection("orders")
      .findOneAndUpdate({ _id: new ObjectId(id) }, updateDoc, {
        returnDocument: "after",
      });

    const updatedDoc = result.value || result;

    if (!updatedDoc) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({
      success: true,
      message: autoMessage || `Order status updated to ${status}`,
      data: updatedDoc,
    });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const adminDeleteOrder = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Order ID" });
    }

    const result = await db
      .collection("orders")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Order deleted by Admin successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAdminStats = async (req, res) => {
  try {
    const { db } = await connectToDatabase();

    const totalProducts = await db.collection("products").countDocuments();
    const totalUsers = await db.collection("user").countDocuments();
    const totalOrders = await db.collection("orders").countDocuments();

    const revenueResult = await db
      .collection("orders")
      .aggregate([
        { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } },
      ])
      .toArray();

    const salesData = await db
      .collection("orders")
      .aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            sales: { $sum: "$totalAmount" },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 15 },
      ])
      .toArray();

    const brandDistribution = await db
      .collection("products")
      .aggregate([
        { $group: { _id: "$brand", value: { $sum: 1 } } },
        { $project: { name: "$_id", value: 1, _id: 0 } },
      ])
      .toArray();

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue: revenueResult[0]?.totalRevenue || 0,
      },
      charts: {
        salesOverTime: salesData.map((d) => ({
          date: d._id,
          sales: d.sales,
          orders: d.orders,
        })),
        brandData: brandDistribution,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getUserStats = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const { email } = req.params;
    const userOrders = await db
      .collection("orders")
      .find({ userEmail: email })
      .toArray();
    const totalOrders = userOrders.length;
    const totalSpent = userOrders.reduce(
      (sum, order) => sum + (Number(order.totalAmount) || 0),
      0,
    );
    const pendingOrders = userOrders.filter(
      (order) => order.status === "pending",
    ).length;
    const totalComments = await db.collection("comments").countDocuments({
      userEmail: email,
      isDeleted: false,
    });

    const recentOrders = await db
      .collection("orders")
      .find({ userEmail: email })
      .sort({ createdAt: -1 })
      .limit(3)
      .toArray();

    res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        totalSpent,
        pendingOrders,
        totalComments: totalComments || 0,
      },
      recentOrders,
      activity: {
        lastActivity:
          userOrders.length > 0 ? userOrders[0].createdAt : new Date(),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getFlashSale,
  getFlashSaleDetails,
  getAdminStats,
  createOrder,
  getAllOrders,
  getUserOrders,
  deleteUserOrder,
  updateOrderStatus,
  adminDeleteOrder,
  getUserStats,
};
