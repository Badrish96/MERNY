const notificationController = require("../controllers/NotificationController");
const authMiddleware = require("../middleware/authMiddleware");

module.exports = function (app) {
  app.post(
    "/merny/api/v1/auth/notification/create",
    authMiddleware.verifyToken,
    notificationController.createNotification
  );
  app.delete(
    "/merny/api/v1/auth/notification/delete/:id",
    authMiddleware.verifyToken,
    notificationController.removeNotification
  );
  app.get(
    "/merny/api/v1/auth/notification/find",
    authMiddleware.verifyToken,
    notificationController.findAllNotificationForUser
  );
  app.patch(
    "/merny/api/v1/auth/notification/update/:id",
    authMiddleware.verifyToken,
    notificationController.updateNotificationReadStatus
  );
  app.delete(
    "/merny/api/v1/auth/notification/delete",
    authMiddleware.verifyToken,
    notificationController.deleteAllNotifications
  );
};
