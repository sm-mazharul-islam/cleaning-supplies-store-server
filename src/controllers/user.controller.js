const profileController = require("./user.profile.controller");
const adminController = require("./user.admin.controller");

module.exports = {
  ...profileController,
  ...adminController,
};
