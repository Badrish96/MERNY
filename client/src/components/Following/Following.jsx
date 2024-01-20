import React, { useEffect, useState } from "react";
import axios from "axios";

import profilePic from "../../images/Screenshot 2024-01-07 163823.png";
import "./following.css";
import CloseIcon from "@mui/icons-material/Close";

function Following({ followingUsers, onClose }) {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const fetchFollowedUsers = async () => {
      try {
        const token = window.localStorage.getItem("x-auth-token");
        const response = await axios.get(
          "http://localhost:8000/merny/api/v1/auth/getFollowingUsers",
          {
            headers: {
              "x-auth-token": token,
            },
          }
        );

        if (response.data.users && Array.isArray(response.data.users)) {
          const followedUserIds = response.data.users.map((user) => user._id);
          setFollowedUsers(followedUserIds);
        } else {
          console.error("Invalid data structure:", response.data);
        }
      } catch (error) {
        console.error("Error fetching followed users:", error);
      }
    };

    fetchFollowedUsers();
  }, [followingUsers]);

  useEffect(() => {
    // Retrieve the user information from local storage
    const user = JSON.parse(localStorage.getItem("user"));
    setLoggedInUser(user);
  }, []);

  const handleFollowUser = async (userId) => {
    try {
      const token = window.localStorage.getItem("x-auth-token");
      const response = await axios.patch(
        `http://localhost:8000/merny/api/v1/auth/followUser/${userId}`,
        {},
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      // Log the entire response object
      console.log("Follow User Response:", response);

      // Handle success, you may want to update the UI accordingly
      console.log(`Successfully followed user with ID: ${userId}`);

      // Update the followedUsers state to include the newly followed user
      setFollowedUsers((prevFollowedUsers) => [...prevFollowedUsers, userId]);
    } catch (error) {
      console.error(`Error following user with ID ${userId}`, error);
    }
  };

  const handleUnfollowUser = async (userId) => {
    const token = window.localStorage.getItem("x-auth-token");
    try {
      const response = await axios.patch(
        `http://localhost:8000/merny/api/v1/auth/unfollowUser/${userId}`,
        {},
        {
          headers: {
            "x-auth-token": token,
          },
        }
      );

      // Log the entire response object
      console.log("Unfollow User Response:", response);

      // Handle success, you may want to update the UI accordingly
      console.log(`Successfully unfollowed user with ID: ${userId}`);

      // Update the followedUsers state to exclude the unfollowed user
      setFollowedUsers(followedUsers.filter((id) => id !== userId));

      // Update the isFollowing state
      setIsFollowing(false);
    } catch (error) {
      console.error(`Error unfollowing user with ID ${userId}`, error);
    }
  };

  return (
    <div className="following-modal">
      <div className="following_heading">
        <div>
          <h6>Following</h6>
        </div>
        <div onClick={onClose}>
          <CloseIcon sx={{ cursor: "pointer", marginBottom: "10px" }} />
        </div>
      </div>
      <hr />
      <div className="following-content">
        {followingUsers &&
          followingUsers.map((user) => (
            <div key={user._id} className="following-user">
              <div className="following_info">
                <img
                  src={user.avatar || profilePic}
                  alt="profilePic"
                  className="profilePic"
                />
                <div className="user-details">
                  <a href="#">{user.username}</a>
                  <div>
                    <a href="#">{user.fullName}</a>
                  </div>
                </div>
              </div>
              <div>
                {followedUsers.includes(user.userId) ||
                (loggedInUser && loggedInUser.userId === user.userId) ? (
                  <button
                    className="unfollow_button"
                    onClick={() => {
                      console.log("User ID to unfollow:", user._id); // Change here
                      handleUnfollowUser(user._id); // Change here
                    }}
                  >
                    Unfollow
                  </button>
                ) : (
                  <button
                    className="follow_button"
                    onClick={() => {
                      console.log("User ID to follow:", user._id); // Change here
                      handleFollowUser(user._id); // Change here
                    }}
                  >
                    Follow
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default Following;
