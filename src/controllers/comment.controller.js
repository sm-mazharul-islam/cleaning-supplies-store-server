const { ObjectId } = require("mongodb");
const connectToDatabase = require("../config/db");

const addComment = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const newComment = {
      ...req.body,
      productId: new ObjectId(req.body.productId),
      createdAt: new Date(),
      replies: [],
      isDeleted: false,
    };
    const result = await db.collection("comments").insertOne(newComment);
    res
      .status(201)
      .send({ success: true, data: { ...newComment, _id: result.insertedId } });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getCommentsByProduct = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const result = await db
      .collection("comments")
      .find({ productId: new ObjectId(req.params.productId), isDeleted: false })
      .sort({ createdAt: -1 })
      .toArray();
    res.send({ success: true, data: result });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const addReply = async (req, res) => {
  try {
    const { db } = await connectToDatabase();
    const { userName, pictureUrl, comment } = req.body;
    const newReply = { userName, pictureUrl, comment, createdAt: new Date() };
    const result = await db
      .collection("comments")
      .updateOne(
        { _id: new ObjectId(req.params.commentId) },
        { $push: { replies: newReply } },
      );
    res.send({ success: true, data: newReply });
  } catch (err) {
    res.status(500).send({ success: false, message: err.message });
  }
};

module.exports = { addComment, getCommentsByProduct, addReply };
