const express = require("express");
const router = express.Router();
const { register, login, syncUser } = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/login", login);
router.post("/sync", syncUser);

module.exports = router;
