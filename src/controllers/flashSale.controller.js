const FlashSale = require("../models/flashSale.model");

const getFlashSale = async (req, res) => {
  try {
    const data = await FlashSale.find({}).sort({ createdAt: -1 });
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
    const result = await FlashSale.findById(req.params.id);
    if (!result) {
      return res.status(404).json({ success: false, message: "Detail not found" });
    }
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getFlashSale, getFlashSaleDetails };
