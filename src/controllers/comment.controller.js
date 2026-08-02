const Comment = require("../models/comment.model");

const addComment = async (req, res) => {
  try {
    const newComment = await Comment.create({
      ...req.body,
      isDeleted: false,
      replies: [],
    });
    res.status(201).send({ success: true, data: newComment });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getCommentsByProduct = async (req, res) => {
  try {
    const result = await Comment.find({
      productId: req.params.productId,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    res.send({ success: true, data: result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const addReply = async (req, res) => {
  try {
    const { userName, pictureUrl, comment } = req.body;
    const newReply = { userName, pictureUrl, comment, createdAt: new Date() };

    const result = await Comment.findByIdAndUpdate(
      req.params.commentId,
      { $push: { replies: newReply } },
      { new: true }
    );

    res.send({ success: true, data: newReply });
  } catch (err) {
    res.status(500).send({ success: false, message: err.message });
  }
};

module.exports = { addComment, getCommentsByProduct, addReply };
