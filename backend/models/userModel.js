const mongoose = require("mongoose");
//User Schema
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default:
      "https://upload.wikimedia.org/wikipedia/commons/5/50/User_icon-cp.svg",
  },
  userRole: {
    type: String,
    default: "User",
  },
  gender: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: Number,
  },
  address: {
    type: String,
  },
  bio: {
    type: String,
  },
  website: {
    type: String,
  },
  followers: {
    type: [],
  },
  following: {
    type: [],
  },
  saved: {
    type: [
      {
        type: mongoose.Types.ObjectId,
        ref: "Post",
      },
    ],
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

// Add a compound text index on fullName and username
userSchema.index({ fullName: "text", username: "text" });

module.exports = mongoose.model("User", userSchema);
