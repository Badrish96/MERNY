const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },
    images: {
      type: [],
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comments",
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
  },
  { timestamps: true } // Use timestamps for createdAt and updatedAt
);

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
