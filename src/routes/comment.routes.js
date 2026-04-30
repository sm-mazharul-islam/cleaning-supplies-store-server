const express = require("express");
const router = express.Router();
const {
  addComment,
  getCommentsByProduct,
  addReply,
} = require("../controllers/comment.controller");

router.post("/", addComment);
router.get("/:productId", getCommentsByProduct);
router.patch("/reply/:commentId", addReply);

module.exports = router;
