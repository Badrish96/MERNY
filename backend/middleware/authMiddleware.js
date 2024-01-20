const jwt = require("jsonwebtoken");
const authConfig = require("../configs/authConfig");

verifyToken = (req, res, next) => {
  const token = req.headers["x-auth-token"];

  if (!token) {
    return res.status(401).json({
      message: "No token available",
    });
  }

  jwt.verify(token, authConfig.secret, (err, payload) => {
    if (err) {
      return res.status(401).json({
        message: "Invalid authentication",
      });
    }

    if (!payload || !payload.user) {
      return res.status(401).json({
        message: "Invalid token payload",
      });
    }

    req.username = payload.user;
    next();
  });
};

const authFunction = {
  verifyToken: verifyToken,
};

module.exports = authFunction;
