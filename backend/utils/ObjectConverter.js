exports.userResponse = (users) => {
  var userResponse = [];
  users.forEach((user) => {
    userResponse.push({
      userId: user._id,
      fullName: user.fullName,
      username: user.username,
      avatar: user.avatar,
    });
  });
  return userResponse;
};
