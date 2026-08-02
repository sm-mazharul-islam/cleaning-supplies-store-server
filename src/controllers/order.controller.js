const userOrderController = require("./order.user.controller");
const adminOrderController = require("./order.admin.controller");

module.exports = {
  ...userOrderController,
  ...adminOrderController,
};
