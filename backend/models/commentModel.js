const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  tag: {
    type: Object,
  },
  reply: {
    type: mongoose.Types.ObjectId,
    ref: "Comment",
  },
  likes: [
    {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
  ],
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  postId: {
    type: mongoose.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  postUserId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: () => {
      return Date.now();
    },
    immutable: true,
  },
  updatedAt: {
    type: Date,
    default: () => {
      return Date.now();
    },
    immutable: true,
  },
});

module.exports = mongoose.model("Comments", commentSchema);
