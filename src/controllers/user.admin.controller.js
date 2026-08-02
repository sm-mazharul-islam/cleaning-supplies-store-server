const User = require("../models/user.model");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const result = await User.findByIdAndUpdate(id, { $set: { role } }, { new: true });
    if (!result) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: `User role updated to ${role}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const adminDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await User.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User deleted by admin successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAllUsers, updateUserRole, adminDeleteUser };
