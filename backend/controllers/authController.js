const userModel = require("../models/userModel");
const bcrypt = require("bcryptjs");
const authConfig = require("../configs/authConfig");
const jwt = require("jsonwebtoken");

//Function to register new user
exports.registerUser = async (req, res) => {
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  //Check if email address is already in use
  const email = await userModel.findOne({ email: req.body.email });
  if (email) {
    return res.status(400).send({
      message: "Try any other email, this email is already registered!",
    });
  }

  // Check email format using a regular expression
  const emailFormat = /^[a-zA-Z0-9+_.-]+@[a-zA-Z0-9.-]+$/;
  if (!emailFormat.test(req.body.email)) {
    return res.status(403).json({
      message: "Invalid email format!",
    });
  }

  //Check if username already exists
  const existingUser = await userModel.findOne({ username: req.body.username });
  if (existingUser) {
    return res.status(400).json({
      message: "Try any other username, this username is already registered!",
    });
  }
  // Check if password is at least 6 characters long
  const passwordLength = /^.{6,}$/;
  if (!passwordLength.test(req.body.password)) {
    return res.status(400).send({
      message: "Password must be at least 6 characters.",
    });
  }

  const newUser = {
    username: req.body.username,
    fullName: req.body.fullName,
    email: req.body.email,
    password: hashedPassword,
    gender: req.body.gender,
  };

  try {
    const userCreated = await userModel.create(newUser);

    const token = jwt.sign({ id: userCreated.username }, authConfig.secret, {
      expiresIn: 120,
    });

    const userResponse = {
      msg: "Register Success!",
      username: userCreated.username,
      fullName: userCreated.fullName,
      email: userCreated.email,
      password: hashedPassword,
      gender: userCreated.gender,
      avatar: userCreated.avatar,
      userRole: userCreated.userRole,
      mobileNumber: userCreated.mobileNumber,
      address: userCreated.address,
      bio: userCreated.bio,
      website: userCreated.website,
      followers: userCreated.follower,
      following: userCreated.following,
      saved: userCreated.saved,
      createdAt: userCreated.createdAt,
      updatedAt: userCreated.updatedAt,
      accessToken: token,
    };
    res.status(200).send(userResponse);
  } catch (err) {
    res.status(500).send({
      message: `${err} while registering`,
    });
  }
};

//Function for login

exports.login = async (req, res) => {
  //find user email from the database
  try {
    const user = await userModel.findOne({ email: req.body.email });

    if (user == null) {
      return res.status(400).send({
        message: "This email has not been registered!",
      });
    }
    const isPasswordValid = bcrypt.compareSync(
      req.body.password,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).send({
        message: "Password is incorrect.",
      });
    }
    //Fetching user info from jwt token
    const token = jwt.sign({ user: user.username }, authConfig.secret, {
      expiresIn: 20000,
    });
    var responseUser = {
      msg: "Login Success!",
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      gender: user.gender,
      avatar: user.avatar,
      userRole: user.userRole,
      mobileNumber: user.mobileNumber,
      address: user.address,
      bio: user.bio,
      website: user.website,
      followers: user.follower,
      following: user.following,
      saved: user.saved,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      accessToken: token,
    };
    res.status(200).send(responseUser);
  } catch (err) {
    res.status(500).send({
      message: `${err} while login`,
    });
  }
};

//Function for logout

exports.logout = async (req, res) => {
  const user = await userModel.findOne({ email: req.body.email });

  bcrypt.compareSync(req.body.password, user.password);

  res.status(200).send({
    message: "Logged out!",
  });
};
