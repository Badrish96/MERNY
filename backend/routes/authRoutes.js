const authController = require("../controllers/authController");

module.exports = function (app) {
  app.post("/merny/api/v1/auth/register", authController.registerUser);
  app.post("/merny/api/v1/auth/login", authController.login);
  app.post("/merny/api/v1/auth/logout", authController.logout);
};
