const commentModel = require("../models/commentModel");
const userModel = require("../models/userModel");
const postModel = require("../models/postModel");

exports.addComment = async (req, res) => {
  try {
    const { postId, content, tag, reply, postUserId } = req.body;

    // Check if all required fields are provided
    if (!postId || !content || !postUserId) {
      return res
        .status(400)
        .json({ msg: "Please provide all required fields." });
    }

    // Check if the post exists
    const existingPost = await postModel.findById(postId);
    if (!existingPost) {
      return res.status(404).json({ msg: "This post does not exist." });
    }

    // Find the authenticated user based on the token info
    const user = await userModel.findOne({ username: req.username });
    if (!user) {
      return res.status(404).json({ msg: "User not found." });
    }

    if (user._id != postUserId) {
      return res.status(400).send({ message: "User does not match" });
    }

    // If it's not a reply, create a new comment
    if (!reply) {
      const newCommentData = {
        content,
        likes: [],
        createdAt: new Date(),
        postId,
        postUserId,
        user: user._id,
      };

      const newComment = await commentModel.create(newCommentData);
      return res.status(201).json({ comment: newComment });
    } else {
      // For replies, handle differently or create as separate comments based on your logic
      // Implement your reply logic here if needed
      // For example, create replies as separate comments and fetch them with parent comment ID
      const parentComment = await commentModel.findById(reply);
      if (!parentComment) {
        return res.status(404).json({ msg: "Parent comment does not exist." });
      }

      const newReply = {
        content,
        likes: [],
        createdAt: new Date(),
        reply: parentComment._id,
        tag,
        postId,
        postUserId,
        user: user._id,
      };

      const createdReply = await commentModel.create(newReply);
      return res.status(201).json({ reply: createdReply });
    }
  } catch (err) {
    res.status(500).json({ message: `${err} while adding comment` });
  }
};

exports.updateCommentById = async (req, res) => {
  const commentId = req.params.id;
  const { content } = req.body;
  const username = req.username; // Assuming req.user has the logged-in user's information from the token

  const user = await userModel.findOne({ username }); // Find the user based on the username
  const userId = user._id; // Assuming req.user has the logged-in user's information from the token

  try {
    const comment = await commentModel.findById(commentId);

    if (!comment) {
      return res.status(404).json({ msg: "Comment not found" });
    }

    if (String(comment.user) !== String(userId)) {
      // Ensure both are string representations for comparison
      return res
        .status(403)
        .json({ msg: "You are not authorized to update this comment" });
    }

    const updatedFields = {};
    if (content) updatedFields.content = content;

    await commentModel.findByIdAndUpdate(
      commentId,
      { $set: updatedFields },
      { new: true }
    );
    res.status(200).json({ msg: "Update Success!" });
  } catch (err) {
    res.status(500).json({ message: `${err} while updating post` });
  }
};

exports.likeCommentById = async (req, res) => {
  const commentId = req.params.id;

  const username = req.username;

  const user = await userModel.findOne({ username });

  const userId = user._id;

  try {
    // Check if the post exists
    const comment = await commentModel.findById(commentId);
    if (!comment) {
      return res.status(404).json({ msg: "This comment does not exist." });
    }

    // Add the user's ID to the likes array if not already liked
    if (comment.likes.includes(userId)) {
      return res
        .status(400)
        .json({ msg: "You have already liked this comment." });
    }

    comment.likes.push(userId);
    await comment.save();

    return res.status(200).json({ msg: "Liked Comment!" });
  } catch (err) {
    res.status(500).send({
      message: `${err} while liking the comment`,
    });
  }
};

exports.unlikeCommentById = async (req, res) => {
  const commentId = req.params.id;

  const username = req.username;

  const user = await userModel.findOne({ username });

  const userId = user._id;

  try {
    // Check if the post exists
    const comment = await commentModel.findById(commentId);
    if (!comment) {
      return res.status(404).json({ msg: "This comment does not exist." });
    }

    // Add the user's ID to the likes array if not already liked
    if (!comment.likes.includes(userId)) {
      return res.status(400).json({ msg: "You have not liked this comment." });
    }

    comment.likes.pull(userId);
    await comment.save();

    return res.status(200).json({ msg: "Unliked Comment!" });
  } catch (err) {
    res.status(500).send({
      message: `${err} while unliking the comment`,
    });
  }
};

exports.deleteCommentById = async (req, res) => {
  const id = req.params.id;
  const username = req.username; // Assuming req.user has the logged-in user's information from the token

  const user = await userModel.findOne({ username }); // Find the user based on the username
  const userId = user._id; // Assuming req.user has the logged-in user's information from the token

  try {
    const comment = await commentModel.findByIdAndDelete(id);
    if (!comment) {
      return res.status(404).json({ msg: `Comment not found with ${id}` });
    }

    if (String(comment.user) !== String(userId)) {
      return res
        .status(403)
        .json({ msg: "You are not authorized to delete this comment" });
    }

    res.status(200).send({ msg: "Deleted Comment!" });
  } catch (err) {
    res.status(500).send({
      message: `${err} while deleting user with ${id}`,
    });
  }
};

// Assuming you have a 'post' field in your Comment model representing the associated post
exports.getCommentsByPostId = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await commentModel.find({ post: postId }).populate("user");

    res.status(200).json({ comments });
  } catch (error) {
    res.status(500).json({ message: `Error fetching comments: ${error}` });
  }
};
