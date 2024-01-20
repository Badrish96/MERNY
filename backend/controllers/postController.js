const postModel = require("../models/postModel");
const userModel = require("../models/userModel");
const Notification = require("../controllers/NotificationController");
//Function to add post for logged in user
exports.createPost = async (req, res) => {
  try {
    const { content, images } = req.body;
    const username = req.username;

    const user = await userModel.findOne({ username }); // Find the user based on the username

    const newPost = await postModel.create({
      content,
      images,
      user: user._id, // Assign the ObjectId of the user to the post's user field
    });

    const postResponse = {
      msg: "Created Post!",
      newPost: {
        ...newPost.toObject(),
        user: {
          avatar: user.avatar,
          followers: user.followers,
          _id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          __v: user.__v,
        },
      },
    };

    res.status(200).json(postResponse);
  } catch (err) {
    res.status(500).json({
      message: `${err} while adding post`,
    });
  }
};

//Function to get all posts for logged in user

exports.getAllPosts = async (req, res) => {
  try {
    const username = req.username; // Assuming req.user has the logged-in user's information from the token

    const user = await userModel.findOne({ username }); // Find the user based on the username

    const posts = await postModel
      .find({ user: user._id }) // Use the ObjectId of the user to find posts
      .populate({
        path: "user",
        select: "avatar followers _id fullName username",
      })
      .populate("comments")
      .exec();

    const response = {
      msg: "Success!",
      result: posts.length,
      posts: posts.map((post) => ({
        images: post.images,
        likes: post.likes,
        comments: post.comments,
        _id: post._id,
        content: post.content,
        user: post.user,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        __v: post.__v,
      })),
    };

    res.status(200).json(response);
  } catch (err) {
    res.status(500).json({
      message: `${err} while fetching posts`,
    });
  }
};

//Function to update post by Id

exports.updatePostById = async (req, res) => {
  const postId = req.params.id;
  const { content, images } = req.body;
  const username = req.username; // Assuming req.user has the logged-in user's information from the token

  const user = await userModel.findOne({ username }); // Find the user based on the username
  const userId = user._id; // Assuming req.user has the logged-in user's information from the token

  try {
    const post = await postModel.findById(postId);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    if (String(post.user) !== String(userId)) {
      // Ensure both are string representations for comparison
      return res
        .status(403)
        .json({ msg: "You are not authorized to update this post" });
    }

    const updatedFields = {};
    if (content) updatedFields.content = content;
    if (images) updatedFields.images = images;

    const updatedPost = await postModel.findByIdAndUpdate(
      postId,
      { $set: updatedFields },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(500).json({ msg: "Could not update post" });
    }

    res.status(200).json({ msg: "Updated Post!", newPost: updatedPost });
  } catch (err) {
    res.status(500).json({ message: `${err} while updating post` });
  }
};

//Function to get a particular post by Id

exports.getPostById = async (req, res) => {
  try {
    const id = req.params.id;

    const post = await postModel.findById(id);

    if (!post) {
      res.status(400).send({
        message: `No Post found with ${id}`,
      });
    }

    res.status(200).send(post);
  } catch (err) {
    res.status(500).send({
      message: `${err} while finding post with ${id}`,
    });
  }
};

//Function to delete a particular post by Id

exports.deletePostById = async (req, res) => {
  const id = req.params.id;
  const username = req.username; // Assuming req.user has the logged-in user's information from the token

  const user = await userModel.findOne({ username }); // Find the user based on the username
  const userId = user._id; // Assuming req.user has the logged-in user's information from the token

  try {
    const post = await postModel.findByIdAndDelete(id);
    if (!post) {
      return res.status(404).json({ msg: `Post not found with ${id}` });
    }

    if (String(post.user) !== String(userId)) {
      return res
        .status(403)
        .json({ msg: "You are not authorized to delete this post" });
    }

    res.status(200).send({ msg: "Deleted Post!", deletedPost: post });
  } catch (err) {
    res.status(500).send({
      message: `${err} while deleting user with ${id}`,
    });
  }
};

//Function to like a post
exports.likePostById = async (req, res) => {
  const id = req.params.id;
  const username = req.username;

  const user = await userModel.findOne({ username });

  const userId = user._id;

  try {
    // Check if the post exists
    const post = await postModel.findById(id);
    if (!post) {
      return res.status(404).json({ msg: "This post does not exist." });
    }

    // Add the user's ID to the likes array if not already liked
    if (post.likes.includes(userId)) {
      return res.status(400).json({ msg: "You have already liked this post." });
    }

    post.likes.push(userId);
    await post.save();

    // Create a notification
    const newNotification = new Notification({
      user: user._id, // ID of the followed user
      recipient: [post.user], // ID of the user who initiated the follow
      url: `/profile/${user.avatar}`,
      text: `${user.fullName} has liked your post.`,
      isRead: false,
    });

    // Save the notification
    await newNotification.save();

    return res.status(200).json({ msg: "Liked Post!" });
  } catch (err) {
    res.status(500).send({
      message: `${err} while liking the post`,
    });
  }
};

//Function to dislike a post
exports.unlikePostById = async (req, res) => {
  const id = req.params.id;
  const username = req.username;

  const user = await userModel.findOne({ username });

  const userId = user._id;

  try {
    // Check if the post exists
    const post = await postModel.findById(id);
    if (!post) {
      return res.status(404).json({ msg: "This post does not exist." });
    }

    // Add the user's ID to the likes array if not already liked
    if (!post.likes.includes(userId)) {
      return res.status(400).json({ msg: "You have not liked this post." });
    }

    post.likes.pull(userId);
    await post.save();

    // Create a notification
    const newNotification = new Notification({
      user: user._id, // ID of the followed user
      recipient: [post.user], // ID of the user who initiated the follow
      url: `/profile/${user.avatar}`,
      text: `${user.fullName} has liked your post.`,
      isRead: false,
    });

    // Save the notification
    await newNotification.save();

    return res.status(200).json({ msg: "Unliked Post!" });
  } catch (err) {
    res.status(500).send({
      message: `${err} while liking the post`,
    });
  }
};

//Function to find post for a user by userID

exports.findPostByUserId = async (req, res) => {
  const userId = req.params.id;

  try {
    const posts = await postModel.find({ user: userId });

    return res.status(200).json({ posts, result: posts.length });
  } catch (error) {
    return res
      .status(500)
      .json({ msg: `${err} while finding post for user with ${id}` });
  }
};

//Function to save post in user database
exports.savePost = async (req, res) => {
  const postId = req.params.id;
  const username = req.username;

  try {
    // Find the user
    const user = await userModel.findOne({ username });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check if the post exists
    const post = await postModel.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // Check if the post is already saved by the user
    if (user.saved.includes(postId)) {
      return res.status(400).json({ msg: "Post already saved" });
    }

    // Save the post to the user's saved list
    user.saved.push(postId);
    await user.save();

    return res.status(200).json({ msg: "Saved Post!" });
  } catch (err) {
    res.status(500).send({
      message: `${err} while saving post`,
    });
  }
};

//Function to Unsave post in user database
exports.unSavePost = async (req, res) => {
  const postId = req.params.id;
  const username = req.username;

  try {
    // Find the user
    const user = await userModel.findOne({ username });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Check if the post exists
    const post = await postModel.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // Check if the post is already saved by the user
    if (!user.saved.includes(postId)) {
      return res
        .status(400)
        .json({ msg: "Post doesn't exists in user database" });
    }

    // Save the post to the user's saved list
    user.saved.pull(postId);
    await user.save();

    return res.status(200).json({ msg: "Unsaved Post!" });
  } catch (err) {
    res.status(500).send({
      message: `${err} while saving post`,
    });
  }
};

exports.findSavedPosts = async (req, res) => {
  const userId = req.username;

  try {
    // Find the user
    const user = await userModel.findOne({ username: userId });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Find all saved posts' IDs for the user
    const savedPostIds = user.saved;

    // Find all posts with the saved IDs
    const savedPosts = await postModel.find({ _id: { $in: savedPostIds } });

    return res.status(200).json({ savedPosts, result: savedPosts.length });
  } catch (error) {
    return res.status(500).json({ msg: "Internal Server Error" });
  }
};

// Function to get posts from users you are following
exports.getFollowingPosts = async (req, res) => {
  try {
    const username = req.username;

    // Find the user based on the username
    const user = await userModel.findOne({ username });

    // Get the user's followers
    const following = user.following;

    // Fetch posts from the users the current user is following
    const posts = await postModel
      .find({ user: { $in: following } })
      .populate({
        path: "user",
        select: "avatar followers _id fullName username",
      })
      .populate("comments")
      .exec();

    res.status(200).json({
      msg: "Success!",
      result: posts.length,
      posts: posts.map((post) => ({
        images: post.images,
        likes: post.likes,
        comments: post.comments,
        _id: post._id,
        content: post.content,
        user: post.user,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        __v: post.__v,
      })),
    });
  } catch (err) {
    res.status(500).json({
      message: `${err} while fetching following posts`,
    });
  }
};
