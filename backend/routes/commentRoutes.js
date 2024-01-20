const commentController = require("../controllers/commentController");
const authMiddleware = require("../middleware/authMiddleware");

module.exports = function (app) {
  app.post(
    "/merny/api/v1/auth/addComment",
    authMiddleware.verifyToken,
    commentController.addComment
  );
  app.patch(
    "/merny/api/v1/auth/updateComment/:id",
    authMiddleware.verifyToken,
    commentController.updateCommentById
  );
  app.patch(
    "/merny/api/v1/auth/likeComment/:id",
    authMiddleware.verifyToken,
    commentController.likeCommentById
  );
  app.patch(
    "/merny/api/v1/auth/unlikeComment/:id",
    authMiddleware.verifyToken,
    commentController.unlikeCommentById
  );
  app.delete(
    "/merny/api/v1/auth/deleteComment/:id",
    authMiddleware.verifyToken,
    commentController.deleteCommentById
  );
  app.get(
    "/merny/api/v1/auth/getComments/:id",
    authMiddleware.verifyToken,
    commentController.getCommentsByPostId
  );
};
