const express = require("express");
const router = express.Router();
const { syncUser } = require("../controllers/user.controller");

router.post("/sync", syncUser);
// router.post("/login", login);

module.exports = router;
