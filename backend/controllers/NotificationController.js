const notificationModel = require("../models/notificationModel");
const userModel = require("../models/userModel");
//Function to create notification
exports.createNotification = async (req, res) => {
  try {
    const username = req.username;
    const user = await userModel.findOne({ username });

    const newNotification = {
      user: user._id,
      recipients: req.body.recipients, // Array of recipient IDs
      url: req.body.url,
      text: req.body.text,
    };

    const notification = await notificationModel.create(newNotification);

    res.status(200).send({ notification });
  } catch (err) {
    res.status(500).send({
      message: `Error while creating notification: ${err}`,
    });
  }
};

exports.removeNotification = async (req, res) => {
  try {
    const id = req.params.id;

    const notification = await notificationModel.findByIdAndDelete(id);

    res.status(200).send({ msg: "Notification removed", notification });
  } catch (err) {
    res.status(500).send({
      message: `${err} while creating notification`,
    });
  }
};

exports.findAllNotificationForUser = async (req, res) => {
  try {
    const username = req.username;
    const user = await userModel.findOne({ username });

    const notifications = await notificationModel
      .find({ recipients: user._id })
      .populate("user", "avatar username");

    res.status(200).send({ notifications });
  } catch (err) {
    res.status(500).send({
      message: `Error while fetching notifications: ${err}`,
    });
  }
};

exports.updateNotificationReadStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const username = req.username;
    const user = await userModel.findOne({ username });

    const notification = await notificationModel.findById(id);

    if (!notification) {
      return res.status(404).send({ message: "Notification not found." });
    }

    // Ensure the user making the request is one of the recipients
    if (!notification.recipients.includes(user._id)) {
      return res
        .status(403)
        .send({ message: "You are not allowed to update this notification." });
    }

    // Update isRead status to true
    notification.isRead = true;
    await notification.save();

    res.status(200).send({ notifications: notification });
  } catch (err) {
    res.status(500).send({
      message: `Error while updating notification status: ${err}`,
    });
  }
};
exports.deleteAllNotifications = async (req, res) => {
  try {
    const username = req.username;
    const user = await userModel.findOne({ username });

    if (!user) {
      return res.status(401).send({ msg: "Invalid Authentication." });
    }

    const deletedNotifications = await notificationModel.deleteMany({
      recipients: user._id,
    });

    res.status(200).send({ notifications: deletedNotifications });
  } catch (err) {
    res.status(500).send({
      message: `Error while deleting notifications: ${err}`,
    });
  }
};
