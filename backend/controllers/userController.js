const userModel = require("../models/userModel");
const objectConverter = require("../utils/ObjectConverter");
const { createNotification } = require("../controllers/NotificationController");
//Function to find all users

exports.findAllUsers = async (req, res) => {
  try {
    const queryObj = {};

    const username = req.query.username;
    if (username) {
      queryObj.username = username;
    }

    const users = await userModel.find(queryObj);

    res.status(200).send(objectConverter.userResponse(users));
  } catch (err) {
    res.status(500).send({
      message: `${err} while finding users`,
    });
  }
};

//Function to find user by Id

exports.getUserById = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await userModel.findById(id);
    if (!user) {
      res.status(400).send({
        message: `Cast to ObjectId failed for value ${id} at path "_id" for model "user"`,
      });
    }
    res.status(200).send(user);
  } catch (err) {
    res.status(500).send({
      message: `${err} while finding user with ${id}`,
    });
  }
};

// Function to update user information
exports.updateUserInfo = async (req, res) => {
  try {
    const { fullName, avatar, mobileNumber, address, bio, website, gender } =
      req.body;

    const username = req.username;

    if (!username) {
      return res.status(401).send({ msg: "Invalid Authentication." });
    }

    const updatedFields = {};

    // Check which fields are present in the request body and update accordingly
    if (fullName) updatedFields.fullName = fullName;
    if (avatar) updatedFields.avatar = avatar;
    if (mobileNumber) updatedFields.mobileNumber = mobileNumber;
    if (address) updatedFields.address = address;
    if (bio) updatedFields.bio = bio;
    if (website) updatedFields.website = website;
    if (gender) updatedFields.gender = gender;

    const updatedUser = await userModel.findOneAndUpdate(
      { username: username },
      { $set: updatedFields },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send({ msg: "User not found." });
    }

    res.status(200).send({ msg: "Update Success!" });
  } catch (err) {
    res.status(500).send({ message: `${err} while updating user information` });
  }
};

//Function to follow a user by Id

exports.followUser = async (req, res) => {
  try {
    const id = req.params.id;
    const username = req.username;

    if (!username) {
      return res.status(401).send({ msg: "Invalid Authentication." });
    }

    const user = await userModel.findOne({ username: username });

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    if (user._id.toString() === id) {
      return res.status(403).send({ message: "Cannot follow yourself." });
    }

    const followUser = await userModel.findById(id);

    if (!followUser) {
      return res.status(404).send({ message: "User to follow not found." });
    }

    if (user.following.includes(id)) {
      return res.status(400).send({ message: "Already following this user." });
    }

    await userModel.updateOne({ _id: user._id }, { $push: { following: id } });
    await userModel.updateOne(
      { _id: followUser._id },
      { $push: { followers: user._id } }
    );

    // Create a notification for the followed user
    req.body = {
      recipients: followUser._id, // ID of the user who initiated the follow
      url: `/profile/${user.avatar}`,
      text: `${user.fullName} has started following you.`,
      user: user._id,
    };

    await createNotification(req, res); // Call the createNotification function

    res.status(200).send(followUser);
  } catch (err) {
    res
      .status(500)
      .send({ message: `Error while following user: ${err.message}` });
  }
};

//Function to Unfollow a user

exports.unfollowUser = async (req, res) => {
  try {
    const id = req.params.id;
    const username = req.username;

    if (!username) {
      return res.status(401).send({ msg: "Invalid Authentication." });
    }

    const user = await userModel.findOne({ username: username });

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    const unfollowUser = await userModel.findById(id);

    if (!unfollowUser) {
      return res.status(404).send({ message: "User to unfollow not found." });
    }

    if (!user.following.includes(id)) {
      return res.status(400).send({ message: "Not following this user." });
    }

    await userModel.updateOne({ _id: user._id }, { $pull: { following: id } });
    await userModel.updateOne(
      { _id: unfollowUser._id },
      { $pull: { followers: user._id } }
    );

    res.status(200).send(unfollowUser);
  } catch (err) {
    res
      .status(500)
      .send({ message: `Error while unfollowing user: ${err.message}` });
  }
};

//Function to user suggestion
exports.userSuggestions = async (req, res) => {
  try {
    const username = req.username;
    const searchTerm = req.query.searchTerm || ""; // Get the search term from the query parameters

    if (!username) {
      return res.status(401).json({ msg: "Invalid Authentication." });
    }

    const user = await userModel.findOne({ username: username });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const followingIds = user.following;
    const followersIds = user.followers;

    const suggestedUsers = await userModel.find({
      $or: [
        { _id: { $in: followingIds } },
        { _id: { $in: followersIds } },
        { _id: user._id }, // Including current user
      ],
      fullName: { $regex: new RegExp(searchTerm, "i") }, // Case-insensitive search based on fullName
    });

    const formattedUsers = suggestedUsers.map((user) => {
      const {
        _id,
        avatar,
        role,
        gender,
        mobile,
        address,
        story,
        website,
        followers,
        following,
        saved,
        fullName,
        username,
        email,
        createdAt,
        updatedAt,
        __v,
      } = user;

      return {
        _id,
        avatar,
        role,
        gender,
        mobile,
        address,
        story,
        website,
        followers,
        following,
        saved,
        fullName,
        username,
        email,
        createdAt,
        updatedAt,
        __v,
      };
    });

    res.status(200).json({
      users: formattedUsers,
      result: formattedUsers.length,
    });
  } catch (err) {
    res.status(500).json({
      message: `Error while fetching user suggestions: ${err.message}`,
    });
  }
};

// Function to get users followed by the logged-in user
exports.getFollowingUsers = async (req, res) => {
  try {
    const username = req.username;

    if (!username) {
      return res.status(401).json({ msg: "Invalid Authentication." });
    }

    const user = await userModel.findOne({ username: username });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const followingIds = user.following;

    const followingUsers = await userModel.find({
      _id: { $in: followingIds },
    });

    res.status(200).json({
      users: followingUsers,
      result: followingUsers.length,
    });
  } catch (err) {
    res.status(500).json({
      message: `Error while fetching following users: ${err.message}`,
    });
  }
};

// Function to get followers of the logged-in user
exports.getFollowers = async (req, res) => {
  try {
    const username = req.username;

    if (!username) {
      return res.status(401).json({ msg: "Invalid Authentication." });
    }

    const user = await userModel.findOne({ username: username });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const followersIds = user.followers;

    const followers = await userModel.find({
      _id: { $in: followersIds },
    });

    res.status(200).json({
      users: followers,
      result: followers.length,
    });
  } catch (err) {
    res.status(500).json({
      message: `Error while fetching followers: ${err.message}`,
    });
  }
};

// Function to get user ID by username
exports.getUserIdByUsername = async (req, res) => {
  try {
    const username = req.params.username;

    if (!username) {
      return res.status(400).json({ message: "Username not provided." });
    }

    const user = await userModel.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ userId: user._id });
  } catch (err) {
    res
      .status(500)
      .json({ message: `Error while fetching user ID: ${err.message}` });
  }
};
